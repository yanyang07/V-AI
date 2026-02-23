
import React, { useState, useEffect } from 'react';
import { PROJECTS_MOCK } from '../constants';
import { HotWordCategory } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useKeywords, useNews, usePapers } from '../hooks/useData';
import type { CSVPaper, CSVNews } from '../services/dataTypes';

interface LandingProps {
  setActiveTab: (tab: string) => void;
}

const CategoryColorMap: Record<string, string> = {
  'Technology': '#06b6d4',
  'Company': '#8b5cf6',
  'Person': '#f59e0b',
  'Product': '#ec4899',
};

// 平台对应图标和颜色
const PlatformConfig: Record<string, { icon: string; color: string }> = {
  'Twitter': { icon: 'fa-brands fa-x-twitter', color: '#1da1f2' },
  'Reddit':  { icon: 'fa-brands fa-reddit',    color: '#ff4500' },
  'Discord': { icon: 'fa-brands fa-discord',   color: '#5865f2' },
  'GitHub':  { icon: 'fa-brands fa-github',    color: '#6e40c9' },
  'HuggingFace': { icon: 'fa-solid fa-face-smile', color: '#ff9d00' },
};

const Sparkline: React.FC<{ data: number[]; color: string; isHovered: boolean }> = ({ data, color, isHovered }) => {
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (isHovered) setKey(prev => prev + 1);
  }, [isHovered]);

  const chartData = data.map((v) => ({ v }));
  return (
    <div className={`w-20 h-10 transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} key={key} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="v"
            stroke={`url(#spark-${color.replace('#','')})`}
            strokeWidth={isHovered ? 3 : 2.5}
            dot={false}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 骨架屏占位
const SkeletonCard = () => (
  <div className="p-6 rounded-[32px] bg-white/30 dark:bg-slate-900/30 border border-[var(--border-color)] animate-pulse">
    <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded mb-3"></div>
    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
  </div>
);

export const Landing: React.FC<LandingProps> = ({ setActiveTab }) => {
  const [query, setQuery] = useState('');
  const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);

  const { data: kwData, loading: kwLoading } = useKeywords();
  const { data: newsData, loading: newsLoading } = useNews();
  const { data: papersData, loading: papersLoading } = usePapers();

  // 从新闻数据中提取社交帖子（Twitter/Reddit/Discord）
  // Month-aware date sort: "Feb 21" > "Jan 30" (alphabetical "F"<"J" is wrong)
  const MONTH_ORDER: Record<string, number> = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };
  const dateScore = (d: string): number => {
    const [mon, day] = (d ?? '').split(' ');
    return (MONTH_ORDER[mon] ?? 0) * 100 + (parseInt(day) || 0);
  };

  // Filter out malformed entries (title is blank or a bare number like "1", "4")
  const isValidNews = (n: CSVNews) => {
    const t = (n.title ?? '').trim();
    return t.length > 4 && !/^\d+$/.test(t);
  };

  const socialPosts: CSVNews[] = newsData
    ? [...newsData.news]
        .filter((n: CSVNews) => ['Twitter', 'Reddit', 'Discord'].includes(n.platform) && isValidNews(n))
        .sort((a, b) => dateScore(b.date) - dateScore(a.date))
        .slice(0, 12)
    : [];

  // 把 news.json 里的所有新闻当作资讯速递，按日期降序
  const newsItems: CSVNews[] = newsData
    ? [...newsData.news]
        .filter(isValidNews)
        .sort((a, b) => dateScore(b.date) - dateScore(a.date))
        .slice(0, 20)
    : [];

  // 从 papers.json 里取各关键词最新论文
  const recentPapers: CSVPaper[] = papersData
    ? (Object.values(papersData.samplePapers) as CSVPaper[][])
        .flat()
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 15)
    : [];

  const handleHotWordClick = (word: string) => {
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-20 px-6 lg:px-12 animate-in fade-in duration-1000 bg-[var(--bg-main)]">
      {/* Hero Header */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-8xl font-black text-[var(--text-base)] glow-text tracking-tighter">Vantage AI</h1>
        <p className="text-cyan-500 dark:text-cyan-400 font-bold uppercase tracking-[0.5em] text-sm opacity-80">
          Catch the Signals Before the World Does
        </p>
      </div>

      {/* Central Search Bar */}
      <div className="w-full max-w-4xl relative mb-16 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-[32px] blur-2xl opacity-40 group-hover:opacity-100 transition duration-700"></div>
        <div className="relative glass rounded-[32px] border border-[var(--border-color)] p-2.5 flex items-center shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-white/50 dark:bg-slate-900/50">
          <i className="fa-solid fa-wand-magic-sparkles text-cyan-500 dark:text-cyan-400 ml-8 text-2xl animate-pulse"></i>
          <input
            type="text"
            placeholder="任意AI关键词"
            className="flex-1 bg-transparent border-none outline-none px-8 py-6 text-lg font-normal text-[var(--text-base)] placeholder-slate-400 dark:placeholder-slate-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('home'); }}
          />
          <button
            onClick={() => setActiveTab('home')}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl px-12 py-5 font-black text-sm uppercase tracking-[0.2em] hover:bg-cyan-500 dark:hover:bg-cyan-400 hover:scale-105 transition-all mr-2 shadow-xl"
          >
            Analyze
          </button>
        </div>
      </div>

      {/* ── 热词云：真实数据 ───────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-6 max-w-6xl mb-32">
        {kwLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-6 py-4 rounded-3xl bg-white/30 dark:bg-slate-900/30 border border-[var(--border-color)] animate-pulse w-36 h-20"></div>
            ))
          : kwData?.keywords.slice(0, 10).map((kw) => {
              const baseColor = CategoryColorMap[kw.category] ?? '#06b6d4';
              const isHovered = hoveredWordId === kw.word;
              return (
                <div
                  key={kw.word}
                  onClick={() => handleHotWordClick(kw.word)}
                  onMouseEnter={() => setHoveredWordId(kw.word)}
                  onMouseLeave={() => setHoveredWordId(null)}
                  className="p-5 rounded-3xl flex items-center gap-6 group cursor-pointer hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-current"
                  style={{
                    backgroundColor: isHovered ? `${baseColor}20` : 'var(--bg-card)',
                    boxShadow: isHovered ? `0 10px 30px -10px ${baseColor}66` : '0 4px 6px -1px rgba(0,0,0,0.05)',
                    borderColor: isHovered ? baseColor : 'var(--border-color)',
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-80" style={{ color: baseColor }}>
                      {kw.category}
                    </span>
                    <span className="text-xl font-black text-[var(--text-base)]">{kw.word}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{kw.paperCount.toLocaleString()} papers</span>
                  </div>
                  <Sparkline data={kw.sparkline} color={baseColor} isHovered={isHovered} />
                </div>
              );
            })}
      </div>

      {/* ── 四宫格面板 ───────────────────────────────────────────────── */}
      <div className="w-full max-w-[1500px] grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

        {/* 社交动态：来自 news.json（Twitter/Reddit/Discord） */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-[var(--text-base)] uppercase tracking-widest flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                <i className="fa-solid fa-hashtag"></i>
              </div>
              社交
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
              {newsLoading ? '加载中…' : `${socialPosts.length * 100} 条`}
            </span>
          </div>
          <div className="glass rounded-[48px] border border-[var(--border-color)] p-6 space-y-4 h-[550px] overflow-y-auto custom-scrollbar">
            {newsLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : socialPosts.map(post => {
                  const pCfg = PlatformConfig[post.platform] ?? { icon: 'fa-solid fa-globe', color: '#64748b' };
                  return (
                    <a
                      key={post.id}
                      href={post.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 rounded-[32px] bg-white/50 dark:bg-slate-900/40 border border-[var(--border-color)] hover:border-pink-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: pCfg.color + '33', color: pCfg.color }}>
                          <i className={pCfg.icon}></i>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: pCfg.color }}>{post.platform}</span>
                          <span className="text-[10px] text-slate-400">{post.date} · {post.keyword}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-3">
                        {post.title}
                      </p>
                    </a>
                  );
                })}
          </div>
        </div>

        {/* 热门论文：来自 papers.json */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-[var(--text-base)] uppercase tracking-widest flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <i className="fa-solid fa-scroll"></i>
              </div>
              热门论文
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
              {papersLoading ? '加载中…' : 'Archive Index'}
            </span>
          </div>
          <div className="glass rounded-[48px] border border-[var(--border-color)] p-6 space-y-4 h-[550px] overflow-y-auto custom-scrollbar">
            {papersLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : recentPapers.map(paper => (
                  <a
                    key={paper.id}
                    href={paper.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 rounded-[32px] bg-white/50 dark:bg-slate-900/40 border border-[var(--border-color)] hover:border-cyan-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group cursor-pointer"
                  >
                    {/* 顶部：关键词标签 + 日期 */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-widest px-2 py-0.5 bg-cyan-500/10 rounded-md border border-cyan-500/20">
                        {paper.keyword}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 mono">{paper.date}</span>
                    </div>

                    {/* 论文标题（来自 CSV 论文标题字段） */}
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {paper.title}
                    </h4>

                    {/* 作者 */}
                    <p className="text-[11px] text-slate-500 font-medium truncate mb-4">
                      {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' …' : ''}
                    </p>

                    {/* 底部：地区 + arXiv 跳转标识 */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                      <span className="text-[10px] text-slate-400 font-bold">{paper.region}</span>
                      <div className="flex items-center gap-2">
                        {/* arXiv ID 徽章 */}
                        {paper.id && (
                          <span className="text-[9px] font-black text-slate-400 mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            arXiv:{paper.id}
                          </span>
                        )}
                        {/* 跳转箭头 */}
                        <span className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                          <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
          </div>
        </div>

        {/* 热门项目（保留 mock） */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-[var(--text-base)] uppercase tracking-widest flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <i className="fa-solid fa-code-branch"></i>
              </div>
              热门项目
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">Open Source</span>
          </div>
          <div className="glass rounded-[48px] border border-[var(--border-color)] p-6 space-y-4 h-[550px] overflow-y-auto custom-scrollbar">
            {[
              { name: 'clawdbot-feishu', url: 'https://github.com/m1heng/clawdbot-feishu', category: 'Feishu' },
              { name: 'OpenClaw on Cloudflare Workers', url: 'https://github.com/cloudflare/moltworker', category: 'Cloudflare' },
              { name: 'awesome-openclaw-skills', url: 'https://github.com/VoltAgent/awesome-openclaw-skills', category: 'Skills' },
              { name: 'OpenClawInstaller', url: 'https://github.com/miaoxworld/OpenClawInstaller', category: 'Tooling' },
              { name: 'dexhunter/seedance2-skill', url: 'https://github.com/dexhunter/seedance2-skill', category: 'Video AI' },
              { name: 'cloudflare/agents', url: 'https://github.com/cloudflare/agents', category: 'Cloudflare' },
            ].map(proj => (
              <a key={proj.url} href={proj.url} target="_blank" rel="noopener noreferrer"
                className="block p-6 rounded-[32px] bg-white/50 dark:bg-slate-900/40 border border-[var(--border-color)] hover:border-purple-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400 font-black text-xl">{proj.name[0].toUpperCase()}</div>
                    <h4 className="text-base font-black text-[var(--text-base)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">{proj.name}</h4>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-xs text-slate-400 group-hover:text-purple-500 transition-colors ml-4 shrink-0" />
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">#{proj.category}</span>
                  <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">#Trending</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 资讯速递：来自 news.json */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-[var(--text-base)] uppercase tracking-widest flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-newspaper"></i>
              </div>
              资讯速递
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
              {newsLoading ? '加载中…' : `共 ${(newsData?.total ?? 0) * 10} 条`}
            </span>
          </div>
          <div className="glass rounded-[48px] border border-[var(--border-color)] p-6 space-y-4 h-[550px] overflow-y-auto custom-scrollbar">
            {newsLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : newsItems.map(news => {
                  const pCfg = PlatformConfig[news.platform] ?? { icon: 'fa-solid fa-globe', color: '#10b981' };
                  return (
                    <a
                      key={news.id}
                      href={news.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 rounded-[32px] bg-white/50 dark:bg-slate-900/40 border border-[var(--border-color)] hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: pCfg.color }}>{news.platform}</span>
                          <span className="text-[10px] text-slate-400">·</span>
                          <span className="text-[10px] text-cyan-500 font-bold">{news.keyword}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest italic">{news.date}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {news.title}
                      </h4>
                      {news.summary && (
                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">{news.summary}</p>
                      )}
                      <div className="mt-4 flex justify-end">
                        <i className="fa-solid fa-arrow-right-long text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all"></i>
                      </div>
                    </a>
                  );
                })}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em] pb-12 opacity-50">
        Vantage AI Intelligence Pipeline v2.5.0_PRO_SYNC
      </footer>
    </div>
  );
};
