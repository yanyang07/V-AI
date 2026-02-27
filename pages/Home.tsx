
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrendChart } from '../components/TrendChart';
import { KEYWORDS_LIST } from '../constants';
import { HotWordCategory } from '../types';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNews, useScholars, usePapers } from '../hooks/useData';
import type { CSVNews, CSVScholar } from '../services/dataTypes';
import { KeywordSwitcher } from '../components/KeywordSwitcher';

const CategoryColorMap: Record<HotWordCategory, string> = {
  'Technology': '#06b6d4', 
  'Company': '#a855f7',    
  'Person': '#f59e0b',     
  'Product': '#ec4899'     
};

// ── 关键词级别的 KPI 静态数据（来自真实 CSV 统计）─────────────────────────────
const KEYWORD_KPI: Record<string, {
  papers: number; papersGrowth: string;
  institutions: string;
  news: number;
}> = {
  'Seedance 2.0': {
    papers: 27,          // 2026年 Jan-Feb 实际论文数
    papersGrowth: '-35.7% YoY',  // Jan-Feb 2026 vs 2025
    institutions: '219', // Keyword_Paper_Map_v2 统计唯一机构数
    news: 38,            // News_Keyword_Map.csv 统计
  },
};

const MetricCard = ({ label, value, sub, color, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`glass p-6 rounded-3xl flex flex-col justify-between hover:-translate-y-1 transition-all ${onClick ? 'cursor-pointer hover:border-blue-500/40' : ''}`}
  >
    <div className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-3">{label}</div>
    <div className="flex items-end justify-between">
      <div className="text-3xl font-black text-[var(--text-base)]">{value}</div>
      <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'}`}>
        {sub}
      </div>
    </div>
  </div>
);

const RelatedWordsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  // Build hot-word display list from real KEYWORDS_LIST
  const enhancedHotWords = useMemo(() =>
    KEYWORDS_LIST.map((word, i) => ({
      id: `kw_${i}`,
      word,
      category: (['Technology', 'Product', 'Company', 'Technology'] as const)[i % 4],
      heat: 0.6 + (KEYWORDS_LIST.length - i) / KEYWORDS_LIST.length * 0.4,
      trend: [0,1,2,3,4].map(j => Math.round(60 + (KEYWORDS_LIST.length - i) * 3 + j * 5)),
      displayHeat: Math.round(20000 + (KEYWORDS_LIST.length - i) * 3000 + i * 200),
    }))
  , []);

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-[450px] z-[100] transition-transform duration-700 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="h-full bg-[var(--bg-glass)] backdrop-blur-3xl border-l border-[var(--border-color)] shadow-[-30px_0_60px_rgba(0,0,0,0.1)] dark:shadow-[-30px_0_60px_rgba(0,0,0,0.5)] p-10 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-[var(--primary)] border border-[var(--border-color)] shadow-sm">
              <i className="fa-solid fa-fire-flame-simple text-2xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-base)] tracking-tighter uppercase">情报关键词</h3>
              <p className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">Global Trend Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-base)] transition-colors">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        <div className="space-y-6">
          {enhancedHotWords.map((hw) => {
            const baseColor = CategoryColorMap[hw.category];
            return (
              <div key={hw.id} className="p-6 rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-blue-500/30 transition-all group shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5" style={{ color: baseColor }}>{hw.category}</span>
                    <h4 className="text-xl font-black text-[var(--text-base)] mt-2">{hw.word}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-[var(--text-dim)] font-black uppercase">Heat Index</div>
                    <div className="text-2xl font-black text-blue-600 dark:text-cyan-400 mono">{hw.displayHeat.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="h-24 w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hw.trend.map(v => ({ v }))}>
                      <defs>
                        <linearGradient id={`grad-${hw.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={baseColor} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={baseColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={baseColor} fill={`url(#grad-${hw.id})`} strokeWidth={4} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1"><i className="fa-solid fa-arrow-trend-up"></i> +{(hw.heat * 0.15).toFixed(1)}%</span>
                  <span>Impact Rank: Top 0.1%</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-10 pt-8 border-t border-[var(--border-color)] text-center">
           <div className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-[0.5em] opacity-40">
              Clawd Global Sync Nodes: ACTIVE
           </div>
        </div>
      </div>
    </div>
  );
};

// ─── Platform display config ─────────────────────────────────────────────────
const PlatformCfg: Record<string, { icon: string; color: string; bg: string }> = {
  Twitter:  { icon: 'fa-brands fa-x-twitter',  color: '#e2e8f0', bg: '#0f172a' },
  Reddit:   { icon: 'fa-brands fa-reddit-alien', color: '#ff4500', bg: '#fff1ec' },
  Discord:  { icon: 'fa-brands fa-discord',    color: '#5865f2', bg: '#eef0ff' },
  YouTube:  { icon: 'fa-brands fa-youtube',    color: '#ff0000', bg: '#fff0f0' },
  LinkedIn: { icon: 'fa-brands fa-linkedin',   color: '#0a66c2', bg: '#e8f4fd' },
};
const defaultPlatform = { icon: 'fa-solid fa-globe', color: '#64748b', bg: '#f8fafc' };

// ─── Extract institution names from raw string ────────────────────────────────
function parseInstitutions(raw: string): string[] {
  if (!raw) return [];
  const results: string[] = [];
  const parts = raw.split(',');
  let buf = '';
  for (const part of parts) {
    const trimmed = part.trim();
    buf = buf ? `${buf}, ${trimmed}` : trimmed;
    // Pattern "Xxx - Country" signals end of one institution entry
    if (/ - [A-Z]/.test(trimmed)) {
      const name = buf.substring(0, buf.lastIndexOf(' - ')).trim();
      if (name.length > 2) results.push(name);
      buf = '';
    }
  }
  if (buf.trim().length > 2) results.push(buf.trim());
  return results;
}

interface HomeProps {
  setActiveTab?: (tab: string) => void;
  initialKeyword?: string;
  onKeywordChange?: (kw: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab, initialKeyword, onKeywordChange }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chartMetric, setChartMetric] = useState('compositeIndex');
  const [activeKeyword, setActiveKeyword] = useState(initialKeyword ?? 'OpenClaw');

  // 当从 Landing 带着新关键词进入时，同步更新本地状态
  useEffect(() => {
    if (initialKeyword && initialKeyword !== activeKeyword) {
      setActiveKeyword(initialKeyword);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKeyword]);
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: newsData, loading: newsLoading } = useNews();
  const { data: scholarsData, loading: scholarsLoading } = useScholars();
  const { data: papersData } = usePapers();

  // Month-aware date comparator ("Feb 21" > "Jan 30"; plain string sort fails)
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

  // 社交媒体热议：按关键词过滤 + 日期降序
  const socialFeed: CSVNews[] = useMemo(
    () => [...(newsData?.news ?? [])]
      .filter(n => isValidNews(n) && n.keyword === activeKeyword)
      .sort((a, b) => dateScore(b.date) - dateScore(a.date)),
    [newsData, activeKeyword]
  );

  // 全球核心影响力学者：按关键词过滤 + 论文数降序
  const topScholars: CSVScholar[] = useMemo(() => {
    const all = scholarsData?.scholars ?? [];
    const filtered = all.filter(s =>
      s.keywords.some((k: string) => k.includes(activeKeyword))
    );
    return (filtered.length >= 10 ? filtered : all).slice(0, 50);
  }, [scholarsData, activeKeyword]);

  // 活跃机构：按关键词的论文过滤后聚合排序
  const institutionRanking = useMemo(() => {
    if (!papersData) return [];
    const keyPapers = papersData.samplePapers[activeKeyword] as any[] | undefined;
    const paperList = keyPapers?.length
      ? keyPapers
      : (Object.values(papersData.samplePapers) as any[][]).flat();
    const counts: Record<string, { papers: number; scholars: Set<string> }> = {};
    for (const paper of paperList) {
      const institutions = parseInstitutions(paper.institution);
      for (const inst of institutions) {
        if (!counts[inst]) counts[inst] = { papers: 0, scholars: new Set() };
        counts[inst].papers++;
        for (const author of paper.authors) counts[inst].scholars.add(author);
      }
    }
    return Object.entries(counts)
      .map(([name, { papers, scholars }]) => ({
        name, papers, scholars: scholars.size,
        score: papers * 1 + scholars.size * 0.5,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [papersData, activeKeyword]);

  const handleFundingClick = () => {
    setChartMetric('funding');
    if (chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-8 p-10 animate-in fade-in duration-1000 relative">
      <RelatedWordsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <KeywordSwitcher keywords={['OpenClaw', 'Seedance 2.0']} value={activeKeyword} onChange={(kw) => { setActiveKeyword(kw); onKeywordChange?.(kw); }} accent="cyan" />
              {/* Intelligence Dashboard label hidden */}
            </div>
            <div
              className="flex items-center gap-4 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl cursor-pointer group hover:scale-105 transition-all shadow-sm w-fit"
              onClick={() => setIsDrawerOpen(true)}
            >
              <i className="fa-solid fa-bolt-lightning text-blue-500 animate-pulse"></i>
              <span className="text-xs font-black text-[var(--text-base)] uppercase tracking-widest">关键情报洞察</span>
              <i className="fa-solid fa-chevron-right text-xs text-blue-300 group-hover:translate-x-1 transition-transform"></i>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-[0.4em] mb-1">DATA PIPELINE</div>
             <div className="text-xl font-black text-blue-600 dark:text-cyan-400 mono">ACTIVE_SYNC_V8</div>
          </div>
        </div>
      </header>

      {/* KPI Section */}
      {(() => {
        const kpi = KEYWORD_KPI[activeKeyword];
        const paperCount = kpi
          ? kpi.papers
          : papersData ? (Object.values(papersData.samplePapers) as any[][]).flat().length : 980;
        const paperGrowth = kpi ? kpi.papersGrowth : '+21.5% MoM';
        const instValue = kpi ? kpi.institutions : '2.4K+';
        const newsValue = kpi ? kpi.news : '11k';
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <MetricCard
              label="新增文献"
              value={paperCount}
              sub={paperGrowth}
              color="cyan"
              onClick={() => setActiveTab?.('papers')}
            />
            <MetricCard label="增长动能" value="+21.5%" sub="High Velocity" color="emerald" />
            <MetricCard
              label="相关融资"
              value="$366M"
              sub="+112% YoY"
              color="cyan"
              onClick={handleFundingClick}
            />
            <MetricCard
              label="活跃机构"
              value={instValue}
              sub="Global Nodes"
              color="emerald"
              onClick={() => setActiveTab?.('institutions')}
            />
            <MetricCard label="新闻聚合" value={newsValue} sub="Real-time" color="cyan" />
            <MetricCard label="引用影响" value={scholarsData ? `${(scholarsData.scholars.length * 0.4).toFixed(1)}K` : '82.0K'} sub="Impact High" color="emerald" />
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Intelligence Chart */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass p-10 rounded-[40px] h-[550px] flex flex-col relative overflow-hidden" ref={chartRef}>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-xl font-black text-[var(--text-base)] flex items-center gap-4 uppercase tracking-tight">
                <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
                核心技术演进趋势 (Tech Matrix)
              </h3>
              <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-[var(--border-color)] text-[10px] text-[var(--text-dim)] font-black mono uppercase">
                Temporal Window: 10 Months
              </div>
            </div>
            <div className="flex-1 relative z-10">
              <TrendChart metric={chartMetric} onMetricChange={setChartMetric} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Institution List - real data from papers.json */}
            <div className="glass p-8 rounded-[40px] h-[500px] flex flex-col">
              <div 
                className="flex items-center justify-between mb-8 cursor-pointer group"
                onClick={() => setActiveTab?.('institutions')}
              >
                <h3 className="text-lg font-black text-[var(--text-base)] flex items-center gap-4 uppercase group-hover:text-emerald-400 transition-colors">
                  <i className="fa-solid fa-building-shield text-emerald-600"></i> 活跃学术/研究机构
                </h3>
                <div className="text-[10px] font-black uppercase text-slate-500 group-hover:text-emerald-400 flex items-center gap-2 transition-colors">
                   View All <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-3">
                {institutionRanking.length === 0
                  ? <div className="text-xs text-[var(--text-dim)] text-center pt-10">加载中…</div>
                  : institutionRanking.map((inst, idx) => (
                  <div 
                    key={inst.name}
                    className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-color)] hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-[var(--text-base)] truncate leading-snug">{inst.name}</div>
                        <div className="text-[10px] text-[var(--text-dim)] font-bold mt-0.5">
                          {inst.scholars} 学者 · {inst.papers} 论文
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2 text-right">
                      <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mono">
                        {inst.score.toFixed(0)}
                      </div>
                      <div className="text-[9px] text-[var(--text-dim)] uppercase">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Figures - real data from scholars.json */}
            <div className="glass p-8 rounded-[40px] h-[500px] flex flex-col">
              <h3 className="text-lg font-black text-[var(--text-base)] mb-8 flex items-center gap-4 uppercase">
                <i className="fa-solid fa-user-astronaut text-indigo-600"></i> 全球核心影响力学者
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-3">
                {scholarsLoading
                  ? <div className="text-xs text-[var(--text-dim)] text-center pt-10">加载中…</div>
                  : topScholars.map((s, idx) => (
                  <div 
                    key={s.name + idx}
                    className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-color)] hover:border-indigo-500/30 transition-all flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-sm font-black text-indigo-600 shadow-sm shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-[var(--text-base)] truncate">{s.name}</div>
                      <div className="text-[10px] text-[var(--text-dim)] font-bold truncate mt-0.5">{s.institution}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-black text-indigo-500 dark:text-indigo-400 mono">{s.paperCount}</div>
                      <div className="text-[9px] text-[var(--text-dim)] uppercase">Papers</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: SocialBuzz - real data from news.json */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[48px] h-full flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-[var(--text-base)] uppercase tracking-widest flex items-center gap-4">
                <i className="fa-solid fa-satellite text-pink-600"></i>
                社交媒体热议
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-500 mono">
                  {newsLoading ? '…' : `${newsData?.total ?? 0} 条`}
                </span>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-black rounded-full">LIVE</div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-3">
              {newsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                  ))
                : socialFeed.map(post => {
                    const cfg = PlatformCfg[post.platform] ?? defaultPlatform;
                    const hasUrl = post.url && post.url.startsWith('http');
                    const Tag = hasUrl ? 'a' : 'div';
                    return (
                      <Tag
                        key={post.id}
                        {...(hasUrl ? { href: post.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="block p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-color)] hover:border-pink-500/40 transition-all relative overflow-hidden group shadow-sm cursor-pointer"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl" style={{ backgroundColor: cfg.color }} />
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
                          >
                            <i className={cfg.icon} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>
                              {post.platform}
                            </div>
                            <div className="text-[9px] text-[var(--text-dim)] font-bold truncate">{post.keyword} · {post.date}</div>
                          </div>
                          {hasUrl && (
                            <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-400 group-hover:text-pink-500 transition-colors shrink-0" />
                          )}
                        </div>
                        <p className="text-xs font-black text-[var(--text-base)] leading-snug mb-2 line-clamp-2">
                          {post.title}
                        </p>
                        {post.summary && (
                          <p className="text-[10px] text-[var(--text-dim)] leading-relaxed line-clamp-2">
                            {post.summary}
                          </p>
                        )}
                      </Tag>
                    );
                  })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
