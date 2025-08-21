import React, { useMemo } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Gamepad2, Play, ExternalLink, Moon, Sun, Filter, Loader2, ChevronDown, Languages } from 'lucide-react';
import { LanguageProvider, useI18n } from '../components/Language';
import Leaderboard, { bumpPlayRemote } from '../components/Leaderboard';
import AdSlot from '../components/AdSlot';
import clsx from 'clsx';

type Game = { id: string; title: string; category?: string; thumb?: string; url: string; tags?: string[]; rating?: number };

type Props = {
  initial: { games: Game[]; page: number; totalPages: number };
  sid: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const sid = process.env.GAMEPIX_SID || '49715';
  const pagination = Number(process.env.GAMEPIX_PAGE_SIZE || 24);
  const page = 1;
  const apiUrl = `https://feeds.gamepix.com/v2/json?sid=${sid}&pagination=${pagination}&page=${page}`;
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const list = (data.games || []).map((g: any) => ({
      id: String(g.id),
      title: g.title,
      category: g.category || 'Other',
      thumb: g.thumb,
      url: g.url,
      tags: g.tags || g.labels || [],
      rating: typeof g.rating === 'number' ? g.rating : (typeof g.quality === 'number' ? g.quality : undefined),
    }));
    return { props: { initial: { games: list, page, totalPages: data.total_pages || 1 }, sid } };
  } catch (e) {
    return { props: { initial: { games: [], page, totalPages: 1 }, sid } };
  }
};

