import React, { useState, useRef, useEffect } from 'react';

interface Props {
  keywords: string[];
  value: string;
  onChange: (kw: string) => void;
  /** Tailwind color token prefix, e.g. "cyan", "indigo", "emerald" */
  accent?: 'cyan' | 'indigo' | 'emerald';
}

const ACCENT = {
  cyan:    { pill: 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]',   inactive: 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10', glow: 'text-cyan-600 dark:text-cyan-400', chevron: 'text-cyan-500' },
  indigo:  { pill: 'bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]', inactive: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10', glow: 'text-indigo-600 dark:text-indigo-400', chevron: 'text-indigo-500' },
  emerald: { pill: 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]', inactive: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10', glow: 'text-emerald-600 dark:text-emerald-400', chevron: 'text-emerald-500' },
};

export const KeywordSwitcher: React.FC<Props> = ({
  keywords,
  value,
  onChange,
  accent = 'cyan',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const c = ACCENT[accent];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const prev = () => {
    const idx = keywords.indexOf(value);
    onChange(keywords[(idx - 1 + keywords.length) % keywords.length]);
  };
  const next = () => {
    const idx = keywords.indexOf(value);
    onChange(keywords[(idx + 1) % keywords.length]);
  };

  return (
    <div ref={ref} className="flex flex-col gap-2">
      {/* Title row: ← keyword → */}
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          className={`w-7 h-7 rounded-full border border-[var(--border-color)] flex items-center justify-center ${c.chevron} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0`}
          title="Previous keyword"
        >
          <i className="fa-solid fa-chevron-left text-[9px]"></i>
        </button>

        {/* Clickable title opens dropdown */}
        <button
          onClick={() => setOpen(o => !o)}
          className="group flex items-center gap-2"
          title="Switch keyword"
        >
          <h1 className="text-5xl font-black text-slate-900 dark:text-white glow-text tracking-tighter leading-none">
            {value}
          </h1>
          <i className={`fa-solid fa-caret-down text-sm mt-1 transition-transform duration-200 ${c.chevron} ${open ? 'rotate-180' : ''}`}></i>
        </button>

        <button
          onClick={next}
          className={`w-7 h-7 rounded-full border border-[var(--border-color)] flex items-center justify-center ${c.chevron} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0`}
          title="Next keyword"
        >
          <i className="fa-solid fa-chevron-right text-[9px]"></i>
        </button>
      </div>

      {/* Scrollable pill row (always visible) */}
      <div className="flex gap-1.5 flex-wrap max-w-lg">
        {keywords.map(kw => (
          <button
            key={kw}
            onClick={() => { onChange(kw); setOpen(false); }}
            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
              kw === value
                ? c.pill + ' border-transparent'
                : 'border-[var(--border-color)] text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 ' + c.inactive
            }`}
          >
            {kw}
          </button>
        ))}
      </div>

      {/* Dropdown overlay (shown when title is clicked) */}
      {open && (
        <div className="absolute top-full left-0 mt-2 z-[9999] w-72 bg-white dark:bg-slate-950 border border-[var(--border-color)] rounded-2xl p-3 shadow-2xl">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Select Keyword</div>
          <div className="space-y-0.5">
            {keywords.map((kw, i) => (
              <button
                key={kw}
                onClick={() => { onChange(kw); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all text-left ${
                  kw === value
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 mono w-4 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  {kw}
                </span>
                {kw === value && <i className={`fa-solid fa-check text-xs ${c.glow}`}></i>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
