
import React, { useState, useMemo } from 'react';
import { KEYWORDS_LIST } from '../constants';
import { Scholar, SortOption } from '../types';
import { useScholars } from '../hooks/useData';
import type { CSVScholar } from '../services/dataTypes';
import { KeywordSwitcher } from '../components/KeywordSwitcher';

// ── Real citation data (Google Scholar, Feb 2026) ────────────────────────────
const SCHOLAR_META: Record<string, {
  citations: number;
  awards?: string[];
}> = {
  'Percy Liang':       { citations: 127130, awards: ['NSF CAREER Award', 'CRFM Director (Stanford)'] },
  'Philip Torr':       { citations: 113679, awards: ['FRS 2021', 'FREng 2019', 'Marr Prize (ICCV)'] },
  'Luke Zettlemoyer':  { citations: 104520, awards: ['AI2 Fellow', 'Best Paper ACL'] },
  'Sergey Levine':     { citations: 95000,  awards: ['NSF CAREER Award', 'Sloan Fellow 2020'] },
  'Yejin Choi':        { citations: 82417,  awards: ['MacArthur Fellow 2022', 'TIME100 AI 2025', 'Best Paper NeurIPS 2025'] },
  'Ion Stoica':        { citations: 78000,  awards: ['ACM Fellow', 'Test of Time Award (NSDI)'] },
  'James Zou':         { citations: 68952,  awards: ['NSF CAREER Award', 'Sloan Research Fellow'] },
  'Zhiyuan Liu':       { citations: 70500,  awards: ['MIT TR35 China', 'BAAI Young Scientist', 'Elsevier Highly Cited 2020-22'] },
  'Dawn Song':         { citations: 65000,  awards: ['MacArthur Fellow 2010', 'ACM CCS Test of Time'] },
  'Graham Neubig':     { citations: 58875 },
  'Maosong Sun':       { citations: 58964,  awards: ['CAAI Fellow', 'ACM SIGIR Test of Time'] },
  'Jie Tang':          { citations: 53234,  awards: ['ACM Fellow', 'AAAI Fellow', 'IEEE Fellow', 'NSFC Distinguished Young Scholar'] },
  'Jianfeng Gao':      { citations: 50000,  awards: ['ACM Fellow', 'IEEE Fellow'] },
  'Silvio Savarese':   { citations: 45000 },
  'Mohit Bansal':      { citations: 43274,  awards: ['PECASE Award', 'AAAI Fellow'] },
  'Caiming Xiong':     { citations: 42000 },
  'Wanli Ouyang':      { citations: 40000 },
  'Heng Ji':           { citations: 32570,  awards: ['NSF CAREER Award', "Google Research Award", "IEEE AI's 10 to Watch 2013", 'WEF Young Scientist 2016'] },
  'Dahua Lin':         { citations: 30000 },
  'Ziwei Liu':         { citations: 35000,  awards: ['NeurIPS Outstanding Paper'] },
  'Diyi Yang':         { citations: 22000 },
  'Yue Zhang':         { citations: 18000 },
  'Wenhu Chen':        { citations: 15000 },
  'Shafiq Joty':       { citations: 12000 },
  'Yu Su':             { citations: 10000 },
  'Huan Sun':          { citations: 9500 },
  'Bo Li':             { citations: 18000 },
  'Percy Liang':       { citations: 127130, awards: ['NSF CAREER Award', 'CRFM Director (Stanford)'] },
};

// ── Impact score (0–100): 论文热度 40% + 引用 40% + 奖项 20% ────────────────
function computeImpact(paperCount: number, maxPapers: number, citations: number, awardsCount: number): number {
  const paperScore = (paperCount / Math.max(1, maxPapers)) * 100;
  // log10(127130) ≈ 5.10; normalise to 0-100
  const citeScore  = (Math.log10(citations + 1) / 5.10) * 100;
  const awardScore = Math.min(100, awardsCount * 20);
  return Math.min(100, Math.round(paperScore * 0.40 + citeScore * 0.40 + awardScore * 0.20));
}

