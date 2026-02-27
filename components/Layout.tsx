
import React, { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const tabs = [
    { id: 'landing', label: 'Discovery', icon: 'fa-house-signal' },
    { id: 'home', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'comparison', label: 'Comparison', icon: 'fa-balance-scale' },
    { id: 'scholars', label: 'Scholars', icon: 'fa-user-graduate' },
    { id: 'institutions', label: 'Institutions', icon: 'fa-building-columns' },
    { id: 'papers', label: 'Papers', icon: 'fa-file-lines' },
    // { id: 'search', label: 'Search', icon: 'fa-satellite-dish' }, // 隐藏中，恢复请取消注释
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-main)] text-[var(--text-base)] transition-colors duration-300">
      {/* Sidebar */}
      <aside className="lg:w-72 w-full glass lg:h-screen sticky top-0 z-50 p-6 flex flex-col border-r border-[var(--border-color)]">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <i className="fa-solid fa-atom text-white text-xl animate-spin-slow"></i>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight glow-text">Vantage AI</h1>
              <p className="text-[10px] text-cyan-500 dark:text-cyan-400/70 tracking-[0.2em] uppercase font-bold">Discovery Engine</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 glow-border font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <i className={`fa-solid ${tab.icon} w-5 text-center`}></i>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-[var(--border-color)] space-y-4">
           {/* Theme Toggle */}
           <button 
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-[var(--border-color)] text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-cyan-500/50 transition-all"
           >
             <span className="flex items-center gap-2">
               <i className={`fa-solid ${isDark ? 'fa-moon' : 'fa-sun'} text-cyan-500`}></i>
               {isDark ? 'Dark Mode' : 'Light Mode'}
             </span>
             <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDark ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0'}`}></div>
             </div>
           </button>

          <div className="glass p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">System Status</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Real-time Node Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
