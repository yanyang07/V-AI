
import React, { useState } from 'react';
import { SCHOLARS_MOCK, PAPERS_MOCK } from '../constants';
import { Scholar, Paper, SortOption } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const Sparkline = ({ color }: { color: string }) => {
  const data = Array.from({ length: 10 }, (_, i) => ({ val: Math.random() * 100 }));
  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ScholarCard: React.FC<{ scholar: Scholar }> = ({ scholar }) => {
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <div className="glass p-5 rounded-3xl border border-slate-800 hover:border-cyan-500/30 transition-all relative group">
      <div className="flex justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
            {scholar.nameEn} ({scholar.nameZh})
          </h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {scholar.institution.map((inst, i) => (
              <span 
                key={i} 
                className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 hover:text-cyan-300 cursor-pointer"
                onMouseEnter={() => setShowTimeline(true)}
                onMouseLeave={() => setShowTimeline(false)}
              >
                {inst}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div className="group/hot relative">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Impact</div>
            <div className="flex items-center gap-2">
              <Sparkline color="#06b6d4" />
              <span className="text-lg font-bold text-cyan-400 mono">{scholar.hotness}</span>
            </div>
            {/* Hover Chart Tooltip */}
            <div className="absolute top-0 right-full mr-4 p-4 glass rounded-xl border border-cyan-500/50 opacity-0 group-hover/hot:opacity-100 transition-opacity pointer-events-none z-50 w-48">
              <div className="text-[10px] font-bold text-cyan-400 mb-2 uppercase">Global Influence Trajectory</div>
              <div className="h-24 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[10, 40, 25, 50, 45, 80, 75, 98].map(v => ({v}))}>
                      <Line type="step" dataKey="v" stroke="#06b6d4" dot={false} strokeWidth={3} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mb-4">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-microscope text-cyan-500/50"></i>
          <span>{scholar.field.join(', ')}</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-envelope text-slate-600"></i>
          <span className="truncate">{scholar.email}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {scholar.awards.slice(0, 2).map((a, i) => (
            <span 
              key={i} 
              className="text-[9px] font-bold uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded cursor-help border border-yellow-500/20"
              onMouseEnter={() => setShowTimeline(true)}
              onMouseLeave={() => setShowTimeline(false)}
            >
              {a.year} {a.name}
            </span>
          ))}
        </div>
        <div className="text-[10px] font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          {(scholar.citations/1000).toFixed(1)}K CITATIONS
        </div>
      </div>

      {/* Hover Timeline Overlay */}
      {showTimeline && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl rounded-3xl z-40 p-6 overflow-y-auto animate-in fade-in zoom-in duration-300">
          <h5 className="font-bold text-cyan-400 text-sm mb-4 uppercase tracking-widest">Scholar Career Timeline</h5>
          <div className="space-y-4 border-l border-cyan-500/30 ml-2 pl-6">
            {scholar.awards.map((a, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                <div className="text-xs font-bold text-white">{a.year} - {a.name}</div>
                <div className="text-[10px] text-slate-500">{a.organization}</div>
              </div>
            ))}
            <div className="relative">
              <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full bg-slate-700"></div>
              <div className="text-xs font-bold text-slate-400">Current - {scholar.institution[0]}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaperCard: React.FC<{ paper: Paper }> = ({ paper }) => (
  <div className="glass p-5 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all group">
    <div className="flex justify-between items-start mb-3">
      <h4 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 pr-4">
        <a 
          href={paper.url || "#"} 
          target={paper.url ? "_blank" : "_self"} 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {paper.title}
        </a>
      </h4>
      <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[10px] font-bold mono">
        {paper.citations.toLocaleString()}
      </div>
    </div>
    <div className="text-xs text-slate-500 mb-4">{paper.authors.join(', ')}</div>
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        {paper.tags.map(tag => (
          <span key={tag} className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider">{tag}</span>
        ))}
      </div>
      <div className="text-[10px] text-slate-400 font-bold italic">{paper.venue} {paper.year}</div>
    </div>
  </div>
);

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(true);
  const [activeSort, setActiveSort] = useState<SortOption>(SortOption.RELEVANCE);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="flex-1 w-full relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input 
            type="text" 
            placeholder="Search scholars, papers, or emerging domains..."
            className="w-full h-14 bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 transition-all text-lg font-medium shadow-2xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className={`h-14 px-6 rounded-2xl border flex items-center gap-3 transition-all ${filterOpen ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-sliders"></i>
            <span className="font-bold uppercase tracking-wider text-xs">Filters</span>
          </button>
          <button className="h-14 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            EXPLORE
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Multilevel Collapsible Filter */}
        {filterOpen && (
          <aside className="lg:w-72 shrink-0 space-y-6 animate-in slide-in-from-left duration-500">
            <div className="glass p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h5 className="font-bold text-white text-sm uppercase tracking-widest">Refine Nodes</h5>
                <button className="text-[10px] text-slate-500 hover:text-cyan-400 font-bold uppercase">Reset</button>
              </div>

              <div className="space-y-8">
                {/* Level 1: Domain */}
                <div>
                  <label className="text-[10px] text-cyan-500 font-bold uppercase mb-4 block tracking-widest">1. Macro Domain</label>
                  <div className="space-y-2">
                    {['Computer Science', 'Physical Sciences', 'Life Sciences', 'Social Sciences'].map(d => (
                      <label key={d} className="flex items-center gap-3 group cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 checked:bg-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900" defaultChecked={d === 'Computer Science'} />
                        <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level 2: Sub-domain (Nested example) */}
                <div className="pl-4 border-l border-slate-800">
                  <label className="text-[10px] text-indigo-400 font-bold uppercase mb-4 block tracking-widest">2. Intelligence Sub-field</label>
                  <div className="space-y-2">
                    {['Computer Vision', 'Deep Learning', 'Natural Language', 'Robotics'].map(d => (
                      <label key={d} className="flex items-center gap-3 group cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 checked:bg-indigo-500" defaultChecked={d === 'Deep Learning'} />
                        <span className="text-sm text-slate-400 group-hover:text-slate-200">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level 3: Specific Constraints */}
                <div className="pl-4 border-l border-slate-800">
                  <label className="text-[10px] text-emerald-400 font-bold uppercase mb-4 block tracking-widest">3. Performance Metrics</label>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                        <span>H-INDEX</span>
                        <span className="text-white">40+</span>
                      </div>
                      <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full py-4 glass border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400 hover:bg-slate-800/50 flex items-center justify-center gap-2">
              <i className="fa-solid fa-download"></i>
              EXPORT RESULT AGGREGATION (.CSV / .JSON)
            </button>
          </aside>
        )}

        <div className="flex-1 space-y-12">
          {/* Scholars Module */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-sm">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </span>
                  World-Class Scholars
                </h3>
                <p className="text-xs text-slate-500 mt-1">Found 4,209 results matching current filters</p>
              </div>
              <div className="flex gap-2">
                {(Object.values(SortOption) as string[]).map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setActiveSort(opt as SortOption)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeSort === opt ? 'bg-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCHOLARS_MOCK.map(s => <ScholarCard key={s.id} scholar={s} />)}
              <div className="glass flex items-center justify-center rounded-3xl border-dashed border-2 border-slate-800 p-8 group cursor-pointer hover:bg-slate-900/50 transition-all">
                <div className="text-center">
                  <i className="fa-solid fa-chevron-right text-slate-600 mb-2 text-xl group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"></i>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300">View More Scholars</div>
                </div>
              </div>
            </div>
          </section>

          {/* Papers Module */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm">
                    <i className="fa-solid fa-file-invoice"></i>
                  </span>
                  Breakthrough Manuscripts
                </h3>
              </div>
              <button className="text-xs font-bold text-indigo-400 hover:underline">VIEW VERTICAL LIST</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PAPERS_MOCK.map(p => <PaperCard key={p.id} paper={p} />)}
              <div className="glass flex items-center justify-center rounded-3xl border-dashed border-2 border-slate-800 p-6 group cursor-pointer hover:bg-slate-900/50 transition-all">
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-indigo-400">Expand Library</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