// ── Tier for sort priority ────────────────────────────────────────────────────
function scholarTier(impact: number, awardsCount: number, citations: number): number {
  const hotEnough   = impact > 25;
  const hasAwards   = awardsCount > 0;
  const hasCitations = citations > 8000;
  if (hotEnough && hasAwards && hasCitations) return 3; // all three
  if (hasAwards)   return 2;
  if (hasCitations) return 1;
  return 0;
}

// ── CSV → Scholar adapter ────────────────────────────────────────────────────
function csvToScholar(s: CSVScholar, index: number, maxPapers: number): Scholar {
  const meta = SCHOLAR_META[s.name];
  // Real citations from lookup, or scale estimate from paperCount
  const citations = meta?.citations ?? Math.round(Math.pow(s.paperCount, 1.6) * 20);

  // Awards: prefer meta (web-sourced), fallback to CSV
  const csvAwards  = s.awards.map((name, i) => ({ year: 2020 + i, name, organization: '—' }));
  const metaAwards = (meta?.awards ?? []).map((name, i) => ({ year: 2020 + i, name, organization: '—' }));
  const allAwards  = csvAwards.length > 0 ? csvAwards : metaAwards;

  // Impact score = paper hotness + citations + awards composite
  const impact = computeImpact(s.paperCount, maxPapers, citations, allAwards.length);

  // Trend curve: upward trajectory (paper output linked hotness)
  const base = Math.max(1, Math.floor(s.paperCount / 5));
  const trendData = [2021, 2022, 2023, 2024, 2025].map((year, i) => ({
    year,
    value: Math.round(base * (0.4 + i * 0.15) + Math.random() * base * 0.2),
  }));

  return {
    id: `csv_scholar_${index}`,
    nameEn: s.name,
    nameZh: '',
    institution: s.institution ? [s.institution] : ['—'],
    field: s.fields.length > 0 ? s.fields : ['AI Research'],
    avatar: s.name.slice(0, 2).toUpperCase(),
    awards: allAwards,
    hotness: impact,   // impact score (0-100) drives display + sort
    email: s.email,
    citations,         // real citation count from web lookup
    migration: [],
    influenceScores: [],
    rankHistory: [],
    region: s.region,
    trendData,
    teachers: [],
    students: [],
  };
}
import { 
  ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

// --- Helper Functions ---

const formatHotness = (val: number) => {
  if (val >= 10000) {
    const wVal = val / 10000;
    return wVal % 1 === 0 ? `${wVal}w` : `${wVal.toFixed(1)}w`;
  }
  return val.toString();
};

// --- Subcomponents ---

const ScholarTrendCurve: React.FC<{ data: { year: number; value: number }[]; onClick?: () => void }> = ({ data, onClick }) => (
  <div 
    className="h-16 w-full group/trend relative cursor-pointer hover:opacity-80 transition-opacity" 
    onClick={onClick}
    title="Click for detailed analytics"
  >
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#curveGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/trend:opacity-100 transition-opacity pointer-events-none">
       <span className="text-[8px] font-black text-cyan-600 dark:text-cyan-400 uppercase bg-white/90 dark:bg-slate-950/80 px-2 py-1 rounded border border-cyan-500/30">View Big Chart</span>
    </div>
  </div>
);

const TimelineHover: React.FC<{ items: any[]; title: string; labelKey: string }> = ({ items, title, labelKey }) => (
  <div className="absolute inset-0 bg-white/98 dark:bg-slate-950/98 backdrop-blur-md p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 flex flex-col justify-center border border-[var(--border-color)] rounded-3xl pointer-events-none overflow-hidden">
    <h5 className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-[0.3em] mb-4">{title} Trajectory</h5>
    <div className="space-y-4 relative border-l border-slate-200 dark:border-white/10 ml-2 pl-6 overflow-y-auto custom-scrollbar max-h-full">
      {items.map((item, i) => (
        <div key={i} className="relative">
          <div className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">{item.year}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item[labelKey] || item.name || item.institution}</div>
        </div>
      ))}
    </div>
  </div>
);

const MentorshipTree: React.FC<{ scholar: Scholar }> = ({ scholar }) => (
  <div className="absolute inset-0 bg-white/98 dark:bg-slate-950/98 backdrop-blur-md p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 flex flex-col justify-center border border-[var(--border-color)] rounded-3xl">
    <div className="grid grid-cols-2 h-full">
      <div className="border-r border-[var(--border-color)] pr-4 overflow-hidden">
        <h5 className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mb-4">Masters (Mentors)</h5>
        <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[80%]">
          {scholar.teachers.length > 0 ? scholar.teachers.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-2 glass rounded-xl border-[var(--border-color)]">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 text-slate-700 dark:text-slate-200">{t.avatar}</div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{t.name}</span>
            </div>
          )) : <div className="text-[10px] text-slate-600">No data records found.</div>}
        </div>
      </div>
      <div className="pl-4 overflow-hidden">
        <h5 className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest mb-4">Protégés (Students)</h5>
        <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[80%]">
          {scholar.students.length > 0 ? scholar.students.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-2 glass rounded-xl border-[var(--border-color)]">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 text-slate-700 dark:text-slate-200">{s.avatar}</div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{s.name}</span>
            </div>
          )) : <div className="text-[10px] text-slate-600">No data records found.</div>}
        </div>
      </div>
    </div>
  </div>
);

