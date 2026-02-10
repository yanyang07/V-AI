
import React, { useState, useMemo, useRef } from 'react';
import { TrendChart } from '../components/TrendChart';
import { SCHOLARS_MOCK, PAPERS_MOCK, INSTITUTIONS_MOCK, SOCIAL_POSTS_MOCK, TREND_MOCK, HOT_WORDS_MOCK } from '../constants';
import { HotWordCategory } from '../types';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CategoryColorMap: Record<HotWordCategory, string> = {
  'Technology': '#06b6d4', 
  'Company': '#a855f7',    
  'Person': '#f59e0b',     
  'Product': '#ec4899'     
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
  const enhancedHotWords = useMemo(() => {
    return HOT_WORDS_MOCK.map(hw => ({
      ...hw,
      displayHeat: Math.floor(hw.heat * 300 + 20000 + Math.random() * 2000)
    }));
  }, []);

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

interface HomeProps {
  setActiveTab?: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const latest = TREND_MOCK[TREND_MOCK.length - 1];
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chartMetric, setChartMetric] = useState('compositeIndex');
  const chartRef = useRef<HTMLDivElement>(null);

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
      <header className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <h1 className="text-6xl font-black text-[var(--text-base)] tracking-tighter glow-text">Clawd Search</h1>
            <div 
              className="flex items-center gap-4 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl cursor-pointer group hover:scale-105 transition-all shadow-sm"
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <MetricCard 
          label="新增文献" 
          value="980" 
          sub={latest.paperGrowth} 
          color="cyan" 
          onClick={() => setActiveTab?.('papers')}
        />
        <MetricCard label="增长动能" value={latest.paperGrowth} sub="High Velocity" color="emerald" />
        <MetricCard 
          label="相关融资" 
          value="$366M" 
          sub="+112% YoY" 
          color="cyan"
          onClick={handleFundingClick}
        />
        <MetricCard 
          label="活跃机构" 
          value="2.4K+" 
          sub="Global Nodes" 
          color="emerald" 
          onClick={() => setActiveTab?.('institutions')}
        />
        <MetricCard label="新闻聚合" value="11k" sub="Real-time" color="cyan" />
        <MetricCard label="引用影响" value={`${(latest.citations/1000).toFixed(1)}K`} sub="Impact High" color="emerald" />
      </div>

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
            {/* Institution List */}
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
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-3">
                {INSTITUTIONS_MOCK.map(inst => (
                  <div 
                    key={inst.id} 
                    className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-color)] hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-[var(--text-base)] shadow-sm border border-slate-100 dark:border-slate-700">{inst.logo}</div>
                      <div>
                        <div className="text-sm font-black text-[var(--text-base)]">{inst.name}</div>
                        <div className="text-[10px] text-[var(--text-dim)] font-bold">{inst.articleCount} Articles</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400">{inst.fundingStatus}</div>
                      <div className="text-xs font-black text-[var(--text-base)] mono">{inst.lastAmount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Figures */}
            <div className="glass p-8 rounded-[40px] h-[500px] flex flex-col">
              <h3 className="text-lg font-black text-[var(--text-base)] mb-8 flex items-center gap-4 uppercase">
                <i className="fa-solid fa-user-astronaut text-indigo-600"></i> 全球核心影响力学者
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-3">
                {SCHOLARS_MOCK.map(s => (
                  <div 
                    key={s.id} 
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-color)] hover:border-indigo-500/30 transition-all flex items-center gap-5 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-xl font-black text-indigo-600 shadow-sm">{s.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-[var(--text-base)] truncate">{s.nameEn} <span className="opacity-40 font-bold ml-1">({s.nameZh})</span></div>
                      <div className="text-[10px] text-[var(--text-dim)] font-bold truncate mt-1">{s.institution[0]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: SocialBuzz */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[48px] h-full flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-[var(--text-base)] uppercase tracking-widest flex items-center gap-4">
                <i className="fa-solid fa-satellite text-pink-600"></i>
                社交媒体热议
              </h3>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-black rounded-full">SYNC_LIVE</div>
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-3">
              {SOCIAL_POSTS_MOCK.map(post => (
                <div 
                  key={post.id} 
                  className="block p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-color)] hover:border-pink-500/40 transition-all relative overflow-hidden group shadow-sm"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${post.platform === 'X' ? 'bg-slate-800 dark:bg-white' : 'bg-orange-600'}`}></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-[var(--text-dim)] border border-[var(--border-color)]">{post.avatar}</div>
                    <div className="flex-1">
                      <div className="text-xs font-black text-[var(--text-base)]">@{post.user}</div>
                      <div className="text-[9px] text-[var(--text-dim)] font-black uppercase">{post.platform} Intelligence</div>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed font-medium">
                    "{post.content}"
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-4">
                      <i className="fa-regular fa-comment text-[var(--text-dim)] text-[10px]"></i>
                      <i className="fa-regular fa-heart text-[var(--text-dim)] text-[10px]"></i>
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${post.sentiment === 'positive' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {post.sentiment}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
