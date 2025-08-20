import type { NextApiRequest, NextApiResponse } from 'next';
import { safeImportFirebase, safeImportSupabase } from '../../lib/dynamic-imports';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { id, title, thumbnail } = req.body || {};
  if (!id || !title) return res.status(400).json({ error: 'Missing id/title' });

  const provider = process.env.LEADERBOARD_PROVIDER || 'supabase'; // 'supabase' | 'firestore'

  try {
    if (provider === 'firestore') {
      try {
        // 使用安全的动态导入
        const firebaseModule = await safeImportFirebase();
        if (!firebaseModule) {
          throw new Error('Firebase module not available');
        }
        const { getDb } = firebaseModule;
        const { doc, getDoc, setDoc, updateDoc, increment } = await import('firebase/firestore');
        
        const db = getDb();
        const ref = doc(db, 'leaderboard', String(id));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          await updateDoc(ref, { plays: increment(1), title, thumbnail });
        } else {
          await setDoc(ref, { plays: 1, title, thumbnail });
        }
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        // 如果 Firebase 失败，回退到 Supabase
        const supabaseModule = await safeImportSupabase();
        if (!supabaseModule) throw new Error('Neither Firebase nor Supabase configured');
        const { supabase } = supabaseModule;
        if (!supabase) throw new Error('Supabase not configured');
        const { error } = await supabase.from('leaderboard').upsert(
          { id: String(id), title, thumbnail, plays: 1 },
          { onConflict: 'id', ignoreDuplicates: false }
        ).select();
        if (error) throw error;
        await supabase.rpc('inc_play', { gid: String(id) }).catch(()=>{});
      }
    } else {
      // 使用安全的动态导入
      const supabaseModule = await safeImportSupabase();
      if (!supabaseModule) throw new Error('Supabase module not available');
      const { supabase } = supabaseModule;
      
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
