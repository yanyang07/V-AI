
import React, { useState, useMemo } from 'react';
import { PAPERS_MOCK, INSTITUTIONS_MOCK } from '../constants';
import { Paper, SortOption } from '../types';
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
  <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-md p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-50 flex flex-col justify-center border border-white/10 rounded-3xl pointer-events-none">
    <h5 className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] mb-6 text-center">Research Genealogy</h5>
    
    <div className="flex flex-col items-center gap-4">
      {/* Origins */}
      <div className="flex gap-2">
        <div className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] text-slate-500 font-bold uppercase">Source Alpha</div>
        <div className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] text-slate-500 font-bold uppercase">Source Beta</div>
      </div>
      
      <i className="fa-solid fa-arrow-down text-indigo-500/50 text-[10px]"></i>
      
      {/* Target */}
      <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-[10px] font-black text-white text-center shadow-lg">
        Active Node: {paper.title.split(' ').slice(0, 3).join(' ')}...
      </div>
      
      <i className="fa-solid fa-arrow-down text-indigo-500/50 text-[10px]"></i>
      
      {/* Branches */}
      <div className="flex gap-2">
        <div className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] text-emerald-500/50 font-bold uppercase">Derivative I</div>
        <div className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] text-emerald-500/50 font-bold uppercase">Derivative II</div>
        <div className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[8px] text-emerald-500/50 font-bold uppercase">Derivative III</div>
      </div>
    </div>
    
    <div className="mt-6 text-[8px] text-slate-600 font-bold uppercase text-center tracking-widest">Hover to sync lineage data</div>
  </div>
);

