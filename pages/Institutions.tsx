
import React, { useState, useMemo } from 'react';
import { KEYWORDS_LIST } from '../constants';
import { Institution } from '../types';
import { KeywordSwitcher } from '../components/KeywordSwitcher';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { usePapers } from '../hooks/useData';

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
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 break-words" title={institution.name}>{institution.name}</h3>
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

// ── JSON influence data for known institutions ────────────────────────────────
interface InstJSON {
  name: string;
  research_output_papers_recent3m: number;
  research_output_growth_rate: number;
  academic_citations_recent3m: number;
  academic_top_paper_ratio: number;
  academic_high_heat_papers: number;
  talent_top_scholars: number;
  talent_top10pct_ratio: number;
  tech_leadership: number;
  industry_enterprise_coauth: number;
  global_intl_coauth_ratio: number;
  global_overseas_network: number;
}

const INST_JSON_LIST: InstJSON[] = [
  { name: 'Stanford University',                    research_output_papers_recent3m: 180, research_output_growth_rate: 12, academic_citations_recent3m: 6200,  academic_top_paper_ratio: 28, academic_high_heat_papers: 42, talent_top_scholars: 45, talent_top10pct_ratio: 32, tech_leadership: 96, industry_enterprise_coauth: 65,  global_intl_coauth_ratio: 68, global_overseas_network: 95 },
  { name: 'Shanghai Jiao Tong University',          research_output_papers_recent3m: 210, research_output_growth_rate: 25, academic_citations_recent3m: 4800,  academic_top_paper_ratio: 24, academic_high_heat_papers: 38, talent_top_scholars: 32, talent_top10pct_ratio: 28, tech_leadership: 92, industry_enterprise_coauth: 55,  global_intl_coauth_ratio: 52, global_overseas_network: 85 },
  { name: 'UC Berkeley',                            research_output_papers_recent3m: 165, research_output_growth_rate: 14, academic_citations_recent3m: 5500,  academic_top_paper_ratio: 26, academic_high_heat_papers: 35, talent_top_scholars: 38, talent_top10pct_ratio: 29, tech_leadership: 93, industry_enterprise_coauth: 70,  global_intl_coauth_ratio: 65, global_overseas_network: 92 },
  { name: 'Carnegie Mellon University',             research_output_papers_recent3m: 190, research_output_growth_rate: 18, academic_citations_recent3m: 5100,  academic_top_paper_ratio: 25, academic_high_heat_papers: 40, talent_top_scholars: 40, talent_top10pct_ratio: 30, tech_leadership: 94, industry_enterprise_coauth: 68,  global_intl_coauth_ratio: 60, global_overseas_network: 88 },
  { name: 'Google Cloud AI Research',               research_output_papers_recent3m: 140, research_output_growth_rate: 20, academic_citations_recent3m: 8500,  academic_top_paper_ratio: 35, academic_high_heat_papers: 55, talent_top_scholars: 60, talent_top10pct_ratio: 40, tech_leadership: 98, industry_enterprise_coauth: 120, global_intl_coauth_ratio: 70, global_overseas_network: 96 },
  { name: 'Institute of Foundation Models',         research_output_papers_recent3m: 45,  research_output_growth_rate: 45, academic_citations_recent3m: 1800,  academic_top_paper_ratio: 30, academic_high_heat_papers: 12, talent_top_scholars: 15, talent_top10pct_ratio: 35, tech_leadership: 90, industry_enterprise_coauth: 30,  global_intl_coauth_ratio: 75, global_overseas_network: 88 },
  { name: 'ByteDance',                              research_output_papers_recent3m: 110, research_output_growth_rate: 28, academic_citations_recent3m: 4200,  academic_top_paper_ratio: 22, academic_high_heat_papers: 28, talent_top_scholars: 25, talent_top10pct_ratio: 26, tech_leadership: 91, industry_enterprise_coauth: 80,  global_intl_coauth_ratio: 48, global_overseas_network: 82 },
  { name: 'METR',                                   research_output_papers_recent3m: 35,  research_output_growth_rate: 35, academic_citations_recent3m: 1400,  academic_top_paper_ratio: 38, academic_high_heat_papers: 10, talent_top_scholars: 12, talent_top10pct_ratio: 42, tech_leadership: 88, industry_enterprise_coauth: 25,  global_intl_coauth_ratio: 70, global_overseas_network: 85 },
  { name: 'Microsoft Research',                     research_output_papers_recent3m: 220, research_output_growth_rate: 16, academic_citations_recent3m: 9800,  academic_top_paper_ratio: 32, academic_high_heat_papers: 65, talent_top_scholars: 70, talent_top10pct_ratio: 38, tech_leadership: 97, industry_enterprise_coauth: 150, global_intl_coauth_ratio: 72, global_overseas_network: 94 },
  { name: 'National University of Singapore',       research_output_papers_recent3m: 130, research_output_growth_rate: 19, academic_citations_recent3m: 3800,  academic_top_paper_ratio: 21, academic_high_heat_papers: 25, talent_top_scholars: 28, talent_top10pct_ratio: 25, tech_leadership: 89, industry_enterprise_coauth: 50,  global_intl_coauth_ratio: 65, global_overseas_network: 90 },
  { name: 'Tsinghua University',                    research_output_papers_recent3m: 240, research_output_growth_rate: 22, academic_citations_recent3m: 5200,  academic_top_paper_ratio: 26, academic_high_heat_papers: 45, talent_top_scholars: 50, talent_top10pct_ratio: 34, tech_leadership: 94, industry_enterprise_coauth: 75,  global_intl_coauth_ratio: 55, global_overseas_network: 88 },
  { name: 'University of Hong Kong',                research_output_papers_recent3m: 95,  research_output_growth_rate: 17, academic_citations_recent3m: 2800,  academic_top_paper_ratio: 20, academic_high_heat_papers: 18, talent_top_scholars: 20, talent_top10pct_ratio: 22, tech_leadership: 85, industry_enterprise_coauth: 40,  global_intl_coauth_ratio: 60, global_overseas_network: 84 },
  { name: 'Tencent',                                research_output_papers_recent3m: 85,  research_output_growth_rate: 30, academic_citations_recent3m: 3500,  academic_top_paper_ratio: 24, academic_high_heat_papers: 22, talent_top_scholars: 22, talent_top10pct_ratio: 27, tech_leadership: 90, industry_enterprise_coauth: 90,  global_intl_coauth_ratio: 45, global_overseas_network: 80 },
  { name: 'Apple',                                  research_output_papers_recent3m: 70,  research_output_growth_rate: 15, academic_citations_recent3m: 4100,  academic_top_paper_ratio: 29, academic_high_heat_papers: 20, talent_top_scholars: 35, talent_top10pct_ratio: 33, tech_leadership: 92, industry_enterprise_coauth: 60,  global_intl_coauth_ratio: 55, global_overseas_network: 90 },
  { name: 'Nanyang Technological University',       research_output_papers_recent3m: 145, research_output_growth_rate: 20, academic_citations_recent3m: 3900,  academic_top_paper_ratio: 22, academic_high_heat_papers: 30, talent_top_scholars: 30, talent_top10pct_ratio: 26, tech_leadership: 88, industry_enterprise_coauth: 58,  global_intl_coauth_ratio: 62, global_overseas_network: 87 },
];

