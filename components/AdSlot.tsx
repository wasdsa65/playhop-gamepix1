import React from 'react';
export default function AdSlot({ title='Ad', html, className='' }:{ title?:string; html?:string; className?:string }){
  return <div className={`rounded-2xl border p-4 ${className}`}>
    <div className="text-sm font-medium mb-2">{title}</div>
    {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <div className="text-xs opacity-70">占位广告位（在 _document.tsx 注入脚本或在此传入 html）。</div>}
  </div>;
}