function HomeContent({ 
  dark, setDark, games, page, totalPages, loading, q, setQ, category, setCategory, 
  open, setOpen, current, setCurrent, ratingMin, setRatingMin, tag, setTag, 
  onPlay, loadMore, filtered, dailyPicks, tagSet, sid, t, lang, setLang
}: {
  dark: boolean, setDark: (v: boolean) => void, games: Game[], page: number, totalPages: number, loading: boolean,
  q: string, setQ: (v: string) => void, category: string, setCategory: (v: string) => void,
  open: boolean, setOpen: (v: boolean) => void, current: Game | null, setCurrent: (v: Game | null) => void,
  ratingMin: number, setRatingMin: (v: number) => void, tag: string, setTag: (v: string) => void,
  onPlay: (game: Game) => void, loadMore: () => void, filtered: Game[], dailyPicks: Game[], tagSet: string[], sid: string,
  t: (key: string) => string, lang: 'en'|'zh', setLang: (l: 'en'|'zh') => void
}) {
  const categories = useMemo(() => {
    const set = new Set(['All', ...games.map(g => g.category || 'Other')]);
    return Array.from(set);
  }, [games]);

  return (
    <>
      <Head>
        <title>GamePix Arcade</title>
        <meta name="description" content="Play top HTML5 games via GamePix. SSR, i18n, daily picks and leaderboard." />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'} />
      </Head>

      <Navbar dark={dark} setDark={setDark} q={q} setQ={setQ} category={category} setCategory={setCategory} categories={categories} lang={lang} setLang={setLang} t={t} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{t('dailyPicks')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {dailyPicks.map(g => (
              <button key={g.id} onClick={()=>onPlay(g)} className="group rounded-2xl overflow-hidden border hover:shadow-md transition">
                <div className="aspect-square overflow-hidden">
                  <img src={g.thumb || ''} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="px-2 py-1 text-xs line-clamp-1">{g.title}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Filters panel */}
        <div className="mb-4 grid gap-2 md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-2xl border px-2 py-1">
            <Search className="h-4 w-4" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} className="bg-transparent outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border px-2 py-1">
            <Filter className="h-4 w-4 opacity-70" />
            <select value={category} onChange={(e)=>setCategory(e.target.value)} className="bg-transparent text-sm outline-none w-full">
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border px-2 py-1">
            <span className="text-sm">⭐ {t('rating')} ≥</span>
            <input type="number" min={0} max={100} step={1} value={ratingMin} onChange={(e)=>setRatingMin(parseInt(e.target.value||'0'))} className="bg-transparent outline-none text-sm w-full" />
            <span className="text-xs opacity-70">(若数据提供)</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border px-2 py-1">
            <span className="text-sm">🏷 {t('tags')}</span>
            <select value={tag} onChange={(e)=>setTag(e.target.value)} className="bg-transparent text-sm outline-none w-full">
              <option value="">{t('all')}</option>
              {tagSet.map((t)=> <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="group relative overflow-hidden rounded-2xl border hover:shadow-md transition">
              <div className="aspect-video w-full overflow-hidden">
                <img src={g.thumb || ''} alt={g.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-2 flex items-center justify-between">
                <div className="text-sm line-clamp-1">{g.title}</div>
                <button onClick={()=>onPlay(g)} className="rounded-xl text-xs px-2 py-1 border"><Play className="inline-block h-3 w-3 mr-1" /> {t('play')}</button>
              </div>
              {typeof g.rating === 'number' && <div className="absolute top-2 right-2 rounded-full bg-black/70 text-white text-xs px-2 py-0.5">⭐ {g.rating}</div>}
            </div>
          ))}
        </div>

        {/* Load more */}
        {page < totalPages && (
          <div className="mt-6 flex justify-center">
            <button onClick={loadMore} disabled={loading} className="rounded-2xl border px-4 py-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : <ChevronDown className="h-4 w-4 inline-block mr-1" />}
              Load more
            </button>
          </div>
        )}

        {/* Side widgets */}
        <section className="mt-10 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 grid gap-4">
            <AdSlot title="公告 / 活动" />
            <AdSlot title="广告位 A" />
          </div>
          <div className="grid gap-4">
            <Leaderboard />
            <AdSlot title="广告位 B" />
          </div>
        </section>
      </main>

      <PlayerModal open={open} game={current} onClose={()=>setOpen(false)} t={t} />

      <footer className="mt-16 border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm opacity-70">
          © {new Date().getFullYear()} GamePix Arcade · SSR + i18n + Daily Picks + Leaderboard
        </div>
      </footer>
    </>
  );
}

function Navbar({ dark, setDark, q, setQ, category, setCategory, categories, lang, setLang, t }:
  { dark:boolean,setDark:(v:boolean)=>void,q:string,setQ:(v:string)=>void,category:string,setCategory:(v:string)=>void,categories:string[],lang:'en'|'zh',setLang:(l:'en'|'zh')=>void, t:(key:string)=>string }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/90 dark:bg-zinc-900/90 border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Gamepad2 className="h-6 w-6" />
          <span>{t('title')}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-2xl border px-2 py-1">
            <Search className="h-4 w-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="bg-transparent outline-none text-sm w-56"
            />
            <Filter className="h-4 w-4 opacity-70" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button onClick={() => setDark(!dark)} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1">
              <Languages className="h-5 w-5" />
              <span className="text-sm">{lang.toUpperCase()}</span>
            </button>
            <div className="absolute right-0 mt-2 w-28 rounded-2xl border bg-white dark:bg-zinc-900 p-2 shadow">
              <button className={clsx('w-full text-left px-2 py-1 rounded-xl text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800', lang==='zh'&&'font-semibold')}
                      onClick={()=>setLang('zh')}>中文</button>
              <button className={clsx('w-full text-left px-2 py-1 rounded-xl text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800', lang==='en'&&'font-semibold')}
                      onClick={()=>setLang('en')}>English</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function PlayerModal({ open, game, onClose, t }:{open:boolean, game:Game|null, onClose:()=>void, t:(key:string)=>string}){
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="relative w-full max-w-5xl rounded-2xl bg-white dark:bg-zinc-900 shadow-xl overflow-hidden" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2"><Gamepad2 className="h-5 w-5" /><span className="font-medium">{game?.title}</span></div>
              <div className="flex items-center gap-2">
                <a href={game?.url} target="_blank" rel="noreferrer" className="text-sm inline-flex items-center gap-1 underline">{t('openNewTab')} <ExternalLink className="h-4 w-4" /></a>
                <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">✕</button>
              </div>
            </div>
            <div className="aspect-video w-full">{game ? <iframe title={game.title} src={game.url} className="h-full w-full" frameBorder="0" scrolling="no" allow="autoplay; fullscreen"/> : <div className="h-full w-full flex items-center justify-center text-sm opacity-70">No game</div>}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HomeWithI18n({ initial, sid }: Props) {
  const { t, lang, setLang } = useI18n();
  
  const [dark, setDark] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>(initial.games);
  const [page, setPage] = React.useState(initial.page || 1);
  const [totalPages, setTotalPages] = React.useState(initial.totalPages || 1);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [category, setCategory] = React.useState('All');
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<Game|null>(null);
  const [ratingMin, setRatingMin] = React.useState<number>(0);
  const [tag, setTag] = React.useState<string>('');

  React.useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  const categories = useMemo(() => {
    const set = new Set(['All', ...games.map(g => g.category || 'Other')]);
    return Array.from(set);
  }, [games]);

  const tagSet = useMemo(() => {
    const s = new Set<string>();
    games.forEach(g => (g.tags||[]).forEach((t:string)=>s.add(t)));
    return Array.from(s);
  }, [games]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return games.filter(g => {
      const matchQ = kw ? g.title.toLowerCase().includes(kw) || (g.category||'').toLowerCase().includes(kw) : true;
      const matchC = category === 'All' ? true : (g.category||'Other') === category;
      const matchR = typeof g.rating === 'number' ? g.rating >= ratingMin : true; // only filter if rating exists
      const matchT = tag ? (g.tags||[]).includes(tag) : true;
      return matchQ && matchC && matchR && matchT;
    });
  }, [games, q, category, ratingMin, tag]);

  const todayKey = new Date().toISOString().slice(0,10);
  const dailyPicks = useMemo(() => {
    const seed = Array.from(todayKey).reduce((a,c)=>a+c.charCodeAt(0),0);
    const arr = [...games];
    for (let i=arr.length-1;i>0;i--){ const j = (seed + i*31) % (i+1); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.slice(0,8);
  }, [games, todayKey]);

  async function loadMore() {
    if (loading || page >= totalPages) return;
    setLoading(true);
    const pagination = Number(process.env.NEXT_PUBLIC_GAMEPIX_PAGE_SIZE || 24);
    const url = `https://feeds.gamepix.com/v2/json?sid=${sid}&pagination=${pagination}&page=${page+1}`;
    try{
      const res = await fetch(url);
      const data = await res.json();
      const list: Game[] = (data.games || []).map((g:any)=>({
        id: String(g.id), title: g.title, category: g.category || 'Other', thumb: g.thumb, url: g.url,
        tags: g.tags || g.labels || [], rating: typeof g.rating === 'number' ? g.rating : (typeof g.quality === 'number' ? g.quality : undefined),
      }));
      setGames(prev => [...prev, ...list]);
      setPage(prev => prev + 1);
      setTotalPages(data.total_pages || totalPages);
    } finally { setLoading(false); }
  }

  function onPlay(game: Game) { setCurrent(game); setOpen(true); bumpPlayRemote(game.id, game.title, game.thumb); }

  return (
    <HomeContent 
      dark={dark} 
      setDark={setDark} 
      games={games} 
      page={page} 
      totalPages={totalPages} 
      loading={loading} 
      q={q} 
      setQ={setQ} 
      category={category} 
      setCategory={setCategory} 
      open={open} 
      setOpen={setOpen} 
      current={current} 
      setCurrent={setCurrent} 
      ratingMin={ratingMin} 
      setRatingMin={setRatingMin} 
      tag={tag} 
      setTag={setTag} 
      onPlay={onPlay} 
      loadMore={loadMore} 
      filtered={filtered} 
      dailyPicks={dailyPicks} 
      tagSet={tagSet} 
      sid={sid}
      t={t}
      lang={lang}
      setLang={setLang}
    />
  );
}

export default function Home({ initial, sid }: Props) {
  return (
    <LanguageProvider initial="zh">
      <HomeWithI18n initial={initial} sid={sid} />
    </LanguageProvider>
  );
}