// 模糊名称匹配：institution 名包含 JSON key 的任意词
function findInstJSON(name: string): InstJSON | undefined {
  const lc = name.toLowerCase();
  return INST_JSON_LIST.find(d => {
    const jlc = d.name.toLowerCase();
    return lc.includes(jlc) || jlc.includes(lc) ||
      // 首词匹配（如 "Tsinghua" in "Tsinghua University"）
      d.name.split(' ').some(w => w.length > 4 && lc.includes(w.toLowerCase()));
  });
}

// 将 JSON 字段映射到 5 个雷达维度（fullMark: 100）
function jsonToInstRadar(d: InstJSON) {
  const resOut  = Math.min(100, Math.round(d.research_output_papers_recent3m / 250 * 70 + d.academic_top_paper_ratio * 0.8));
  const talent  = Math.min(100, Math.round(d.talent_top_scholars / 70 * 80 + d.talent_top10pct_ratio * 0.5));
  const impact  = Math.min(100, Math.round(d.academic_citations_recent3m / 10000 * 80 + d.academic_high_heat_papers / 70 * 20));
  const innov   = Math.min(100, Math.round(d.tech_leadership * 0.75 + d.research_output_growth_rate * 0.8));
  const collab  = Math.min(100, Math.round(d.global_intl_coauth_ratio * 0.5 + d.global_overseas_network * 0.3 + d.industry_enterprise_coauth / 150 * 25));
  return [
    { label: 'Research Output', value: resOut,  fullMark: 100 },
    { label: 'Talent Pool',     value: talent,  fullMark: 100 },
    { label: 'Global Impact',   value: impact,  fullMark: 100 },
    { label: 'Innovation',      value: innov,   fullMark: 100 },
    { label: 'Collaboration',   value: collab,  fullMark: 100 },
  ];
}

