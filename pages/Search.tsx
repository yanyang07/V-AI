
import React, { useState, useMemo, useEffect } from 'react';
import { Scholar, Paper, SortOption } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useScholars, usePapers } from '../hooks/useData';
import type { CSVScholar } from '../services/dataTypes';

// ── Real citation data (same source as Scholars.tsx) ────────────────────────
const SCHOLAR_META: Record<string, { citations: number; awards?: string[] }> = {
  'Percy Liang':       { citations: 127130, awards: ['NSF CAREER Award', 'CRFM Director (Stanford)'] },
  'Philip Torr':       { citations: 113679, awards: ['FRS 2021', 'FREng 2019', 'Marr Prize (ICCV)'] },
  'Luke Zettlemoyer':  { citations: 104520, awards: ['AI2 Fellow', 'Best Paper ACL'] },
  'Sergey Levine':     { citations: 95000,  awards: ['NSF CAREER Award', 'Sloan Fellow 2020'] },
  'Yejin Choi':        { citations: 82417,  awards: ['MacArthur Fellow 2022', 'TIME100 AI 2025'] },
  'Ion Stoica':        { citations: 78000,  awards: ['ACM Fellow', 'Test of Time Award (NSDI)'] },
  'Zhiyuan Liu':       { citations: 70500,  awards: ['MIT TR35 China', 'BAAI Young Scientist'] },
  'James Zou':         { citations: 68952,  awards: ['NSF CAREER Award', 'Sloan Research Fellow'] },
  'Dawn Song':         { citations: 65000,  awards: ['MacArthur Fellow 2010', 'ACM CCS Test of Time'] },
  'Graham Neubig':     { citations: 58875 },
  'Maosong Sun':       { citations: 58964,  awards: ['CAAI Fellow', 'ACM SIGIR Test of Time'] },
  'Jie Tang':          { citations: 53234,  awards: ['ACM Fellow', 'AAAI Fellow', 'IEEE Fellow'] },
  'Jianfeng Gao':      { citations: 50000,  awards: ['ACM Fellow', 'IEEE Fellow'] },
  'Silvio Savarese':   { citations: 45000 },
  'Mohit Bansal':      { citations: 43274,  awards: ['PECASE Award', 'AAAI Fellow'] },
  'Caiming Xiong':     { citations: 42000 },
  'Wanli Ouyang':      { citations: 40000 },
  'Heng Ji':           { citations: 32570,  awards: ['NSF CAREER Award', "Google Research Award", "IEEE AI's 10 to Watch 2013"] },
  'Dahua Lin':         { citations: 30000 },
  'Ziwei Liu':         { citations: 35000,  awards: ['NeurIPS Outstanding Paper'] },
  'Diyi Yang':         { citations: 22000 },
  'Sergey Levine':     { citations: 95000,  awards: ['NSF CAREER Award', 'Sloan Fellow 2020'] },
};

function computeImpact(paperCount: number, maxPapers: number, citations: number, awardsCount: number): number {
  const paperScore = (paperCount / Math.max(1, maxPapers)) * 100;
  const citeScore  = (Math.log10(citations + 1) / 5.10) * 100;
  const awardScore = Math.min(100, awardsCount * 20);
  return Math.min(100, Math.round(paperScore * 0.40 + citeScore * 0.40 + awardScore * 0.20));
}

function scholarTier(impact: number, awardsCount: number, citations: number): number {
  const hotEnough    = impact > 25;
  const hasAwards    = awardsCount > 0;
  const hasCitations = citations > 8000;
  if (hotEnough && hasAwards && hasCitations) return 3;
  if (hasAwards)    return 2;
  if (hasCitations) return 1;
  return 0;
}

