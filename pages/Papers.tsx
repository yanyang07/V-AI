
import React, { useState, useMemo, useEffect } from 'react';
import { KEYWORDS_LIST } from '../constants';
import { Paper, SortOption } from '../types';
import { usePapers } from '../hooks/useData';
import type { CSVPaper } from '../services/dataTypes';
import { KeywordSwitcher } from '../components/KeywordSwitcher';

// ── Impact Factor formula ────────────────────────────────────────────────────
// Combines: hotness (60%) + journal presence (25%) + awards (15%)
// maxHotness passed in so we normalise across the whole batch
function computeImpactFactor(
  hotness: number,
  maxHotness: number,
  journal: string,
  awards: string[],
): number {
  const hotScore    = maxHotness > 0 ? (hotness / maxHotness) * 60 : 0;
  const journalScore = journal ? 25 : 0;
  const awardScore  = Math.min(15, awards.length * 15);
  return Math.round(hotScore + journalScore + awardScore);
}

// ── Sort tier: 1st = hotness+citations+journal, 2nd = hotness, 3rd = citations
// Since real citations aren't in CSV, we use journal as a proxy for "citation-worthy"
function paperTier(hotness: number, journal: string, awards: string[]): number {
  const hasHotness  = hotness > 0;
  const hasJournal  = !!journal;
  const hasAwards   = awards.length > 0;
  // Tier 3: hotness AND (journal OR awards) — best signal combination
  if (hasHotness && (hasJournal || hasAwards)) return 3;
  // Tier 2: hotness only
  if (hasHotness) return 2;
  // Tier 1: journal/award but no hotness
  if (hasJournal || hasAwards) return 1;
  return 0;
}

// ── CSV → Paper adapter ──────────────────────────────────────────────────────
function csvToPaper(p: CSVPaper, index: number, maxHotness: number): Paper {
  const displayHotness = (p.hotness ?? 0) * 10; // 要求：热度字段 × 10 展示
  const impactFactor   = computeImpactFactor(p.hotness ?? 0, maxHotness, p.journal, p.awards);

  // Trend curve based on hotness — more recent high-hotness papers trend upward
  const base = Math.max(5, Math.round((p.hotness ?? 0) / 10) + (index % 15));
  const trend = [0, 1, 2, 3, 4].map(i => Math.round(base * (0.5 + i * 0.2)));

  return {
    id: p.id || `csv_paper_${index}`,
    title: p.title,
    year: p.year || 2024,
    date: p.date || '',          // 论文日期 "YYYY-MM-DD"
    citations: displayHotness,   // repurposed: shows hotness×10 in the citations slot
    hotness: impactFactor,       // impact factor (0–100) for sorting/display
    awards: p.awards,
    trend,
    authors: p.authors.slice(0, 5),
    tags: [p.keyword, ...(p.relatedKeywords.slice(0, 2))].filter(Boolean),
    venue: p.journal || 'arXiv',
    journal: p.journal,
    abstract: '',
    url: p.url,
  };
}
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line 
} from 'recharts';

// --- Subcomponents ---

const PaperTrendSparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const chartData = data.map((v, i) => ({ val: v, year: 2020 + i }));
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const HoverLineageTree: React.FC<{ paper: Paper }> = ({ paper }) => (
  <div className="absolute inset-0 bg-white/98 dark:bg-slate-950/98 backdrop-blur-md p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-50 flex flex-col justify-center border border-[var(--border-color)] rounded-3xl pointer-events-none">
    <h5 className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.3em] mb-6 text-center">Research Genealogy</h5>
    
    <div className="flex flex-col items-center gap-4">
      {/* Origins */}
      <div className="flex gap-2">
        <div className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded text-[8px] text-slate-500 font-bold uppercase">Source Alpha</div>
        <div className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded text-[8px] text-slate-500 font-bold uppercase">Source Beta</div>
      </div>
      
      <i className="fa-solid fa-arrow-down text-indigo-500/50 text-[10px]"></i>
      
      {/* Target */}
      <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-[10px] font-black text-slate-900 dark:text-white text-center shadow-lg">
        Active Node: {paper.title.split(' ').slice(0, 3).join(' ')}...
      </div>
      
      <i className="fa-solid fa-arrow-down text-indigo-500/50 text-[10px]"></i>
      
      {/* Branches */}
      <div className="flex gap-2">
        <div className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded text-[8px] text-emerald-600/50 dark:text-emerald-500/50 font-bold uppercase">Derivative I</div>
        <div className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded text-[8px] text-emerald-600/50 dark:text-emerald-500/50 font-bold uppercase">Derivative II</div>
        <div className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded text-[8px] text-emerald-600/50 dark:text-emerald-500/50 font-bold uppercase">Derivative III</div>
      </div>
    </div>
    
    <div className="mt-6 text-[8px] text-slate-500 font-bold uppercase text-center tracking-widest">Hover to sync lineage data</div>
  </div>
);