// ── Parse institution names from raw CSV string ───────────────────────────────
function parseInstitutions(raw: string): string[] {
  if (!raw) return [];
  const results: string[] = [];
  const parts = raw.split(',');
  let buf = '';
  for (const part of parts) {
    const trimmed = part.trim();
    buf = buf ? `${buf}, ${trimmed}` : trimmed;
    if (/ - [A-Z]/.test(trimmed)) {
      const name = buf.substring(0, buf.lastIndexOf(' - ')).trim();
      if (name.length > 2) results.push(name);
      buf = '';
    }
  }
  if (buf.trim().length > 2) results.push(buf.trim());
  return results;
}

// ── Heuristic region detection ────────────────────────────────────────────────
const REGION_HINTS: [string, string][] = [
  ['MIT', 'USA'], ['Stanford', 'USA'], ['Carnegie', 'USA'], ['Berkeley', 'USA'],
  ['Harvard', 'USA'], ['Google', 'USA'], ['OpenAI', 'USA'], ['Meta AI', 'USA'],
  ['Microsoft', 'USA'], ['Allen', 'USA'], ['Princeton', 'USA'], ['Yale', 'USA'],
  ['Tsinghua', 'China'], ['Peking', 'China'], ['Fudan', 'China'], ['Shanghai AI', 'China'],
  ['Beijing', 'China'], ['Zhejiang', 'China'], ['BAAI', 'China'], ['Chinese', 'China'],
  ['Alibaba', 'China'], ['Baidu', 'China'], ['Huawei', 'China'],
  ['Oxford', 'UK'], ['Cambridge', 'UK'], ['Imperial', 'UK'], ['DeepMind', 'UK'],
  ['ETH Zurich', 'Switzerland'], ['EPFL', 'Switzerland'],
  ['Max Planck', 'Germany'], ['TU Munich', 'Germany'],
  ['Tokyo', 'Japan'], ['Kyoto', 'Japan'], ['RIKEN', 'Japan'],
  ['Toronto', 'Canada'], ['McGill', 'Canada'], ['Montreal', 'Canada'], ['Mila', 'Canada'],
  ['INRIA', 'France'], ['Sorbonne', 'France'],
  ['Singapore', 'Singapore'], ['NTU', 'Singapore'], ['NUS', 'Singapore'],
  ['Seoul', 'Korea'], ['KAIST', 'Korea'], ['Samsung', 'Korea'],
];
function detectRegion(name: string): string {
  for (const [hint, region] of REGION_HINTS) {
    if (name.toLowerCase().includes(hint.toLowerCase())) return region;
  }
  return 'Global';
}