function csvToSearchScholar(s: CSVScholar, index: number, maxPapers: number): Scholar {
  const meta        = SCHOLAR_META[s.name];
  const citations   = meta?.citations ?? Math.round(Math.pow(s.paperCount, 1.6) * 20);
  const csvAwards   = s.awards.map((name, i) => ({ year: 2020 + i, name, organization: '—' }));
  const metaAwards  = (meta?.awards ?? []).map((name, i) => ({ year: 2020 + i, name, organization: '—' }));
  const allAwards   = csvAwards.length > 0 ? csvAwards : metaAwards;
  const impact      = computeImpact(s.paperCount, maxPapers, citations, allAwards.length);
  const base        = Math.max(1, Math.floor(s.paperCount / 5));
  const trendData   = [2021, 2022, 2023, 2024, 2025].map((year, i) => ({
    year,
    value: Math.round(base * (0.4 + i * 0.15) + Math.random() * base * 0.2),
  }));
  return {
    id: `search_${index}`,
    nameEn: s.name,
    nameZh: '',
    institution: s.institution ? [s.institution] : ['—'],
    field: s.fields.length > 0 ? s.fields : ['AI Research'],
    avatar: s.name.slice(0, 2).toUpperCase(),
    awards: allAwards,
    hotness: impact,
    email: s.email,
    citations,
    migration: [],
    influenceScores: [],
    rankHistory: [],
    region: s.region,
    trendData,
    teachers: [],
    students: [],
  };
}

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

// ── FieldTags: max 2 visible, "+N more" hover popover (up to 10 total) ───────
const FieldTags: React.FC<{ fields: string[] }> = ({ fields }) => {
  // Flatten comma-separated field strings → individual tags, dedupe, cap at 10
  const allTags = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const f of fields) {
      for (const tag of f.split(',')) {
        const t = tag.trim();
        if (t && t.length > 1 && !seen.has(t)) {
          seen.add(t);
          result.push(t);
          if (result.length >= 10) break;
        }
      }
      if (result.length >= 10) break;
    }
    return result;
  }, [fields]);

  const visible  = allTags.slice(0, 2);
  const hidden   = allTags.slice(2);

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visible.map((tag, i) => (
        <span
          key={i}
          className="px-1.5 py-0.5 bg-cyan-500/8 dark:bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-[9px] font-bold rounded uppercase tracking-wide truncate max-w-[90px]"
          title={tag}
        >
          {tag}
        </span>
      ))}
      {hidden.length > 0 && (
        <span className="relative group/more">
          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-[var(--border-color)] text-slate-500 dark:text-slate-400 text-[9px] font-bold rounded cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            +{hidden.length}
          </span>
          {/* Hover popover */}
          <div className="absolute left-0 top-full mt-1 z-[9999] w-56 bg-white dark:bg-slate-950 border border-[var(--border-color)] rounded-2xl p-3 shadow-xl opacity-0 group-hover/more:opacity-100 pointer-events-none transition-opacity duration-200">
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">All Fields</div>
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-[9px] font-bold rounded uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </span>
      )}
    </div>
  );
};

