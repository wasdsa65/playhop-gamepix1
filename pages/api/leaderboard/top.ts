import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const provider = process.env.LEADERBOARD_PROVIDER || 'supabase'; // 'supabase' | 'firestore'
  const n = Number(req.query.n || 10);

  try {
    if (provider === 'firestore') {
      // 动态导入 firebase 相关模块
      const { getDb } = await import('../../lib/firebase');
      const { collection, getDocs, orderBy, limit, query } = await import('firebase/firestore');
      
      const db = getDb();
      const q = query(collection(db, 'leaderboard'), orderBy('plays', 'desc'), limit(n));
      const snap = await getDocs(q);
      const items: any[] = [];
      snap.forEach(doc=> items.push({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ items });
    } else {
      // 动态导入 supabase 相关模块
      const { supabase } = await import('../../lib/supabase');
      
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase.from('leaderboard')
        .select('*').order('plays', { ascending: false }).limit(n);
      if (error) throw error;
      return res.status(200).json({ items: data || [] });
    }
  } catch (e:any) {
    return res.status(500).json({ error: e.message });
  }
}