// ── 中文机构简介映射（优先展示，key 为 JSON name 的关键词） ───────────────────────
const INST_DESC_ZH: Record<string, string> = {
  'Stanford University':                  '斯坦福大学 — 硅谷核心AI研究重镇，在大模型、具身智能与强化学习领域持续引领全球前沿突破。',
  'Shanghai Jiao Tong University':        '上海交通大学 — 国内AI论文产出最密集的高校之一，在多模态感知、机器人与工业智能方向成果卓著。',
  'UC Berkeley':                          '加州大学伯克利分校 — RLHF与开源大模型的重要发源地，与工业界深度联合推动AI应用落地。',
  'Carnegie Mellon University':           '卡内基梅隆大学 — 计算机与AI教育的世界标杆，机器人、NLP与安全AI领域的重要研究中心。',
  'Google Cloud AI Research':             'Google Cloud AI Research — 谷歌云AI研究部门，在大规模预训练、多模态模型与AI基础设施方面具备顶尖工业研究能力。',
  'Institute of Foundation Models':       '基础模型研究院（IFM）— 专注通用基础模型的新兴研究机构，成长速度极快，跨机构合作比例居全球前列。',
  'ByteDance':                            '字节跳动 — 全球头部互联网科技公司，旗下Seed团队在视频生成、语言模型与多模态AI方向持续产出高水平研究成果。',
  'METR':                                 'METR（模型评估与威胁研究）— 专注前沿AI安全评估的独立研究机构，致力于对齐、红队测试与风险量化。',
  'Microsoft Research':                   '微软研究院 — 全球规模最大的工业AI研究机构之一，在基础模型、代码智能与负责任AI方向拥有极强的论文影响力。',
  'National University of Singapore':     '新加坡国立大学（NUS）— 东南亚顶尖理工大学，在NLP、计算机视觉与AI医疗方向具备较强国际竞争力。',
  'Tsinghua University':                  '清华大学 — 中国论文总产出最高的顶级高校，ChatGLM、THUDM等大模型项目享誉全球，AI人才储备极为雄厚。',
  'University of Hong Kong':              '香港大学（HKU）— 香港头部综合性研究型大学，在计算机视觉、AI医疗与可信AI方向具有稳定的国际发表能力。',
  'Tencent':                              '腾讯 — 国内头部科技巨头，混元大模型团队在多模态生成、NLP与游戏AI方向持续深耕，工业合作覆盖面广。',
  'Apple':                                'Apple — 全球顶级消费科技公司，在端侧AI、隐私保护机器学习与视觉语言模型方向保持高质量的学术产出。',
  'Nanyang Technological University':     '南洋理工大学（NTU）— 新加坡顶尖理工强校，在计算机视觉、自动驾驶与AI可解释性方向持续贡献高影响力研究。',
};

function getInstDesc(name: string, papers: number, scholars: number): string {
  // 优先精确匹配
  if (INST_DESC_ZH[name]) return INST_DESC_ZH[name];
  // 模糊匹配（JSON key 含在名称里 or 名称含在 key 里）
  const lc = name.toLowerCase();
  for (const [key, desc] of Object.entries(INST_DESC_ZH)) {
    const klc = key.toLowerCase();
    if (lc.includes(klc) || klc.includes(lc) ||
        key.split(' ').some(w => w.length > 4 && lc.includes(w.toLowerCase()))) {
      return desc;
    }
  }
  // 通用中文兜底
  return `${name} — 共发表 ${papers} 篇AI领域论文，拥有 ${scholars} 名活跃研究人员。`;
}

// ── Convert raw aggregated data → Institution object ─────────────────────────
const FUNDING_STATUSES = ['Invested', 'Funded', 'Public', 'Internal', 'Non-Profit'] as const;
function rawToInstitution(
  name: string, papers: number, scholars: number, index: number, maxScore: number,
): Institution {
  const score   = papers + scholars * 0.5;
  const hotness = Math.min(100, Math.round((score / Math.max(1, maxScore)) * 95) + 3);
  const region  = detectRegion(name);
  const fundingTrend = ['2021', '2022', '2023', '2024', '2025'].map((year, i) => ({
    year, label: '', amount: Math.round(papers * (0.6 + i * 0.18) * 8),
  }));
  const jsonEntry = findInstJSON(name);
  const influenceScores = jsonEntry
    ? jsonToInstRadar(jsonEntry)
    : [
        { label: 'Research Output', value: Math.min(100, papers * 6),            fullMark: 100 },
        { label: 'Talent Pool',     value: Math.min(100, scholars * 12),          fullMark: 100 },
        { label: 'Global Impact',   value: Math.min(100, Math.round(score * 2.5)), fullMark: 100 },
        { label: 'Innovation',      value: Math.min(100, hotness),                fullMark: 100 },
        { label: 'Collaboration',   value: Math.min(100, scholars * 6),           fullMark: 100 },
      ];
  return {
    id: `inst_real_${index}`,
    name,
    logo: name.slice(0, 2).toUpperCase(),
    region,
    description: getInstDesc(name, papers, scholars),
    website: `https://scholar.google.com/scholar?q=${encodeURIComponent(name)}`,
    staffCount: `${Math.max(scholars * 8, 50)}+`,
    articleCount: papers,
    productCount: Math.max(1, Math.round(scholars / 2)),
    hotness,
    fundingStatus: FUNDING_STATUSES[index % FUNDING_STATUSES.length],
    lastAmount: `$${Math.round(papers * 0.6)}M`,
    investors: [],
    portfolio: [],
    fundingTrend,
    influenceScores,
    rankHistory: [
      { year: 2022, rank: Math.max(1, 30 - index), score: Math.max(10, hotness - 15) },
      { year: 2023, rank: Math.max(1, 22 - index), score: Math.max(10, hotness - 8) },
      { year: 2024, rank: Math.max(1, 15 - index), score: hotness },
      { year: 2025, rank: Math.max(1, 10 - index), score: Math.min(100, hotness + 5) },
    ],
  };
}