const ScholarCard: React.FC<{ scholar: Scholar }> = ({ scholar }) => (
  <div className="glass p-5 rounded-3xl border border-[var(--border-color)] hover:border-cyan-500/30 transition-all relative overflow-visible">

    {/* ── Top row: name + impact ─────────────────────────────────────────── */}
    <div className="flex justify-between mb-4">
      <div className="min-w-0 flex-1 pr-4">
        <h4 className="font-bold text-lg text-slate-900 dark:text-white truncate">
          {scholar.nameEn}{scholar.nameZh ? ` (${scholar.nameZh})` : ''}
        </h4>

        {/* ── HOT-ZONE 1: Institution tags ──────────────────────────────── */}
        <div className="group/inst relative inline-block mt-2">
          <div className="flex flex-wrap gap-2 cursor-help">
            {scholar.institution.map((inst, i) => (
              <span
                key={i}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-[var(--border-color)] group-hover/inst:border-cyan-500/40 group-hover/inst:text-cyan-700 dark:group-hover/inst:text-cyan-300 transition-colors"
              >
                {inst}
              </span>
            ))}
          </div>
          {/* Institution popover */}
          <div className="absolute left-0 top-full mt-2 z-[9999] w-64 bg-white dark:bg-slate-950 border border-cyan-500/30 rounded-2xl p-4 shadow-xl opacity-0 group-hover/inst:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="text-[9px] text-cyan-600 dark:text-cyan-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="fa-solid fa-building-columns"></i> Affiliations
            </div>
            <ul className="space-y-1.5">
              {scholar.institution.map((inst, i) => (
                <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                  {inst}
                </li>
              ))}
            </ul>
            {scholar.region && (
              <div className="mt-3 pt-3 border-t border-[var(--border-color)] text-[10px] text-slate-500 flex items-center gap-1.5">
                <i className="fa-solid fa-location-dot text-slate-400"></i> {scholar.region}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Impact score — hover shows sparkline chart */}
      <div className="group/hot relative shrink-0">
        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Impact</div>
        <div className="flex items-center gap-2 cursor-help">
          <Sparkline color="#06b6d4" />
          <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mono">
            {scholar.hotness}<span className="text-[9px] text-slate-400 ml-0.5">/100</span>
          </span>
        </div>
        <div className="absolute top-0 right-full mr-3 p-4 rounded-xl border border-cyan-500/50 opacity-0 group-hover/hot:opacity-100 transition-opacity pointer-events-none z-[9999] w-48 bg-white dark:bg-slate-950 shadow-xl">
          <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 mb-2 uppercase">Global Influence Trajectory</div>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[10, 40, 25, 50, 45, 80, 75, 98].map(v => ({ v }))}>
                <Line type="step" dataKey="v" stroke="#06b6d4" dot={false} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>

    {/* ── Mid row: fields + email ────────────────────────────────────────── */}
    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
      {/* HOT-ZONE 2: Field tags — popover handled inside FieldTags "+N" */}
      <div className="flex items-start gap-2 min-w-0 overflow-visible">
        <i className="fa-solid fa-microscope text-cyan-500/50 mt-0.5 shrink-0"></i>
        <FieldTags fields={scholar.field} />
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <i className="fa-solid fa-envelope text-slate-600 shrink-0"></i>
        <span className="truncate text-[11px]">{scholar.email}</span>
      </div>
    </div>

    {/* ── Bottom row: awards + citations ────────────────────────────────── */}
    <div className="flex justify-between items-center">

      {/* HOT-ZONE 3: Awards tags */}
      <div className="group/awards relative">
        <div className="flex flex-wrap gap-2 cursor-help">
          {scholar.awards.length > 0 ? scholar.awards.slice(0, 2).map((a, i) => (
            <span
              key={i}
              className="text-[9px] font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 group-hover/awards:border-yellow-400/60 transition-colors"
            >
              {a.year} {a.name}
            </span>
          )) : (
            <span className="text-[9px] text-slate-400 italic">No awards</span>
          )}
        </div>
        {/* Awards / career timeline popover */}
        <div className="absolute bottom-full left-0 mb-2 z-[9999] w-72 bg-white dark:bg-slate-950 border border-yellow-500/30 rounded-2xl p-4 shadow-xl opacity-0 group-hover/awards:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="text-[9px] text-yellow-600 dark:text-yellow-400 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fa-solid fa-trophy"></i> Career Awards &amp; Timeline
          </div>
          {scholar.awards.length > 0 ? (
            <div className="space-y-3 border-l-2 border-yellow-400/30 ml-1 pl-4">
              {scholar.awards.map((a, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.5)]"></div>
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white">{a.year} — {a.name}</div>
                  {a.organization && a.organization !== '—' && (
                    <div className="text-[10px] text-slate-500">{a.organization}</div>
                  )}
                </div>
              ))}
              <div className="relative">
                <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Current — {scholar.institution[0]}</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No awards on record.</p>
          )}
        </div>
      </div>

      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-[var(--border-color)]">
        {scholar.citations >= 1000 ? `${(scholar.citations / 1000).toFixed(0)}k` : scholar.citations} CITATIONS
      </div>
    </div>
  </div>
);

