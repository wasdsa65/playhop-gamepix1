import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { id, title, thumbnail } = req.body || {};
  if (!id || !title) return res.status(400).json({ error: 'Missing id/title' });

  const provider = process.env.LEADERBOARD_PROVIDER || 'supabase'; // 'supabase' | 'firestore'

  try {
    if (provider === 'firestore') {
      const db = getDb();
      const ref = doc(db, 'leaderboard', String(id));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { plays: increment(1), title, thumbnail });
      } else {
        await setDoc(ref, { plays: 1, title, thumbnail });
      }
    } else {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('leaderboard').upsert(
        { id: String(id), title, thumbnail, plays: 1 },
        { onConflict: 'id', ignoreDuplicates: false }
      ).select();
      if (error) throw error;
      // increment plays
      await supabase.rpc('inc_play', { gid: String(id) }).catch(()=>{});
    }
    res.status(200).json({ ok: true });
  } catch (e:any) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