const PaperCard: React.FC<{ paper: Paper }> = ({ paper }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTreePreview, setShowTreePreview] = useState(false);

  return (
    <div 
      className="glass p-6 rounded-[32px] border border-[var(--border-color)] hover:border-indigo-500/30 transition-all relative group flex flex-col justify-between h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowTreePreview(false); }}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight min-h-[3rem]">
            <a 
              href={paper.url || "#"} 
              target={paper.url ? "_blank" : "_self"} 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {paper.title}
            </a>
          </h4>
          <a 
            href={paper.url || "#"} 
            target={paper.url ? "_blank" : "_self"} 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] flex items-center justify-center text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/30 transition-all shrink-0"
          >
             <i className="fa-solid fa-file-pdf"></i>
          </a>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 font-bold truncate">Authors: {paper.authors.join(', ')}</p>
          {paper.date && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] px-2 py-0.5 rounded-full">
              <i className="fa-regular fa-calendar text-[9px]"></i>
              {paper.date}
            </span>
          )}
        </div>

        {/* abstract/intro - prominently displayed as requested */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-[var(--border-color)] shadow-inner">
          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed italic">
            {paper.abstract || "The abstract for this breakthrough research defines the foundational limits of the technology explored, establishing a new paradigm for intelligence sync."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {paper.awards.map((award, i) => (
            <span key={i} className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[8px] font-black rounded uppercase border border-yellow-500/20">
              <i className="fa-solid fa-award mr-1"></i> {award}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-[var(--border-color)] pt-4">
        <div className="space-y-1">
           <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Momentum</div>
           <PaperTrendSparkline data={paper.trend} />
        </div>
        <div className="text-right space-y-1">
          <div>
            <div className="text-[9px] text-slate-500 font-black uppercase">Impact Factor</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mono">
              {paper.hotness}<span className="text-[10px] text-slate-400 ml-0.5">/100</span>
            </div>
          </div>
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
            🔥 Hotness: {paper.citations.toLocaleString()}
          </div>
          {paper.venue && paper.venue !== 'arXiv' && (
            <div className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold truncate max-w-[120px]">
              <i className="fa-solid fa-book-open mr-1" />{paper.venue}
            </div>
          )}
        </div>
      </div>

      <button 
        onMouseEnter={() => setShowTreePreview(true)}
        className="mt-4 w-full py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-diagram-project"></i> Trace Lineage
      </button>

      {/* Lineage Tree Hover Overlay */}
      {showTreePreview && <HoverLineageTree paper={paper} />}

      {/* Analytics Detailed Hover */}
      {isHovered && !showTreePreview && (
        <div className="absolute inset-x-0 bottom-full mb-4 glass p-6 rounded-[32px] border border-indigo-500/50 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 pointer-events-none bg-white/95 dark:bg-slate-950/95">
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] mb-4">Metric Aggregation Matrix</div>
          <div className="h-32 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={paper.trend.map((v, i) => ({ v, y: 2020 + i }))}>
                  <Area type="monotone" dataKey="v" stroke="#6366f1" fill="#6366f120" strokeWidth={3} />
               </AreaChart>
             </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-[var(--border-color)]">
                <div className="text-[8px] text-slate-500 font-black uppercase">Diffusion</div>
                <div className="text-sm font-black text-emerald-500">92/100</div>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-[var(--border-color)]">
                <div className="text-[8px] text-slate-500 font-black uppercase">Velocity</div>
                <div className="text-sm font-black text-cyan-500">+12% / Mo</div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Paper Cluster Graph ---

const PAPER_FIELD_COLORS: Record<string, string> = {
  'Deep Learning': '#6366f1',
  'LLM': '#06b6d4',
  'Transformer': '#06b6d4',
  'Computer Vision': '#a855f7',
  'Robotics': '#10b981',
  'AGI': '#f43f5e',
  'Default': '#94a3b8'
};

const PaperClusterGraph: React.FC<{ papers: Paper[] }> = ({ papers }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { nodes, links } = useMemo(() => {
    const limited = papers.slice(0, 15);
    const nodesMap = limited.map((p, i) => {
      const angle = i * 2.39996; 
      const radius = 80 + (i * 10);
      return {
        id: p.id,
        x: 250 + Math.cos(angle) * radius,
        y: 200 + Math.sin(angle) * radius,
        color: PAPER_FIELD_COLORS[p.tags[0]] || PAPER_FIELD_COLORS['Default'],
        paper: p
      };
    });

    const linksArr: { source: any; target: any; color: string }[] = [];
    nodesMap.forEach((node, i) => {
      nodesMap.slice(i + 1).forEach(other => {
        const sharedAuthor = node.paper.authors[0] === other.paper.authors[0];
        const sharedTag = node.paper.tags[0] === other.paper.tags[0];
        if (sharedAuthor || sharedTag) {
          linksArr.push({
            source: node,
            target: other,
            color: sharedTag ? node.color : 'var(--border-color)'
          });
        }
      });
    });

    return { nodes: nodesMap, links: linksArr };
  }, [papers]);

  return (
    <div className="w-full h-full relative">
      <svg className="w-full h-full" viewBox="0 0 500 400">
        <g>
          {links.map((link, i) => {
            const isRelevant = !hoveredNode || link.source.id === hoveredNode || link.target.id === hoveredNode;
            return (
              <line 
                key={i}
                x1={link.source.x} y1={link.source.y}
                x2={link.target.x} y2={link.target.y}
                stroke={link.color}
                strokeWidth={isRelevant ? 1 : 0.2}
                strokeOpacity={isRelevant ? 0.3 : 0.05}
                className="transition-all duration-500"
              />
            );
          })}
        </g>
        <g>
          {nodes.map(node => (
            <g 
              key={node.id} 
              onMouseEnter={() => setHoveredNode(node.id)} 
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <circle 
                cx={node.x} cy={node.y} 
                r={hoveredNode === node.id ? 8 : 4} 
                fill={node.color} 
                className="transition-all duration-300 origin-center"
              />
              {hoveredNode === node.id && (
                <text 
                  x={node.x} y={node.y - 15} 
                  textAnchor="middle" 
                  fill="var(--text-base)" 
                  className="text-[10px] font-black drop-shadow-md pointer-events-none"
                >
                  {node.paper.title.slice(0, 15)}...
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
      {hoveredNode && (
        <div className="absolute bottom-10 right-10 glass p-5 rounded-3xl border border-[var(--border-color)] animate-in fade-in zoom-in bg-white/90 dark:bg-slate-900/90">
           {(() => {
             const p = nodes.find(n => n.id === hoveredNode)?.paper;
             if (!p) return null;
             return (
               <div className="space-y-1">
                 <div className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">{p.tags[0]} Domain</div>
                 <div className="text-sm font-black text-slate-900 dark:text-white">{p.title}</div>
                 <div className="text-[10px] text-slate-500 font-bold">{p.venue} • {p.year}</div>
               </div>
             )
           })()}
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

export const Papers: React.FC = () => {
  const [showCount, setShowCount] = useState(6);
  const [activeSort, setActiveSort] = useState<SortOption>(SortOption.INFLUENCE);
  const [selectedKeyword, setSelectedKeyword] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKeyword, setActiveKeyword] = useState(KEYWORDS_LIST[0]);

  // 切换关键词时重置分页和筛选
  useEffect(() => { setShowCount(6); setSelectedKeyword('All'); }, [activeKeyword]);

  // 加载真实论文数据
  const { data: papersData, loading: papersLoading } = usePapers();

  // Custom Time Range State
  const [startYear, setStartYear] = useState(2018);
  const [startMonth, setStartMonth] = useState(1);
  const [endYear, setEndYear] = useState(2025);
  const [endMonth, setEndMonth] = useState(12);

  // 将 CSV 数据转换成 Paper 格式 — 按 activeKeyword 过滤
  const allPapers = useMemo<Paper[]>(() => {
    if (!papersData) return [];
    // 优先展示当前关键词的论文，fallback 到全部
    const raw = ((papersData.samplePapers[activeKeyword] ?? Object.values(papersData.samplePapers).flat()) as CSVPaper[]);
    const maxHotness = Math.max(1, ...raw.map(p => p.hotness ?? 0));
    return raw.map((p, i) => csvToPaper(p, i, maxHotness));
  }, [papersData, activeKeyword]);

  // 关键词列表（用于筛选）
  const keywordOptions = useMemo(() => {
    if (!papersData) return ['All'];
    return ['All', ...Object.keys(papersData.samplePapers)];
  }, [papersData]);

  const filteredPapers = useMemo(() => {
    let list = [...allPapers];
    if (selectedKeyword !== 'All') list = list.filter(p => p.tags[0] === selectedKeyword);
    if (searchQuery) list = list.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

    switch (activeSort) {
      case SortOption.CITATIONS:
        // citations slot stores hotness×10
        list.sort((a, b) => b.citations - a.citations);
        break;
      case SortOption.HOTNESS:
        list.sort((a, b) => b.hotness - a.hotness);
        break;
      case SortOption.RECENCY:
        list.sort((a, b) => b.year - a.year);
        break;
      case SortOption.INFLUENCE:
      default: {
        // Tier 3: hotness+awards/journal > Tier 2: hotness > Tier 1: journal/award > Tier 0
        list.sort((a, b) => {
          const ta = paperTier(a.citations / 10, a.journal, a.awards);
          const tb = paperTier(b.citations / 10, b.journal, b.awards);
          if (tb !== ta) return tb - ta;
          return b.hotness - a.hotness; // within tier: by impact factor
        });
        break;
      }
    }
    return list;
  }, [activeSort, selectedKeyword, searchQuery, allPapers]);

  const years = Array.from({ length: 15 }, (_, i) => 2015 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700 p-6 lg:p-10">
      {/* Dynamic Keyword Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--border-color)] pb-8 gap-4 px-4">
        <div className="relative">
          <KeywordSwitcher keywords={KEYWORDS_LIST} value={activeKeyword} onChange={setActiveKeyword} accent="indigo" />
          <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Discovery of Breakthrough Manuscripts</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Archive Velocity</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mono">4.8k/s</div>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
             <i className="fa-solid fa-microchip animate-pulse"></i>
          </div>
        </div>
      </header>

      {/* Advanced Filter Matrix */}
      <div className="glass p-8 rounded-[40px] border border-[var(--border-color)] flex flex-col gap-8 mx-4">
        <div className="flex flex-wrap gap-8 items-end justify-between">
          
          {/* Time Sync */}
          <div className="space-y-4 flex-1 min-w-[300px]">
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Custom Temporal Window</label>
             <div className="flex flex-wrap items-center gap-4 bg-slate-100 dark:bg-slate-900/40 p-4 rounded-3xl border border-[var(--border-color)] shadow-inner">
               <div className="flex items-center gap-2">
                 <select value={startYear} onChange={e => setStartYear(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-[var(--border-color)] text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-lg px-3 py-1.5 outline-none">
                    {years.map(y => <option key={y} value={y}>{y}Y</option>)}
                 </select>
                 <select value={startMonth} onChange={e => setStartMonth(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-[var(--border-color)] text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-lg px-3 py-1.5 outline-none">
                    {months.map(m => <option key={m} value={m}>{m}M</option>)}
                 </select>
               </div>
               <span className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">To</span>
               <div className="flex items-center gap-2">
                 <select value={endYear} onChange={e => setEndYear(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-[var(--border-color)] text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-lg px-3 py-1.5 outline-none">
                    {years.map(y => <option key={y} value={y}>{y}Y</option>)}
                 </select>
                 <select value={endMonth} onChange={e => setEndMonth(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-[var(--border-color)] text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-lg px-3 py-1.5 outline-none">
                    {months.map(m => <option key={m} value={m}>{m}M</option>)}
                 </select>
               </div>
             </div>
          </div>

          {/* Core Sort */}
          <div className="space-y-4">
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Metric Optimization</label>
             <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-[var(--border-color)]">
               {['INFLUENCE', 'CITATIONS', 'HOTNESS', 'RECENCY'].map(opt => (
                 <button 
                  key={opt}
                  onClick={() => setActiveSort(opt as SortOption)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${activeSort === opt ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </div>

          {/* 关键词筛选（真实数据） */}
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-600 font-black uppercase">Keyword</label>
              <select
                value={selectedKeyword}
                onChange={e => setSelectedKeyword(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                {keywordOptions.map(k => <option key={k} value={k}>{k === 'All' ? 'All Keywords' : k}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Keyword Search */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input 
            type="text" 
            placeholder="Search by keyword, author, or breakthrough title..."
            className="w-full bg-slate-100 dark:bg-slate-950 border border-[var(--border-color)] rounded-3xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500/50 transition-all outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 1. Paper Cards Grid - Positioned below filter */}
      <section className="space-y-8 px-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
            <i className="fa-solid fa-scroll text-indigo-500"></i>
            Verified Breakthrough Library
          </h3>
          <span className="text-[10px] text-slate-500 font-bold tracking-widest bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-[var(--border-color)] uppercase">
             {papersLoading ? '加载中…' : `${filteredPapers.length} Manuscripts Detected`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredPapers.slice(0, showCount).map(p => (
            <PaperCard key={p.id} paper={p} />
          ))}
        </div>

        <div className="flex justify-center pt-8">
           {showCount < filteredPapers.length ? (
             <button 
              onClick={() => setShowCount(prev => prev + 12)}
              className="px-12 py-5 glass border-[var(--border-color)] rounded-[32px] text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all uppercase tracking-[0.4em] shadow-xl group"
             >
               Load More Research Nodes <i className="fa-solid fa-chevron-down ml-4 group-hover:translate-y-1 transition-transform"></i>
             </button>
           ) : (
             <button 
              onClick={() => setShowCount(6)}
              className="px-12 py-5 glass border-[var(--border-color)] rounded-[32px] text-[10px] font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-[0.4em]"
             >
               Recollapse Repository
             </button>
           )}
        </div>
      </section>

      {/* 2. Paper Cluster Graph - Positioned at bottom */}
      <section className="glass p-12 rounded-[60px] border border-[var(--border-color)] h-[600px] relative overflow-hidden flex flex-col items-center justify-center mx-4">
        <div className="absolute top-10 left-10 z-10">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Manuscript Relational Clusters</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide">Mapping domain affinity across research manuscripts.</p>
        </div>
        <div className="w-full h-full relative">
           <PaperClusterGraph papers={filteredPapers} />
           
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
              <i className="fa-solid fa-scroll text-slate-900 dark:text-white text-[150px] animate-pulse"></i>
           </div>
        </div>
      </section>
    </div>
  );
};
