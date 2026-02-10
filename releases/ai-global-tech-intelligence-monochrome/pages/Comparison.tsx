
import React, { useState, useEffect, useMemo } from 'react';
import { 
  SCHOLARS_MOCK, PAPERS_MOCK, INSTITUTIONS_MOCK, 
  REGIONS_LIST, REGIONS, REGIONAL_TRENDS, TREND_MOCK 
} from '../constants';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell
} from 'recharts';

type CompareMode = 'region' | 'institution' | 'scholar';

export const Comparison: React.FC = () => {
  const [mode, setMode] = useState<CompareMode>('region');
  const [itemA, setItemA] = useState<string>('USA');
  const [itemB, setItemB] = useState<string>('China');
  const [activeMetric, setActiveMetric] = useState<string>('compositeIndex');
  const [raceYear, setRaceYear] = useState(2024);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  // Synchronize selection on mode change
  useEffect(() => {
    if (mode === 'region') {
      setItemA('USA');
      setItemB('China');
    } else if (mode === 'institution') {
      setItemA('i1');
      setItemB('i2');
    } else if (mode === 'scholar') {
      setItemA('s1');
      setItemB('s2');
    }
  }, [mode]);

  const getEntityA = useMemo(() => {
    if (mode === 'region') return REGIONS_LIST.find(r => r.id === itemA);
    if (mode === 'institution') return INSTITUTIONS_MOCK.find(i => i.id === itemA);
    return SCHOLARS_MOCK.find(s => s.id === itemA);
  }, [mode, itemA]);

  const getEntityB = useMemo(() => {
    if (mode === 'region') return REGIONS_LIST.find(r => r.id === itemB);
    if (mode === 'institution') return INSTITUTIONS_MOCK.find(i => i.id === itemB);
    return SCHOLARS_MOCK.find(s => s.id === itemB);
  }, [mode, itemB]);

  const getLabel = (id: string) => {
    if (mode === 'region') return id;
    if (mode === 'institution') return INSTITUTIONS_MOCK.find(i => i.id === id)?.name || id;
    return SCHOLARS_MOCK.find(s => s.id === id)?.nameEn || id;
  };

  const getTrendData = () => {
    if (mode === 'region') {
      const dataA = REGIONAL_TRENDS[itemA] || [];
      const dataB = REGIONAL_TRENDS[itemB] || [];
      return dataA.map((d, i) => ({
        time: d.time,
        [itemA]: d[activeMetric] || 0,
        [itemB]: dataB[i]?.[activeMetric] || 0
      }));
    }
    
    // For scholars or institutions, use mock trend based on global trend mock
    return TREND_MOCK.map((d) => {
      const base = d[activeMetric as keyof typeof d] as number || 0;
      let valA = 0;
      let valB = 0;

      if (mode === 'scholar') {
        const sA = SCHOLARS_MOCK.find(x => x.id === itemA);
        const sB = SCHOLARS_MOCK.find(x => x.id === itemB);
        valA = base * ((sA?.hotness || 50) / 100);
        valB = base * ((sB?.hotness || 50) / 100);
      } else {
        const iA = INSTITUTIONS_MOCK.find(x => x.id === itemA);
        const iB = INSTITUTIONS_MOCK.find(x => x.id === itemB);
        valA = base * ((iA?.articleCount || 1000) / 2000);
        valB = base * ((iB?.articleCount || 1000) / 2000);
      }

      return {
        time: d.time,
        [getLabel(itemA)]: valA,
        [getLabel(itemB)]: valB
      };
    });
  };

  const horseRaceData = useMemo(() => {
    let raw: any[] = [];
    if (mode === 'region') raw = REGIONS_LIST;
    else if (mode === 'institution') raw = INSTITUTIONS_MOCK;
    else raw = SCHOLARS_MOCK;

    return raw.map(item => {
      const history = item.rankHistory.find((h: any) => h.year === raceYear) || item.rankHistory[0] || { score: 0 };
      return {
        name: mode === 'scholar' ? item.nameEn : item.name,
        score: history.score,
        id: item.id
      };
    }).sort((a, b) => b.score - a.score);
  }, [mode, raceYear]);

  if (!getEntityA || !getEntityB) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Node Selection Hub */}
      <div className="glass p-10 rounded-[40px] border border-slate-800 flex flex-col xl:flex-row justify-between items-center gap-12">
        <div className="flex bg-slate-900/80 p-2 rounded-2xl border border-slate-800 self-start xl:self-center">
          {(['region', 'institution', 'scholar'] as CompareMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-10 py-3 rounded-xl text-xs font-bold uppercase transition-all tracking-widest ${mode === m ? 'bg-cyan-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              {m} Battle
            </button>
          ))}
        </div>

        <div className="flex items-center gap-10 flex-1 justify-center max-w-5xl w-full">
          <div className="flex-1 space-y-2 group">
            <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.3em] ml-2 block transition-colors group-hover:text-cyan-300">Target Node Alpha</label>
            <div className="relative">
              <select 
                value={itemA} 
                onChange={(e) => setItemA(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm text-cyan-400 font-black outline-none focus:border-cyan-500/50 appearance-none shadow-inner"
              >
                {mode === 'region' && REGIONS_LIST.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                {mode === 'institution' && INSTITUTIONS_MOCK.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                {mode === 'scholar' && SCHOLARS_MOCK.map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-cyan-900 pointer-events-none"></i>
            </div>
          </div>

          <div className="text-4xl font-black text-white px-2 italic opacity-10 select-none animate-pulse">VS</div>

          <div className="flex-1 space-y-2 group">
             <label className="text-[10px] text-pink-400 font-bold uppercase tracking-[0.3em] ml-2 block transition-colors group-hover:text-pink-300">Target Node Bravo</label>
             <div className="relative">
               <select 
                value={itemB} 
                onChange={(e) => setItemB(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm text-pink-400 font-black outline-none focus:border-pink-500/50 appearance-none shadow-inner"
              >
                {mode === 'region' && REGIONS_LIST.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                {mode === 'institution' && INSTITUTIONS_MOCK.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                {mode === 'scholar' && SCHOLARS_MOCK.map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-pink-900 pointer-events-none"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Horse Race: Dynamic Vertical Ranking */}
      <section className="glass p-12 rounded-[50px] border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
           <div>
             <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
               <i className="fa-solid fa-bolt-lightning text-yellow-400"></i>
               Horse Race: Global Momentum
             </h3>
             <p className="text-slate-500 text-xs mt-2 font-bold tracking-widest uppercase">Real-time competitive displacement index.</p>
           </div>
           <div className="flex gap-2 bg-slate-900/40 p-1.5 rounded-full border border-slate-800">
             {[2020, 2021, 2022, 2023, 2024].map(y => (
               <button 
                 key={y} 
                 onClick={() => setRaceYear(y)}
                 className={`px-5 py-2.5 rounded-full font-black text-xs transition-all ${raceYear === y ? 'bg-white text-black shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 {y}
               </button>
             ))}
           </div>
        </div>
        <div className="h-[350px] relative z-10">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart 
                layout="vertical" 
                data={horseRaceData} 
                margin={{ left: 80, right: 120 }}
                onMouseMove={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    setHoveredEntity(state.activePayload[0].payload.id);
                  }
                }}
                onMouseLeave={() => setHoveredEntity(null)}
              >
               <XAxis type="number" hide domain={[0, 100]} />
               <YAxis type="category" dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} fontWeight="bold" />
               <Tooltip 
                 content={({ active, payload }) => {
                   if (active && payload && payload.length) {
                     return (
                        <div className="glass p-4 rounded-2xl border border-white/10 shadow-2xl">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Impact Score</p>
                          <p className="text-xl font-black text-white">{payload[0].value}</p>
                        </div>
                     );
                   }
                   return null;
                 }}
                 cursor={{ fill: 'rgba(255,255,255,0.03)' }}
               />
               <Bar dataKey="score" radius={[0, 14, 14, 0]} animationDuration={1000} barSize={32}>
                 {horseRaceData.map((entry, index) => (
                   <Cell 
                    key={`cell-${index}`} 
                    fill={entry.id === itemA ? '#06b6d4' : entry.id === itemB ? '#ec4899' : '#1e293b'} 
                    fillOpacity={hoveredEntity && hoveredEntity !== entry.id ? 0.3 : 1}
                    className="transition-all duration-300"
                   />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>
      </section>

      {/* Influence Radar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass p-12 rounded-[50px] border border-slate-800 relative overflow-hidden flex flex-col items-center group/card">
          <div className="absolute top-12 left-12">
            <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.5em] mb-2 opacity-50">Intel Mapping: Delta</div>
            <h4 className="text-3xl font-black text-white tracking-tight">{getLabel(itemA)}</h4>
            {mode === 'scholar' && <p className="text-slate-500 font-bold text-xs uppercase mt-1">{(getEntityA as any).institution[0]}</p>}
          </div>
          <div className="w-full h-[450px] mt-20">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getEntityA.influenceScores}>
                <PolarGrid stroke="#ffffff08" />
                <PolarAngleAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '800' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name={getLabel(itemA)}
                  dataKey="value"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.15}
                  strokeWidth={5}
                  animationDuration={2000}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-12 rounded-[50px] border border-slate-800 relative overflow-hidden flex flex-col items-center group/card">
           <div className="absolute top-12 right-12 text-right">
            <div className="text-[10px] text-pink-400 font-black uppercase tracking-[0.5em] mb-2 opacity-50">Intel Mapping: Gamma</div>
            <h4 className="text-3xl font-black text-white tracking-tight">{getLabel(itemB)}</h4>
            {mode === 'scholar' && <p className="text-slate-500 font-bold text-xs uppercase mt-1">{(getEntityB as any).institution[0]}</p>}
          </div>
          <div className="w-full h-[450px] mt-20">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getEntityB.influenceScores}>
                <PolarGrid stroke="#ffffff08" />
                <PolarAngleAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '800' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name={getLabel(itemB)}
                  dataKey="value"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.15}
                  strokeWidth={5}
                  animationDuration={2000}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trajectory Convergence Area */}
      <div className="glass p-12 rounded-[60px] border border-slate-800 h-[650px] flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <i className="fa-solid fa-microchip text-2xl"></i>
            </div>
            Trajectory Convergence Matrix
          </h3>
          <div className="flex gap-2 bg-slate-900/60 p-2 rounded-2xl border border-white/5 shadow-inner">
            {['compositeIndex', 'papers', 'social', 'news'].map(m => (
              <button 
                key={m} 
                onClick={() => setActiveMetric(m)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${activeMetric === m ? 'bg-indigo-500 text-white shadow-2xl' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {m.replace('compositeIndex', 'Impact Index')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getTrendData()}>
              <defs>
                <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#ffffff03" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} fontWeight="bold" />
              <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} fontWeight="bold" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '32px', padding: '24px' }}
                itemStyle={{ fontSize: '12px', fontWeight: '900' }}
              />
              <Legend verticalAlign="top" height={48} iconType="rect" iconSize={12} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              <Area 
                type="monotone" 
                dataKey={getLabel(itemA)} 
                stroke="#06b6d4" 
                strokeWidth={6} 
                fillOpacity={1} 
                fill="url(#colorA)" 
                animationDuration={2500}
              />
              <Area 
                type="monotone" 
                dataKey={getLabel(itemB)} 
                stroke="#ec4899" 
                strokeWidth={6} 
                fillOpacity={1} 
                fill="url(#colorB)" 
                animationDuration={2500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategic Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="glass p-14 rounded-[60px] border border-slate-800 space-y-10 relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-500">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/5 blur-[100px] rounded-full group-hover:bg-cyan-500/10 transition-colors"></div>
          <div className="flex items-center gap-8 border-b border-slate-800 pb-10">
            <div className="w-20 h-20 rounded-[24px] bg-cyan-500/10 flex items-center justify-center font-black text-cyan-400 text-4xl shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-cyan-500/20">A</div>
            <div>
              <h4 className="font-black text-white text-3xl tracking-tight">{getLabel(itemA)}</h4>
              <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">Intel Node Alpha Spectrum</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
             <div className="p-8 bg-slate-900/60 rounded-[32px] border border-slate-800/50 hover:border-cyan-500/20 transition-all">
               <div className="text-[10px] text-slate-500 font-black uppercase mb-3 tracking-widest">Velocity Coefficient</div>
               <div className="text-3xl font-black text-white">+{((getEntityA as any).hotness / 3).toFixed(1)}%</div>
             </div>
             <div className="p-8 bg-slate-900/60 rounded-[32px] border border-slate-800/50 hover:border-cyan-500/20 transition-all">
               <div className="text-[10px] text-slate-500 font-black uppercase mb-3 tracking-widest">Momentum Tier</div>
               <div className="text-3xl font-black text-cyan-400">S-Class</div>
             </div>
          </div>
          <div className="space-y-4">
             <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] px-2 mb-6">Historical Inflection Points</div>
             {getEntityA.rankHistory.map((h: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-5 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-cyan-500/40 transition-all">
                  <span className="text-sm font-black text-white tracking-widest">{h.year} SYNC</span>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] text-slate-500 font-black">RANK {h.rank}</span>
                    <span className="text-sm font-black text-cyan-400 mono">{h.score} pts</span>
                  </div>
                </div>
             ))}
          </div>
        </div>

        <div className="glass p-14 rounded-[60px] border border-slate-800 space-y-10 relative overflow-hidden group hover:border-pink-500/20 transition-all duration-500">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-pink-500/5 blur-[100px] rounded-full group-hover:bg-pink-500/10 transition-colors"></div>
          <div className="flex items-center gap-8 border-b border-slate-800 pb-10">
            <div className="w-20 h-20 rounded-[24px] bg-pink-500/10 flex items-center justify-center font-black text-pink-400 text-4xl shadow-[0_0_30px_rgba(236,72,153,0.2)] border border-pink-500/20">B</div>
            <div>
              <h4 className="font-black text-white text-3xl tracking-tight">{getLabel(itemB)}</h4>
              <div className="text-[10px] text-pink-400 font-black uppercase tracking-[0.4em] mt-2">Intel Node Bravo Spectrum</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
             <div className="p-8 bg-slate-900/60 rounded-[32px] border border-slate-800/50 hover:border-pink-500/20 transition-all">
               <div className="text-[10px] text-slate-500 font-black uppercase mb-3 tracking-widest">Velocity Coefficient</div>
               <div className="text-3xl font-black text-white">+{((getEntityB as any).hotness / 3).toFixed(1)}%</div>
             </div>
             <div className="p-8 bg-slate-900/60 rounded-[32px] border border-slate-800/50 hover:border-pink-500/20 transition-all">
               <div className="text-[10px] text-slate-500 font-black uppercase mb-3 tracking-widest">Momentum Tier</div>
               <div className="text-3xl font-black text-pink-400">A-Class</div>
             </div>
          </div>
          <div className="space-y-4">
             <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] px-2 mb-6">Historical Inflection Points</div>
             {getEntityB.rankHistory.map((h: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-5 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-pink-500/40 transition-all">
                  <span className="text-sm font-black text-white tracking-widest">{h.year} SYNC</span>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] text-slate-500 font-black">RANK {h.rank}</span>
                    <span className="text-sm font-black text-pink-400 mono">{h.score} pts</span>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
