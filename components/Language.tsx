import React, { createContext, useContext, useState, useMemo } from 'react';
type Dict = Record<string, Record<string, string>>;
const DICT: Dict = {
  en: { title:'My GamePix Arcade', searchPlaceholder:'Search games or categories...', all:'All', loading:'Loading...', loadMore:'Load more', results:'games', openNewTab:'Open in new tab', dailyPicks:'Daily Picks', leaderboard:'Leaderboard', play:'Play', filters:'Filters', tags:'Tags', rating:'Rating', apply:'Apply', reset:'Reset' },
  zh: { title:'我的 GamePix 街机厅', searchPlaceholder:'搜索游戏、分类...', all:'全部', loading:'正在加载...', loadMore:'加载更多', results:'款游戏', openNewTab:'在新标签打开', dailyPicks:'每日精选', leaderboard:'排行榜', play:'开始', filters:'筛选', tags:'标签', rating:'评分', apply:'应用', reset:'重置' },
};
type LangCtx = { lang:'en'|'zh'; t:(k:keyof typeof DICT['en'])=>string; setLang:(l:'en'|'zh')=>void; };
const Ctx = createContext<LangCtx|null>(null);
export function LanguageProvider({ children, initial='zh' as any }){
  const [lang, setLang] = useState<'en'|'zh'>(initial);
  const value = useMemo(()=>({ lang, setLang, t:(k:keyof typeof DICT['en'])=>DICT[lang][k]||k }),[lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useI18n(){ const ctx = useContext(Ctx); if(!ctx) throw new Error('useI18n must be used within LanguageProvider'); return ctx; }