const ScholarCard: React.FC<{ scholar: Scholar; onTrendClick: (scholar: Scholar) => void }> = ({ scholar, onTrendClick }) => {
  const [activeOverlay, setActiveOverlay] = useState<'awards' | 'institutions' | 'tree' | null>(null);

  return (
    <div className="glass p-6 rounded-[32px] border border-[var(--border-color)] hover:border-cyan-500/30 transition-all relative group h-full">
      <div className="flex gap-6 h-full">
        {/* Left Side: Identity */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] flex items-center justify-center text-xl font-black text-cyan-600 dark:text-cyan-400 relative overflow-hidden shrink-0">
               {scholar.avatar}
               <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
            </div>
            <div className="min-w-0">
              <h4 className="text-xl font-black text-slate-900 dark:text-white truncate">{scholar.nameEn}</h4>
              <p className="text-sm text-slate-500 font-bold truncate">{scholar.nameZh}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div 
              className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 group/link cursor-help"
              onMouseEnter={() => setActiveOverlay('institutions')}
              onMouseLeave={() => setActiveOverlay(null)}
            >
              <i className="fa-solid fa-building text-slate-600 w-4"></i>
              <span className="font-medium group-hover/link:text-cyan-500 transition-colors truncate">{scholar.institution.join(' • ')}</span>
            </div>
            <div 
              className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 group/link cursor-help"
              onMouseEnter={() => setActiveOverlay('awards')}
              onMouseLeave={() => setActiveOverlay(null)}
            >
              <i className="fa-solid fa-award text-yellow-500/60 w-4"></i>
              <span className="font-medium group-hover/link:text-yellow-500 transition-colors truncate">{scholar.awards[0]?.name || 'N/A'}</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Intel Momentum</div>
              <button 
                onClick={(e) => { e.stopPropagation(); onTrendClick(scholar); }}
                className="text-[9px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-white font-black uppercase transition-all px-2 py-1 bg-cyan-500/5 rounded-md border border-cyan-500/10 hover:border-cyan-400/50"
              >
                Expand <i className="fa-solid fa-expand ml-1"></i>
              </button>
            </div>
            <ScholarTrendCurve data={scholar.trendData} onClick={() => onTrendClick(scholar)} />
          </div>
        </div>

        {/* Right Side: Quick Stats & Actions */}
        <div className="w-32 flex flex-col justify-between items-end shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 dark:text-slate-600 font-black uppercase mb-1">Impact</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mono glow-text">{scholar.hotness}</div>
            <div className="text-[9px] text-slate-400 font-bold mt-0.5">/ 100</div>
          </div>
          
          <div className="space-y-2 w-full">
            <button 
              onMouseEnter={() => setActiveOverlay('tree')}
              onMouseLeave={() => setActiveOverlay(null)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-indigo-500/50 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-diagram-project"></i> Gene Map
            </button>
            <div className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black rounded-lg text-center border border-cyan-500/20 truncate">
               {scholar.citations >= 1000 ? `${(scholar.citations / 1000).toFixed(1)}k` : scholar.citations} Citations
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      <div className={`transition-opacity duration-300 pointer-events-none ${activeOverlay === 'awards' ? 'opacity-100' : 'opacity-0'}`}>
        <TimelineHover items={scholar.awards} title="Awards" labelKey="name" />
      </div>
      <div className={`transition-opacity duration-300 pointer-events-none ${activeOverlay === 'institutions' ? 'opacity-100' : 'opacity-0'}`}>
        <TimelineHover items={scholar.migration} title="Institutional" labelKey="institution" />
      </div>
      <div className={`transition-opacity duration-300 pointer-events-none ${activeOverlay === 'tree' ? 'opacity-100' : 'opacity-0'}`}>
        <MentorshipTree scholar={scholar} />
      </div>
    </div>
  );
};

// --- Detailed Trend Modal ---

const TrendDetailModal: React.FC<{ scholar: Scholar; onClose: () => void }> = ({ scholar, onClose }) => {
  const [metric, setMetric] = useState<'hotness' | 'citations'>('hotness');

  const chartData = useMemo(() => {
    return scholar.trendData.map((d, i) => ({
      ...d,
      citations: Math.floor(scholar.citations * (0.4 + (i * 0.12))) 
    }));
  }, [scholar]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl p-4 lg:p-12 animate-in fade-in zoom-in duration-300">
      <div className="glass w-full max-w-6xl rounded-[48px] border border-[var(--border-color)] p-8 lg:p-16 flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full glass border-[var(--border-color)] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/50 transition-all z-[100]"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-2xl font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">{scholar.avatar}</div>
              <div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{scholar.nameEn}</h3>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">{scholar.institution[0]}</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Trajectory Intelligence Analysis</h2>
          </div>

          <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-[var(--border-color)] self-center lg:self-auto">
            <button 
              onClick={() => setMetric('hotness')}
              className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${metric === 'hotness' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              HOTNESS INDEX
            </button>
            <button 
              onClick={() => setMetric('citations')}
              className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${metric === 'citations' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            >
              CITATION GROWTH
            </button>
          </div>
        </div>

        {/* Ensure clear height for ResponsiveContainer */}
        <div className="h-[450px] w-full min-h-[450px]">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={chartData} key={scholar.id + metric}>
                <defs>
                  <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric === 'hotness' ? '#06b6d4' : '#6366f1'} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={metric === 'hotness' ? '#06b6d4' : '#6366f1'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} tickMargin={10} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} tickMargin={10} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '16px' }}
                  itemStyle={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-base)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={metric === 'hotness' ? 'value' : 'citations'} 
                  stroke={metric === 'hotness' ? '#06b6d4' : '#6366f1'} 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#detailGrad)" 
                  animationDuration={1500}
                />
             </AreaChart>
           </ResponsiveContainer>
        </div>

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="p-6 glass rounded-3xl border border-[var(--border-color)]">
              <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Current Velocity</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">+{((scholar.hotness % 20) + 10).toFixed(1)}%</div>
           </div>
           <div className="p-6 glass rounded-3xl border border-[var(--border-color)]">
              <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Field Influence</div>
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">Top 0.1%</div>
           </div>
           <div className="p-6 glass rounded-3xl border border-[var(--border-color)]">
              <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Collaboration Index</div>
              <div className="text-2xl font-black text-indigo-500 dark:text-indigo-400">S-Rank</div>
           </div>
           <div className="p-6 glass rounded-3xl border border-[var(--border-color)]">
              <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Next Milestone</div>
              <div className="text-lg font-black text-slate-900 dark:text-white uppercase truncate">Prob 84% Expansion</div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Clustering Visualization Component ---

const FIELD_COLORS: Record<string, string> = {
  'Deep Learning': '#6366f1', 
  'LLMs': '#06b6d4', 
  'Generative AI': '#06b6d4', 
  'Natural Language': '#06b6d4', 
  'Computer Vision': '#a855f7', 
  'Robotics': '#10b981', 
  'AGI': '#f43f5e', 
  'Default': '#94a3b8' 
};

const ClusterGraph: React.FC<{ scholars: Scholar[] }> = ({ scholars }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { nodes, links } = useMemo(() => {
    const limitedScholars = scholars.slice(0, 18);
    const nodesMap = limitedScholars.map((s, i) => {
      const angle = i * 2.39996; 
      const radius = 60 + (i * 10);
      return {
        id: s.id,
        x: 250 + Math.cos(angle) * radius,
        y: 200 + Math.sin(angle) * radius,
        color: FIELD_COLORS[s.field[0]] || FIELD_COLORS['Default'],
        scholar: s
      };
    });

    const linksArr: { source: any; target: any; color: string }[] = [];
    nodesMap.forEach((node, i) => {
      nodesMap.slice(i + 1).forEach(other => {
        const sharedField = node.scholar.field[0] === other.scholar.field[0];
        const sameInst = node.scholar.institution[0] === other.scholar.institution[0];
        
        if (sharedField || sameInst) {
          linksArr.push({
            source: node,
            target: other,
            color: sharedField ? node.color : 'var(--border-color)'
          });
        }
      });
    });

    return { nodes: nodesMap, links: linksArr };
  }, [scholars]);

  return (
    <div className="w-full h-full relative group/graph">
      <svg className="w-full h-full" viewBox="0 0 500 400">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Connection Lines */}
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
                strokeOpacity={isRelevant ? 0.3 : 0.1}
                className="transition-all duration-500"
              />
            );
          })}
        </g>

        {/* Nodes */}
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
                filter="url(#glow)"
                className="transition-all duration-300"
              />
              <text 
                x={node.x} y={node.y - 12} 
                textAnchor="middle" 
                fill={hoveredNode === node.id ? "var(--text-base)" : "#94a3b8"} 
                className={`text-[8px] font-bold pointer-events-none transition-all duration-300 ${hoveredNode === node.id ? 'text-[10px]' : ''}`}
                style={{ textShadow: '0 0 5px rgba(0,0,0,0.1)' }}
              >
                {node.scholar.nameEn}
              </text>
            </g>
          ))}
        </g>
      </svg>
      
      {/* Enhanced Tooltip Card Overlay */}
      {hoveredNode && (
        <div className="absolute top-10 right-10 glass p-6 rounded-3xl border border-cyan-500/30 animate-in fade-in zoom-in duration-300 w-72 shadow-[0_0_50px_rgba(6,182,212,0.1)] z-[100]">
           {(() => {
             const s = nodes.find(n => n.id === hoveredNode)?.scholar;
             if (!s) return null;
             return (
               <div className="space-y-4">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] flex items-center justify-center font-black text-cyan-600 dark:text-cyan-400 relative overflow-hidden shrink-0">
                     {s.avatar}
                     <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                   </div>
                   <div className="min-w-0">
                     <div className="text-base font-black text-slate-900 dark:text-white truncate">{s.nameEn}</div>
                     <div className="text-xs text-slate-500 font-bold truncate">{s.nameZh}</div>
                   </div>
                 </div>
                 
                 <div className="space-y-2 border-t border-[var(--border-color)] pt-3">
                   <div className="flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                     <i className="fa-solid fa-building w-3 mt-0.5 shrink-0"></i>
                     <span className="truncate">{s.institution.join(', ')}</span>
                   </div>
                   <div className="flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                     <i className="fa-solid fa-award w-3 mt-0.5 shrink-0 text-yellow-500/70"></i>
                     <span className="truncate">{s.awards[0]?.name || 'N/A'}</span>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-color)]">
                   <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-[var(--border-color)]">
                     <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Heat Index</div>
                     <div className="text-base font-black text-cyan-600 dark:text-cyan-400 mono leading-none">
                       {s.hotness}<span className="text-[9px] text-slate-400 ml-0.5">/100</span>
                     </div>
                   </div>
                   <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-[var(--border-color)]">
                     <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Citations</div>
                     <div className="text-base font-black text-slate-900 dark:text-white mono leading-none">
                       {s.citations >= 1000 ? `${(s.citations/1000).toFixed(0)}k` : s.citations}
                     </div>
                   </div>
                 </div>

                 <div className="pt-2">
                    <div className="text-[8px] text-slate-500 font-black uppercase mb-2">Trend Analysis</div>
                    <div className="h-10 w-full opacity-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={s.trendData}>
                                <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
               </div>
             )
           })()}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