export const Institutions: React.FC = () => {
  const [filterRegion, setFilterRegion] = useState('All');
  const [activeKeyword, setActiveKeyword] = useState('OpenClaw');
  const [sortBy, setSortBy] = useState<'hotness' | 'funding' | 'research' | 'product'>('hotness');

  const { data: papersData, loading: papersLoading } = usePapers();

  // Build institutions from real paper data — filtered by activeKeyword
  const allInstitutions = useMemo<Institution[]>(() => {
    if (!papersData) return [];
    // 只聚合当前关键词的论文；fallback 到全量（关键词数据不足时）
    const keywordPapers = papersData.samplePapers[activeKeyword] as any[] | undefined;
    const paperList: any[] = keywordPapers?.length
      ? keywordPapers
      : (Object.values(papersData.samplePapers) as any[][]).flat();

    const counts: Record<string, { papers: number; scholars: Set<string> }> = {};
    for (const paper of paperList) {
      for (const inst of parseInstitutions(paper.institution ?? '')) {
        if (!counts[inst]) counts[inst] = { papers: 0, scholars: new Set() };
        counts[inst].papers++;
        for (const a of (paper.authors ?? [])) counts[inst].scholars.add(a);
      }
    }
    const raw = Object.entries(counts)
      .map(([name, { papers, scholars }]) => ({ name, papers, scholars: scholars.size }))
      .filter(r => r.name.length > 3 && r.papers >= 1)
      .sort((a, b) => (b.papers + b.scholars * 0.5) - (a.papers + a.scholars * 0.5))
      .slice(0, 40);
    const maxScore = Math.max(1, ...raw.map(r => r.papers + r.scholars * 0.5));
    return raw.map((r, i) => rawToInstitution(r.name, r.papers, r.scholars, i, maxScore));
  }, [papersData, activeKeyword]);

  // Regions derived from real data
  const regionOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const inst of allInstitutions) seen.add(inst.region);
    return ['All', ...Array.from(seen).sort()];
  }, [allInstitutions]);

  const sortedInstitutions = useMemo(() => {
    let data = filterRegion === 'All'
      ? [...allInstitutions]
      : allInstitutions.filter(i => i.region === filterRegion);

    data.sort((a, b) => {
      switch (sortBy) {
        case 'funding': {
          const fund = (inst: Institution) => Math.max(...inst.fundingTrend.map(f => f.amount));
          return fund(b) - fund(a);
        }
        case 'research': return b.articleCount - a.articleCount;
        case 'product':  return b.productCount - a.productCount;
        default:         return b.hotness - a.hotness;
      }
    });
    return data;
  }, [allInstitutions, filterRegion, sortBy]);

  // Aggregate stats
  const totalFunding = `$${Math.round(sortedInstitutions.reduce((s, i) => s + i.articleCount * 0.6, 0))}M+`;
  const totalPapers  = sortedInstitutions.reduce((s, i) => s + i.articleCount, 0).toLocaleString();
  const activeNodes  = sortedInstitutions.length;

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700 p-4 lg:p-10">
      
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--border-color)] pb-8 gap-6">
        <div className="relative">
          <KeywordSwitcher keywords={['OpenClaw', 'Seedance 2.0']} value={activeKeyword} onChange={setActiveKeyword} accent="emerald" />
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
              {regionOptions.map(r => (
                <option key={r} value={r}>{r === 'All' ? 'Global View' : r}</option>
              ))}
            </select>
         </div>
      </div>

      {/* Leaderboard List */}
      <section className="space-y-4">
        {papersLoading && (
          <div className="text-center py-20 text-slate-400 animate-pulse">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-3 block"></i>
            Loading institution data…
          </div>
        )}
        {!papersLoading && sortedInstitutions.length === 0 && (
          <div className="text-center py-20 text-slate-400">No institutions found.</div>
        )}
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
