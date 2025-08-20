import React, { useEffect, useState } from 'react';

type Score = { id: string; title: string; plays: number; thumbnail?: string };
export function bumpPlayRemote(id:string, title:string, thumbnail?:string){
  fetch('/api/leaderboard/play', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, title, thumbnail }) });
}
export default function Leaderboard(){
  const [items, setItems] = useState<Score[]>([]);
  useEffect(()=>{ fetch('/api/leaderboard/top?n=10').then(r=>r.json()).then(d=> setItems(d.items||[])).catch(()=>{}); },[]);
  return <div className="rounded-2xl border p-4">
    <div className="text-sm font-medium mb-3">排行榜</div>
    {items.length===0 ? <div className="text-xs opacity-70">暂无数据。</div> :
      <ul className="space-y-2">{items.map((it,idx)=>(
        <li key={it.id} className="flex items-center gap-2 text-sm">
          <span className="w-5 text-right">{idx+1}.</span>
          {it.thumbnail ? <img src={it.thumbnail} className="w-8 h-8 rounded object-cover"/> : <div className="w-8 h-8 rounded bg-zinc-200"/>}
          <span className="flex-1 line-clamp-1">{it.title}</span>
          <span className="opacity-70 text-xs">{it.plays}</span>
        </li>
      ))}</ul>
    }
  </div>;
}