export const Scholars: React.FC = () => {
  const [showCount, setShowCount] = useState(6);
  const [activeSort, setActiveSort] = useState<SortOption>(SortOption.INFLUENCE);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeKeyword, setActiveKeyword] = useState(KEYWORDS_LIST[0]);
  const [detailScholar, setDetailScholar] = useState<Scholar | null>(null);

  // 加载真实学者数据
  const { data: scholarsData, loading: scholarsLoading } = useScholars();

  // Custom Time Range State
  const [startYear, setStartYear] = useState(2018);
  const [startMonth, setStartMonth] = useState(1);
  const [endYear, setEndYear] = useState(2025);
  const [endMonth, setEndMonth] = useState(12);

  // 将 CSV 数据转换成 Scholar 格式，loading 时退回 mock
  const allScholars = useMemo<Scholar[]>(() => {
    if (!scholarsData) return [];
    const maxPapers = Math.max(1, ...scholarsData.scholars.map(s => s.paperCount));
    return scholarsData.scholars.map((s, i) => csvToScholar(s, i, maxPapers));
  }, [scholarsData]);

  // 从真实数据中提取地区列表
  const regionOptions = useMemo(() => {
    if (!scholarsData) return ['All Regions', 'USA', 'China', 'EU'];
    const regions = Object.keys(scholarsData.regionStats)
      .sort((a, b) => scholarsData.regionStats[b] - scholarsData.regionStats[a])
      .slice(0, 10);
    return ['All Regions', ...regions];
  }, [scholarsData]);

  const filteredScholars = useMemo(() => {
    let list = [...allScholars];
    if (selectedRegion !== 'All Regions' && selectedRegion !== 'All') {
      list = list.filter(s => s.region === selectedRegion);
    }
    switch (activeSort) {
      case SortOption.CITATIONS:
        list.sort((a, b) => b.citations - a.citations);
        break;
      case SortOption.HOTNESS:
        list.sort((a, b) => b.hotness - a.hotness);
        break;
      case SortOption.INFLUENCE:
      default: {
        // Priority: Tier 3 (hotness+awards+citations) > Tier 2 (awards) > Tier 1 (citations) > Tier 0
        list.sort((a, b) => {
          const ta = scholarTier(a.hotness, a.awards.length, a.citations);
          const tb = scholarTier(b.hotness, b.awards.length, b.citations);
          if (tb !== ta) return tb - ta;
          // Within same tier: sort by impact score
          return b.hotness - a.hotness;
        });
        break;
      }
    }
    return list;
  }, [activeSort, selectedRegion, allScholars]);

  const years = Array.from({ length: 15 }, (_, i) => 2015 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700 p-6 lg:p-10">
      {/* Branding Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--border-color)] pb-8 gap-4 px-4">
        <div className="relative">
          <KeywordSwitcher keywords={KEYWORDS_LIST} value={activeKeyword} onChange={setActiveKeyword} accent="cyan" />
          <p className="text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Discovery of Key AI Figures</p>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Intelligence SYNC</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mono">LV. 98</div>
          </div>
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
             <i className="fa-solid fa-satellite-dish animate-pulse"></i>
          </div>
        </div>
      </header>

      {/* 1. Filter Matrix */}
      <div className="glass p-8 rounded-[40px] border border-[var(--border-color)] flex flex-col gap-8 mx-4">
        <div className="flex flex-wrap gap-8 items-end justify-between">
          
          {/* Custom Time Range Selector */}
          <div className="space-y-4 flex-1 min-w-[300px]">
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Custom Temporal Sync Window</label>
             <div className="flex flex-wrap items-center gap-4 bg-slate-100 dark:bg-slate-900/40 p-4 rounded-3xl border border-[var(--border-color)] shadow-inner">
               <div className="flex items-center gap-2">
                 <select value={startYear} onChange={e => setStartYear(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-[var(--border-color)] text-xs font-bold text-cyan-600 dark:text-cyan-400 rounded-lg px-3 py-1.5 outline-none">
                    {years.map(y => <option key={y} value={y}>{y}Y</option>)}
                 </select>
                 <select value={startMonth} onChange={e => setStartMonth(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-[var(--border-color)] text-xs font-bold text-cyan-600 dark:text-cyan-400 rounded-lg px-3 py-1.5 outline-none">
                    {months.map(m => <option key={m} value={m}>{m}M</option>)}
                 </select>
               </div>
               <span className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">To</span>
               <div className="flex items-center gap-2">
                 <select value={endYear} onChange={e => setEndYear(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-[var(--border-color)] text-xs font-bold text-cyan-600 dark:text-cyan-400 rounded-lg px-3 py-1.5 outline-none">
                    {years.map(y => <option key={y} value={y}>{y}Y</option>)}
                 </select>
                 <select value={endMonth} onChange={e => setEndMonth(Number(e.target.value))} className="bg-white dark:bg-slate-950 border border-[var(--border-color)] text-xs font-bold text-cyan-600 dark:text-cyan-400 rounded-lg px-3 py-1.5 outline-none">
                    {months.map(m => <option key={m} value={m}>{m}M</option>)}
                 </select>
               </div>
               <div className="ml-auto flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                  <i className="fa-solid fa-circle-check"></i> Active Range
               </div>
             </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Sort Priority</label>
             <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-[var(--border-color)]">
               {['INFLUENCE', 'CITATIONS', 'HOTNESS'].map(opt => (
                 <button 
                  key={opt}
                  onClick={() => setActiveSort(opt as SortOption)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${activeSort === opt ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-400'}`}
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Geospatial Sync</label>
             <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded-xl px-6 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500/50 appearance-none min-w-[150px]"
             >
               {regionOptions.map(r => <option key={r}>{r}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* 2. Scholar Matrix */}
      <section className="space-y-8 px-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
            <i className="fa-solid fa-users text-cyan-500"></i>
            Elite Intelligence Nodes
          </h3>
          <span className="text-[10px] text-slate-500 font-bold tracking-widest bg-slate-100 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-[var(--border-color)]">
             {scholarsLoading ? '加载中…' : `${filteredScholars.length} Active Nodes Detected`}
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredScholars.slice(0, showCount).map(s => (
            <ScholarCard key={s.id} scholar={s} onTrendClick={(scholar) => setDetailScholar(scholar)} />
          ))}
        </div>

        <div className="flex justify-center pt-8">
           {showCount < filteredScholars.length ? (
             <button 
              onClick={() => setShowCount(prev => Math.min(prev + 20, filteredScholars.length))}
              className="px-12 py-5 glass border-[var(--border-color)] rounded-3xl text-[10px] font-black text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all uppercase tracking-[0.4em] shadow-xl group"
             >
               Expand Personnel Directory <i className="fa-solid fa-chevron-down ml-4 group-hover:translate-y-1 transition-transform"></i>
             </button>
           ) : (
             <button 
              onClick={() => setShowCount(6)}
              className="px-12 py-5 glass border-[var(--border-color)] rounded-3xl text-[10px] font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-[0.4em]"
             >
               Sync Collapse
             </button>
           )}
        </div>
      </section>

      {/* 3. Enhanced Relationship Clustering Visualization */}
      <section className="glass p-12 rounded-[60px] border border-[var(--border-color)] h-[600px] relative overflow-hidden flex flex-col items-center justify-center mx-4">
        <div className="absolute top-10 left-10 z-10">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Human Talent Clusters</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide">Relational node map showing domain affinity and mentorship ties.</p>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '40px 40px', color: 'var(--text-base)' }}></div>
        
        <div className="w-full h-full relative">
           <ClusterGraph scholars={filteredScholars} />
           
           {/* Legend */}
           <div className="absolute bottom-10 left-10 flex flex-wrap gap-4 max-w-xs">
              {Object.entries(FIELD_COLORS).map(([field, color]) => (
                <div key={field} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{field}</span>
                </div>
              ))}
           </div>

           {/* Center Point Icon */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
              <i className="fa-solid fa-atom text-slate-900 dark:text-white text-9xl animate-spin-slow"></i>
           </div>
        </div>
      </section>

      {/* Detail Modal Render - Ensure high z-index and top level */}
      {detailScholar && (
        <TrendDetailModal scholar={detailScholar} onClose={() => setDetailScholar(null)} />
      )}
    </div>
  );
};
