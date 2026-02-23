
import React, { useState, useMemo } from 'react';
import { INSTITUTIONS_MOCK, KEYWORDS_LIST } from '../constants';
import { Institution } from '../types';
import { KeywordSwitcher } from '../components/KeywordSwitcher';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, Tooltip } from 'recharts';

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) return <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-black text-xl shadow-[0_0_15px_rgba(234,179,8,0.3)]">1</div>;
  if (rank === 2) return <div className="w-10 h-10 rounded-xl bg-slate-300/50 border border-slate-400/50 flex items-center justify-center text-slate-600 dark:text-slate-200 font-black text-xl shadow-[0_0_15px_rgba(203,213,225,0.3)]">2</div>;
  if (rank === 3) return <div className="w-10 h-10 rounded-xl bg-orange-700/20 border border-orange-700/50 flex items-center justify-center text-orange-600 dark:text-orange-400 font-black text-xl shadow-[0_0_15px_rgba(194,65,12,0.3)]">3</div>;
  return <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-500 font-black text-lg">{rank}</div>;
};

const InstitutionCard: React.FC<{ institution: Institution; rank: number }> = ({ institution, rank }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative glass p-6 lg:p-8 rounded-[32px] border border-[var(--border-color)] hover:border-cyan-500/30 transition-all duration-300 animate-in slide-in-from-bottom-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Rank & Identity */}
        <div className="flex flex-col gap-6 w-full xl:w-1/4 shrink-0">
          <div className="flex items-center gap-6">
            <RankBadge rank={rank} />
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white shadow-sm dark:shadow-lg shrink-0 relative overflow-hidden">
                 {institution.logo}
                 <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">{institution.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                   <i className="fa-solid fa-location-dot"></i> {institution.region}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-[var(--border-color)]">
             <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">
               {institution.description}
             </p>
          </div>

          <a 
            href={institution.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-500 text-slate-600 dark:text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Visit Official Site <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>

        {/* Intelligence Data Grid */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Row: Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-[var(--border-color)]">
                   <div className="text-[9px] text-slate-500 font-black uppercase mb-1 flex items-center gap-2">
                      <i className="fa-solid fa-people-group text-blue-500"></i> Workforce
                   </div>
                   <div className="text-lg font-black text-slate-900 dark:text-white">{institution.staffCount}</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-[var(--border-color)]">
                   <div className="text-[9px] text-slate-500 font-black uppercase mb-1 flex items-center gap-2">
                      <i className="fa-solid fa-sack-dollar text-emerald-500"></i> Status
                   </div>
                   <div className="text-lg font-black text-slate-900 dark:text-white">{institution.fundingStatus}</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-[var(--border-color)]">
                   <div className="text-[9px] text-slate-500 font-black uppercase mb-1 flex items-center gap-2">
                      <i className="fa-solid fa-scroll text-purple-500"></i> Output
                   </div>
                   <div className="text-lg font-black text-slate-900 dark:text-white">{institution.articleCount.toLocaleString()}</div>
                </div>

                 <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-[var(--border-color)]">
                   <div className="text-[9px] text-slate-500 font-black uppercase mb-1 flex items-center gap-2">
                      <i className="fa-solid fa-fire text-orange-500"></i> Heat
                   </div>
                   <div className="text-lg font-black text-cyan-600 dark:text-cyan-400">{institution.hotness}</div>
                </div>
            </div>

            {/* Funding Trend Chart */}
            <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-[var(--border-color)] p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                   <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Capital Trend</div>
                   <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{institution.lastAmount}</div>
                </div>
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={institution.fundingTrend}>
                       <defs>
                          <linearGradient id={`fundGrad-${institution.id}`} x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <Tooltip 
                         content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                               return (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg shadow-xl">
                                     <div className="text-[9px] text-slate-400 uppercase">{payload[0].payload.year}</div>
                                     <div className="text-xs font-bold text-slate-900 dark:text-white">{payload[0].payload.label}</div>
                                  </div>
                               )
                            }
                            return null;
                         }}
                         cursor={{ stroke: 'var(--border-color)' }}
                       />
                       <Area type="monotone" dataKey="amount" stroke="#10b981" fill={`url(#fundGrad-${institution.id})`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Investment & Portfolio Info */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[var(--border-color)]">
                <div>
                   <div className="text-[9px] text-slate-500 font-black uppercase mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-hand-holding-dollar"></i> Backed By (Investors)
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {institution.investors.length > 0 ? institution.investors.slice(0, 4).map((inv, i) => (
                         <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {inv}
                         </span>
                      )) : <span className="text-[10px] text-slate-600 italic">Self-funded / Undisclosed</span>}
                      {institution.investors.length > 4 && <span className="text-[10px] text-slate-500 self-center">+{institution.investors.length - 4}</span>}
                   </div>
                </div>
                
                <div>
                   <div className="text-[9px] text-slate-500 font-black uppercase mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-bullseye"></i> Key Portfolio / Projects
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {institution.portfolio.length > 0 ? institution.portfolio.slice(0, 4).map((port, i) => (
                         <span key={i} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-300 whitespace-nowrap">
                            {port}
                         </span>
                      )) : <span className="text-[10px] text-slate-600 italic">Internal R&D Only</span>}
                   </div>
                </div>
            </div>
        </div>

        {/* Heat Index Radar - Right Side */}
        <div className="w-full xl:w-48 flex flex-col items-center justify-center shrink-0 border-l border-[var(--border-color)] pl-0 xl:pl-6 pt-6 xl:pt-0">
           <div className="text-center mb-2">
              <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Influence Radar</div>
              <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mono glow-text">{institution.hotness.toFixed(1)}</div>
           </div>
           
           <div className="w-32 h-32 opacity-80 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={institution.influenceScores}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="label" tick={false} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                       name="Influence"
                       dataKey="value"
                       stroke="#06b6d4"
                       fill="#06b6d4"
                       fillOpacity={0.4}
                    />
                 </RadarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export const Institutions: React.FC = () => {
  const [filterRegion, setFilterRegion] = useState('All');
  const [activeKeyword, setActiveKeyword] = useState(KEYWORDS_LIST[0]);
  const [sortBy, setSortBy] = useState<'hotness' | 'funding' | 'research' | 'product'>('hotness');

  const sortedInstitutions = useMemo(() => {
    let data = [...INSTITUTIONS_MOCK];
    
    if (filterRegion !== 'All') {
      data = data.filter(i => i.region.includes(filterRegion));
    }

    data.sort((a, b) => {
      switch (sortBy) {
        case 'funding': 
            // Simple sort logic using trend amounts logic
            const getMaxFund = (inst: Institution) => Math.max(...inst.fundingTrend.map(f => f.amount));
            return getMaxFund(b) - getMaxFund(a);
        case 'research': return b.articleCount - a.articleCount;
        case 'product': return b.productCount - a.productCount;
        default: return b.hotness - a.hotness;
      }
    });

    return data;
  }, [filterRegion, sortBy]);

  // Calculations for aggregate stats
  const totalFunding = "$45B+";
  const totalPapers = sortedInstitutions.reduce((acc, curr) => acc + curr.articleCount, 0).toLocaleString();
  const activeNodes = sortedInstitutions.length;

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700 p-4 lg:p-10">
      
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--border-color)] pb-8 gap-6">
        <div className="relative">
          <KeywordSwitcher keywords={KEYWORDS_LIST} value={activeKeyword} onChange={setActiveKeyword} accent="emerald" />
          <p className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Institutional Intelligence Matrix</p>
        </div>
        
        <div className="flex gap-8">
           <div className="text-right hidden md:block">
              <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Sector Liquidity</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mono">{totalFunding}</div>
           </div>
           <div className="text-right hidden md:block">
              <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Total Output</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mono">{totalPapers} Docs</div>
           </div>
           <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
             <i className="fa-solid fa-server animate-pulse"></i>
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <div className="glass p-6 rounded-[32px] border border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest whitespace-nowrap">Sort Matrix:</span>
            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl border border-[var(--border-color)]">
               {[
                 { id: 'hotness', label: 'Composite Heat', icon: 'fa-fire' },
                 { id: 'funding', label: 'Capital Flow', icon: 'fa-sack-dollar' },
                 { id: 'research', label: 'Research', icon: 'fa-book' },
                 { id: 'product', label: 'Product', icon: 'fa-box' }
               ].map(opt => (
                 <button
                   key={opt.id}
                   onClick={() => setSortBy(opt.id as any)}
                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${sortBy === opt.id ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                 >
                   <i className={`fa-solid ${opt.icon}`}></i> {opt.label}
                 </button>
               ))}
            </div>
         </div>

         <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest whitespace-nowrap">Geospatial Filter:</span>
            <select 
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500/50"
            >
               <option value="All">Global View</option>
               <option value="USA">North America (USA)</option>
               <option value="China">Asia (China)</option>
               <option value="EU">Europe</option>
            </select>
         </div>
      </div>

      {/* Leaderboard List */}
      <section className="space-y-4">
        {sortedInstitutions.map((inst, index) => (
           <InstitutionCard key={inst.id} institution={inst} rank={index + 1} />
        ))}
      </section>

      {/* Footer / Status */}
      <div className="text-center pt-8">
         <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-900/50 rounded-full border border-[var(--border-color)]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Sync: {activeNodes} Nodes Monitored</span>
         </div>
      </div>

    </div>
  );
};