const PaperCard: React.FC<{ paper: Paper }> = ({ paper }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTreePreview, setShowTreePreview] = useState(false);

  return (
    <div 
      className="glass p-6 rounded-[32px] border border-slate-800 hover:border-indigo-500/30 transition-all relative group flex flex-col justify-between h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowTreePreview(false); }}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h4 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors leading-tight min-h-[3rem]">
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
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all shrink-0"
          >
             <i className="fa-solid fa-file-pdf"></i>
          </a>
        </div>

        <p className="text-[11px] text-slate-500 font-bold truncate">Authors: {paper.authors.join(', ')}</p>

        {/* abstract/intro - prominently displayed as requested */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
          <p className="text-[11px] text-slate-300 line-clamp-4 leading-relaxed italic">
            {paper.abstract || "The abstract for this breakthrough research defines the foundational limits of the technology explored, establishing a new paradigm for intelligence sync."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {paper.awards.map((award, i) => (
            <span key={i} className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-black rounded uppercase border border-yellow-500/20">
              <i className="fa-solid fa-award mr-1"></i> {award}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-slate-800 pt-4">
        <div className="space-y-1">
           <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Momentum</div>
           <PaperTrendSparkline data={paper.trend} />
        </div>
        <div className="text-right">
          <div className="text-[9px] text-slate-600 font-black uppercase">Impact Factor</div>
          <div className="text-xl font-black text-white mono">{paper.citations.toLocaleString()}</div>
          <div className="text-[10px] text-cyan-400 font-bold">Hotness: {paper.hotness}</div>
        </div>
      </div>

      <button 
        onMouseEnter={() => setShowTreePreview(true)}
        className="mt-4 w-full py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-diagram-project"></i> Trace Lineage
      </button>

      {/* Lineage Tree Hover Overlay */}
      {showTreePreview && <HoverLineageTree paper={paper} />}

      {/* Analytics Detailed Hover */}
      {isHovered && !showTreePreview && (
        <div className="absolute inset-x-0 bottom-full mb-4 glass p-6 rounded-[32px] border border-indigo-500/50 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 pointer-events-none">
          <div className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-4">Metric Aggregation Matrix</div>
          <div className="h-32 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={paper.trend.map((v, i) => ({ v, y: 2020 + i }))}>
                  <Area type="monotone" dataKey="v" stroke="#6366f1" fill="#6366f120" strokeWidth={3} />
               </AreaChart>
             </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                <div className="text-[8px] text-slate-600 font-black uppercase">Diffusion</div>
                <div className="text-sm font-black text-emerald-400">92/100</div>
             </div>
             <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                <div className="text-[8px] text-slate-600 font-black uppercase">Velocity</div>
                <div className="text-sm font-black text-cyan-400">+12% / Mo</div>
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
            color: sharedTag ? node.color : '#ffffff10'
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
                  fill="white" 
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
        <div className="absolute bottom-10 right-10 glass p-5 rounded-3xl border border-white/10 animate-in fade-in zoom-in">
           {(() => {
             const p = nodes.find(n => n.id === hoveredNode)?.paper;
             if (!p) return null;
             return (
               <div className="space-y-1">
                 <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{p.tags[0]} Domain</div>
                 <div className="text-sm font-black text-white">{p.title}</div>
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
  const [showCount, setShowCount] = useState(6); // Set to 6 per instruction (trailing text)
  const [activeSort, setActiveSort] = useState<SortOption>(SortOption.INFLUENCE);
  const [selectedInst, setSelectedInst] = useState('All');
  const [selectedField, setSelectedField] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Time Range State
  const [startYear, setStartYear] = useState(2018);
  const [startMonth, setStartMonth] = useState(1);
  const [endYear, setEndYear] = useState(2025);
  const [endMonth, setEndMonth] = useState(12);

  const filteredPapers = useMemo(() => {
    let list = [...PAPERS_MOCK];
    if (selectedInst !== 'All') list = list.filter(p => p.authors.some(a => a.includes(selectedInst)));
    if (selectedField !== 'All') list = list.filter(p => p.tags.includes(selectedField));
    if (searchQuery) list = list.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

    switch (activeSort) {
      case SortOption.CITATIONS: list.sort((a, b) => b.citations - a.citations); break;
      case SortOption.HOTNESS: list.sort((a, b) => b.hotness - a.hotness); break;
      case SortOption.RECENCY: list.sort((a, b) => b.year - a.year); break;
    }
    return list;
  }, [activeSort, selectedInst, selectedField, searchQuery]);

  const years = Array.from({ length: 15 }, (_, i) => 2015 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      {/* Dynamic Keyword Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-8 gap-4">
        <div>
          <h1 className="text-5xl font-black text-white glow-text tracking-tighter">clawd bot</h1>
          <p className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Discovery of Breakthrough Manuscripts</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Archive Velocity</div>
            <div className="text-2xl font-black text-white mono">4.8k/s</div>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
             <i className="fa-solid fa-microchip animate-pulse"></i>
          </div>
        </div>
      </header>

      {/* Advanced Filter Matrix */}
      <div className="glass p-8 rounded-[40px] border border-slate-800 flex flex-col gap-8">
        <div className="flex flex-wrap gap-8 items-end justify-between">
          
          {/* Time Sync */}
          <div className="space-y-4 flex-1 min-w-[300px]">
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Custom Temporal Window</label>
             <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-800 shadow-inner">
               <div className="flex items-center gap-2">
                 <select value={startYear} onChange={e => setStartYear(Number(e.target.value))} className="bg-slate-950 border border-slate-800 text-xs font-bold text-indigo-400 rounded-lg px-3 py-1.5 outline-none">
                    {years.map(y => <option key={y} value={y}>{y}Y</option>)}
                 </select>
                 <select value={startMonth} onChange={e => setStartMonth(Number(e.target.value))} className="bg-slate-950 border border-slate-800 text-xs font-bold text-indigo-400 rounded-lg px-3 py-1.5 outline-none">
                    {months.map(m => <option key={m} value={m}>{m}M</option>)}
                 </select>
               </div>
               <span className="text-slate-600 font-bold text-xs uppercase">To</span>
               <div className="flex items-center gap-2">
                 <select value={endYear} onChange={e => setEndYear(Number(e.target.value))} className="bg-slate-950 border border-slate-800 text-xs font-bold text-indigo-400 rounded-lg px-3 py-1.5 outline-none">
                    {years.map(y => <option key={y} value={y}>{y}Y</option>)}
                 </select>
                 <select value={endMonth} onChange={e => setEndMonth(Number(e.target.value))} className="bg-slate-950 border border-slate-800 text-xs font-bold text-indigo-400 rounded-lg px-3 py-1.5 outline-none">
                    {months.map(m => <option key={m} value={m}>{m}M</option>)}
                 </select>
               </div>
             </div>
          </div>

          {/* Core Sort */}
          <div className="space-y-4">
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Metric Optimization</label>
             <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
               {['INFLUENCE', 'CITATIONS', 'HOTNESS', 'RECENCY'].map(opt => (
                 <button 
                  key={opt}
                  onClick={() => setActiveSort(opt as SortOption)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${activeSort === opt ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </div>

          {/* Detailed Filters */}
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-600 font-black uppercase">Institution</label>
              <select 
                value={selectedInst} 
                onChange={e => setSelectedInst(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none"
              >
                <option value="All">All Entities</option>
                {INSTITUTIONS_MOCK.map(inst => <option key={inst.id} value={inst.name}>{inst.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-600 font-black uppercase">Field</label>
              <select 
                value={selectedField} 
                onChange={e => setSelectedField(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none"
              >
                <option value="All">All Domains</option>
                <option value="Transformer">Transformers</option>
                <option value="LLM">LLMs</option>
                <option value="Deep Learning">Deep Learning</option>
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
            className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:border-indigo-500/50 transition-all outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 1. Paper Cards Grid - Positioned below filter */}
      <section className="space-y-8">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <i className="fa-solid fa-scroll text-indigo-400"></i>
            Verified Breakthrough Library
          </h3>
          <span className="text-[10px] text-slate-500 font-bold tracking-widest bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 uppercase">
             {filteredPapers.length} Manuscripts Detected
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
              className="px-12 py-5 glass border-slate-800 rounded-[32px] text-[10px] font-black text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all uppercase tracking-[0.4em] shadow-xl group"
             >
               Load More Research Nodes <i className="fa-solid fa-chevron-down ml-4 group-hover:translate-y-1 transition-transform"></i>
             </button>
           ) : (
             <button 
              onClick={() => setShowCount(6)}
              className="px-12 py-5 glass border-slate-800 rounded-[32px] text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-[0.4em]"
             >
               Recollapse Repository
             </button>
           )}
        </div>
      </section>

      {/* 2. Paper Cluster Graph - Positioned at bottom */}
      <section className="glass p-12 rounded-[60px] border border-slate-800 h-[600px] relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-10 left-10 z-10">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Manuscript Relational Clusters</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide">Mapping domain affinity across research manuscripts.</p>
        </div>
        <div className="w-full h-full relative">
           <PaperClusterGraph papers={filteredPapers} />
           
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
              <i className="fa-solid fa-scroll text-white text-[150px] animate-pulse"></i>
           </div>
        </div>
      </section>
    </div>
  );
};