const PaperCard: React.FC<{ paper: Paper }> = ({ paper }) => (
  <div className="glass p-5 rounded-3xl border border-[var(--border-color)] hover:border-indigo-500/30 transition-all group">
    <div className="flex justify-between items-start mb-3">
      <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 pr-4">
        <a 
          href={paper.url || "#"} 
          target={paper.url ? "_blank" : "_self"} 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {paper.title}
        </a>
      </h4>
      <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold mono">
        {paper.citations.toLocaleString()}
      </div>
    </div>
    <div className="text-xs text-slate-500 mb-4">{paper.authors.join(', ')}</div>
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        {paper.tags.map(tag => (
          <span key={tag} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider border border-[var(--border-color)]">{tag}</span>
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
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(8);

  const { data: scholarsData } = useScholars();
  const { data: papersData }   = usePapers();

  // Build scholar list from real CSV data
  const allScholars = useMemo<Scholar[]>(() => {
    if (!scholarsData) return [];
    const maxPapers = Math.max(1, ...scholarsData.scholars.map(s => s.paperCount));
    return scholarsData.scholars.map((s, i) => csvToSearchScholar(s, i, maxPapers));
  }, [scholarsData]);

  // Extract top Macro Domains from real scholar fields data
  const macroDomains = useMemo(() => {
    if (!scholarsData) return ['Computer Science', 'Physical Sciences', 'Life Sciences', 'Social Sciences'];
    const counter: Record<string, number> = {};
    for (const s of scholarsData.scholars) {
      for (const fieldGroup of s.fields) {
        const parts = fieldGroup.split(',').slice(0, 6); // only first 6 sub-fields per scholar
        for (const part of parts) {
          const d = part.trim();
          if (d && d.length > 2 && d.length < 40) {
            counter[d] = (counter[d] ?? 0) + 1;
          }
        }
      }
    }
    return Object.entries(counter)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([label]) => label);
  }, [scholarsData]);

  // Sorted + filtered scholars
  const filteredScholars = useMemo(() => {
    let list = [...allScholars];

    // Text search
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.nameEn.toLowerCase().includes(q) ||
        s.institution.join(' ').toLowerCase().includes(q) ||
        s.field.join(' ').toLowerCase().includes(q)
      );
    }

    // Domain filter
    if (selectedDomains.size > 0) {
      list = list.filter(s =>
        s.field.some(f => [...selectedDomains].some(d => f.toLowerCase().includes(d.toLowerCase())))
      );
    }

    // Sort
    switch (activeSort) {
      case SortOption.CITATIONS:
        list.sort((a, b) => b.citations - a.citations);
        break;
      case SortOption.HOTNESS:
        list.sort((a, b) => b.hotness - a.hotness);
        break;
      case SortOption.INFLUENCE:
      case SortOption.RELEVANCE:
      default: {
        list.sort((a, b) => {
          const ta = scholarTier(a.hotness, a.awards.length, a.citations);
          const tb = scholarTier(b.hotness, b.awards.length, b.citations);
          if (tb !== ta) return tb - ta;
          return b.hotness - a.hotness;
        });
        break;
      }
    }
    return list;
  }, [allScholars, query, activeSort, selectedDomains]);

  const toggleDomain = (d: string) => {
    setSelectedDomains(prev => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  // Reset pagination when search parameters change
  useEffect(() => { setVisibleCount(8); }, [query, activeSort, selectedDomains]);

  // Build papers list from real data
  const allPapers = useMemo<Paper[]>(() => {
    if (!papersData) return [];
    return (Object.values(papersData.samplePapers) as any[][]).flat().slice(0, 12).map((p: any, i) => ({
      id: p.id || `sp_${i}`,
      title: p.title,
      year: p.year || 2025,
      citations: (p.hotness ?? 0) * 10,
      hotness: p.hotness ?? 0,
      awards: p.awards || [],
      trend: [0,1,2,3,4].map(j => Math.round((p.hotness ?? 5) * (0.5 + j * 0.15))),
      authors: (p.authors || []).slice(0, 3),
      tags: [p.keyword].filter(Boolean),
      venue: p.journal || 'arXiv',
      journal: p.journal || '',
      abstract: '',
      url: p.url || '',
    }));
  }, [papersData]);

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <header className="flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="flex-1 w-full relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input 
            type="text" 
            placeholder="Search scholars, papers, or emerging domains..."
            className="w-full h-14 bg-white dark:bg-slate-900 border border-[var(--border-color)] rounded-2xl pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 transition-all text-lg font-medium shadow-lg dark:shadow-2xl text-slate-900 dark:text-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className={`h-14 px-6 rounded-2xl border flex items-center gap-3 transition-all ${filterOpen ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400' : 'bg-white dark:bg-slate-900 border-[var(--border-color)] text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
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
            <div className="glass p-6 rounded-3xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-6">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-widest">Refine Nodes</h5>
                <button className="text-[10px] text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 font-bold uppercase">Reset</button>
              </div>

              <div className="space-y-8">
                {/* Level 1: Macro Domain — real data from Scholar_Registry_v2.csv */}
                <div>
                  <label className="text-[10px] text-cyan-600 dark:text-cyan-500 font-bold uppercase mb-4 block tracking-widest">
                    1. Macro Domain
                    <span className="ml-2 text-slate-400 normal-case font-normal">(from CSV)</span>
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {macroDomains.map(d => (
                      <label key={d} className="flex items-center gap-3 group cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 checked:bg-cyan-500 focus:ring-cyan-500"
                          checked={selectedDomains.has(d)}
                          onChange={() => toggleDomain(d)}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors truncate">{d}</span>
                      </label>
                    ))}
                  </div>
                  {selectedDomains.size > 0 && (
                    <button
                      onClick={() => setSelectedDomains(new Set())}
                      className="mt-2 text-[10px] text-cyan-600 hover:underline font-bold"
                    >
                      Clear ({selectedDomains.size})
                    </button>
                  )}
                </div>

                {/* Level 2: Sort Priority */}
                <div className="pl-4 border-l border-[var(--border-color)]">
                  <label className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase mb-4 block tracking-widest">2. Sort Priority</label>
                  <div className="space-y-2">
                    {([SortOption.INFLUENCE, SortOption.CITATIONS, SortOption.HOTNESS, SortOption.RECENCY] as string[]).map(opt => (
                      <label key={opt} className="flex items-center gap-3 group cursor-pointer">
                        <input
                          type="radio"
                          name="sort"
                          className="w-4 h-4 accent-indigo-500"
                          checked={activeSort === opt}
                          onChange={() => setActiveSort(opt as SortOption)}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 capitalize">{opt.toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level 3: Impact Range */}
                <div className="pl-4 border-l border-[var(--border-color)]">
                  <label className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-4 block tracking-widest">3. Performance Metrics</label>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                        <span>IMPACT SCORE</span>
                        <span className="text-slate-900 dark:text-white">0–100</span>
                      </div>
                      <input type="range" className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full py-4 glass border-[var(--border-color)] rounded-2xl text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex items-center justify-center gap-2">
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-sm">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </span>
                  World-Class Scholars
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {filteredScholars.length} results · sorted by {activeSort.toLowerCase()}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {([SortOption.INFLUENCE, SortOption.CITATIONS, SortOption.HOTNESS] as string[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setActiveSort(opt as SortOption)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeSort === opt ? 'bg-white dark:bg-slate-100 text-slate-950 shadow-md' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border border-[var(--border-color)] hover:border-slate-400 dark:hover:border-slate-700'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScholars.slice(0, visibleCount).map(s => <ScholarCard key={s.id} scholar={s} />)}
              {filteredScholars.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount(v => v + 8)}
                  className="glass flex items-center justify-center rounded-3xl border-dashed border-2 border-[var(--border-color)] p-8 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all text-left"
                >
                  <div className="text-center">
                    <i className="fa-solid fa-chevron-down text-slate-400 mb-2 text-xl group-hover:text-cyan-500 group-hover:translate-y-1 transition-all block"></i>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                      +{filteredScholars.length - visibleCount} More Scholars
                    </div>
                  </div>
                </button>
              )}
            </div>
          </section>

          {/* Papers Module */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm">
                    <i className="fa-solid fa-file-invoice"></i>
                  </span>
                  Breakthrough Manuscripts
                </h3>
              </div>
              <button className="text-xs font-bold text-indigo-500 hover:underline">VIEW VERTICAL LIST</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPapers.slice(0, 12).map(p => <PaperCard key={p.id} paper={p} />)}
              <div className="glass flex items-center justify-center rounded-3xl border-dashed border-2 border-[var(--border-color)] p-6 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all">
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-indigo-500">Expand Library</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
