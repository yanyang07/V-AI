
import React, { useState, useEffect } from 'react';
import { HOT_WORDS_MOCK, SOCIAL_POSTS_MOCK, PAPERS_MOCK, PROJECTS_MOCK, NEWS_MOCK } from '../constants';
import { HotWordCategory } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface LandingProps {
  setActiveTab: (tab: string) => void;
}

const CategoryColorMap: Record<HotWordCategory, string> = {
  'Technology': '#06b6d4', // Cyan
  'Company': '#8b5cf6',    // Purple
  'Person': '#f59e0b',     // Amber
  'Product': '#ec4899'     // Pink
};

const Sparkline: React.FC<{ data: number[], color: string, isHovered: boolean }> = ({ data, color, isHovered }) => {
  const [key, setKey] = useState(0);
  
  // Re-trigger animation on hover
  useEffect(() => {
    if (isHovered) setKey(prev => prev + 1);
  }, [isHovered]);

  const chartData = data.map((v) => ({ v }));
  return (
    <div className={`w-16 h-8 transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} key={key}>
          <Line 
            type="monotone" 
            dataKey="v" 
            stroke={color} 
            strokeWidth={3} 
            dot={false} 
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const Landing: React.FC<LandingProps> = ({ setActiveTab }) => {
  const [query, setQuery] = useState('');
  const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);

  const handleHotWordClick = (word: string) => {
    if (word.toLowerCase() === 'clawd bot') {
      setActiveTab('home');
    }
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setActiveTab('home');
              }
            }}
          />
          <button 
            onClick={() => setActiveTab('home')}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl px-12 py-5 font-black text-sm uppercase tracking-[0.2em] hover:bg-cyan-500 dark:hover:bg-cyan-400 hover:scale-105 transition-all mr-2 shadow-xl"
          >
            Analyze
          </button>
        </div>
      </div>

      {/* Hot Words Cloud */}
      <div className="flex flex-wrap justify-center gap-6 max-w-6xl mb-32">
        {HOT_WORDS_MOCK.map((hw) => {
          const baseColor = CategoryColorMap[hw.category];
          const isHovered = hoveredWordId === hw.id;
          
          return (
            <div 
              key={hw.id}
              onClick={() => handleHotWordClick(hw.word)}
              onMouseEnter={() => setHoveredWordId(hw.id)}
              onMouseLeave={() => setHoveredWordId(null)}
              className="p-5 rounded-3xl flex items-center gap-6 group cursor-pointer hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-current"
              style={{ 
                backgroundColor: isHovered ? `${baseColor}20` : 'var(--bg-card)',
                boxShadow: isHovered ? `0 10px 30px -10px ${baseColor}66` : '0 4px 6px -1px rgba(0,0,0,0.05)',
                borderColor: isHovered ? baseColor : 'var(--border-color)'
              }}
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-80" style={{ color: baseColor }}>
                  {hw.category}
                </span>
                <span className="text-xl font-black text-[var(--text-base)]">{hw.word}</span>
              </div>
              <Sparkline data={hw.trend} color={baseColor} isHovered={isHovered} />
            </div>
          );
        })}
      </div>

      {/* Leaderboards Grid - Chunky 2x2 Layout */}
      <div className="w-full max-w-[1500px] grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        
        {/* Social - Substantial Block */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-[var(--text-base)] uppercase tracking-widest flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                <i className="fa-solid fa-hashtag"></i>
              </div>
              社交
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">Real-time Feed</span>
          </div>
          <div className="glass rounded-[48px] border border-[var(--border-color)] p-6 space-y-4 h-[550px] overflow-y-auto custom-scrollbar">
            {SOCIAL_POSTS_MOCK.map(post => (
              <a 
                key={post.id} 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-6 rounded-[32px] bg-white/50 dark:bg-slate-900/40 border border-[var(--border-color)] hover:border-pink-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">{post.avatar}</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">{post.platform} • @{post.user}</div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{post.content}</p>
                <div className="mt-4 flex gap-4 text-slate-500 dark:text-slate-600 text-[10px] font-black">
                  <span><i className="fa-regular fa-comment mr-2"></i> 1.2k</span>
                  <span><i className="fa-regular fa-heart mr-2"></i> 4.5k</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Hot Papers - Substantial Block */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-[var(--text-base)] uppercase tracking-widest flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <i className="fa-solid fa-scroll"></i>
              </div>
              热门论文
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">Archive Index</span>
          </div>
          <div className="glass rounded-[48px] border border-[var(--border-color)] p-6 space-y-4 h-[550px] overflow-y-auto custom-scrollbar">
            {PAPERS_MOCK.slice(0, 10).map(paper => (
              <div key={paper.id} className="p-6 rounded-[32px] bg-white/50 dark:bg-slate-900/40 border border-[var(--border-color)] hover:border-cyan-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group">
                <div className="flex justify-between items-start mb-3">
                   <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-500/60 uppercase tracking-widest">{paper.tags[0]}</span>
                   <span className="text-[10px] font-black text-slate-500 dark:text-slate-600 mono">{paper.venue} {paper.year}</span>
                </div>
                <h4 className="text-base font-black text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-4">
                  <a 
                    href={paper.url || "#"} 
                    target={paper.url ? "_blank" : "_self"} 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {paper.title}
                  </a>
                </h4>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-bold truncate pr-4">Authors: {paper.authors.join(', ')}</div>
                  <div className="text-[11px] font-black text-[var(--text-base)] bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">{paper.citations.toLocaleString()} Citations</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Projects - Substantial Block */}
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
            {PROJECTS_MOCK.map(proj => (
              <a 
                key={proj.id} 
                href={proj.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-6 rounded-[32px] bg-white/50 dark:bg-slate-900/40 border border-[var(--border-color)] hover:border-purple-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400 font-black text-xl">{proj.name[0]}</div>
                    <h4 className="text-lg font-black text-[var(--text-base)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{proj.name}</h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stars</span>
                    <span className="text-sm font-black text-purple-500 dark:text-purple-400 mono">{proj.stars}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">{proj.description}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">#{proj.category}</span>
                  <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">#Trending</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Hot News - Substantial Block */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-[var(--text-base)] uppercase tracking-widest flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-newspaper"></i>
              </div>
              资讯速递
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">Flash Reports</span>
          </div>
          <div className="glass rounded-[48px] border border-[var(--border-color)] p-6 space-y-4 h-[550px] overflow-y-auto custom-scrollbar">
            {NEWS_MOCK.map(news => (
              <div key={news.id} className="p-6 rounded-[32px] bg-white/50 dark:bg-slate-900/40 border border-[var(--border-color)] hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${news.sentiment === 'positive' ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{news.source}</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest italic">{news.time}</span>
                </div>
                <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  {news.title}
                </h4>
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">Global Coverage Active</span>
                  <i className="fa-solid fa-arrow-right-long text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all"></i>
                </div>
              </div>
            ))}
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
