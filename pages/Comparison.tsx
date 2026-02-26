
import React, { useState, useEffect, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell
} from 'recharts';
import { usePapers, useScholars } from '../hooks/useData';
import { REGIONS_LIST, REGIONAL_TRENDS } from '../constants';

type CompareMode = 'region' | 'institution' | 'scholar';

interface CompEntity {
  id: string;
  name: string;
  papers: number;
  scholars: number;
  awards: number;
  hotness: number; // 0-100
  influenceScores: { label: string; value: number; fullMark?: number }[];
  rankHistory: { year: number; rank: number; score: number }[];
  monthlyTrend: { month: string; count: number }[];
  institution?: string;
  region?: string;
}

// ─── Mock influence mappings ─────────────────────────────────────────────────
// Region name → REGIONAL_TRENDS key
const REGION_TREND_KEY: Record<string, string> = {
  '美国': 'USA', '中国': 'China',
  '英国': 'EU', '德国': 'EU', '法国': 'EU', '欧盟': 'EU',
};

// Region name → mock influenceScores
const REGION_INFLUENCE_MAP: Record<string, { label: string; value: number; fullMark: number }[]> = {};
REGIONS_LIST.forEach(r => {
  const scores = (r as any).influenceScores as { label: string; value: number; fullMark: number }[];
  REGION_INFLUENCE_MAP[r.id] = scores;
  REGION_INFLUENCE_MAP[r.name] = scores;
});
REGION_INFLUENCE_MAP['美国'] = REGION_INFLUENCE_MAP['USA'];
REGION_INFLUENCE_MAP['中国'] = REGION_INFLUENCE_MAP['China'];
REGION_INFLUENCE_MAP['英国'] = REGION_INFLUENCE_MAP['EU'];
REGION_INFLUENCE_MAP['德国'] = REGION_INFLUENCE_MAP['EU'];
REGION_INFLUENCE_MAP['法国'] = REGION_INFLUENCE_MAP['EU'];

// Dimension labels for institutions (matches INSTITUTIONS_MOCK)
const INST_DIMS = ['Innovation', 'Research', 'Talent', 'Impact', 'Growth', 'Network'];

// Dimension labels for scholars (matches SCHOLAR_RADAR_LABELS in constants)
const SCHOLAR_DIMS = [
  '产出力 (Productivity)',
  '学术影响力 (Academic)',
  '领域主导力 (Dominance)',
  '趋势敏感度 (Sensitivity)',
  '合作影响半径 (Radius)',
];

// Scale factor: samplePapers ≈ 1/10 of full CSV
const SAMPLE_SCALE = 10;

// ─── Pinned scholar JSON data ────────────────────────────────────────────────
interface ScholarJSON {
  name: string;
  output_total_papers: number;
  output_recent3y_papers: number;
  output_active_years: number;
  academic_total_citations: number;
  academic_hindex: number;
  academic_max_single_citation: number;
  domain_top_paper_ratio: number;
  domain_term_binding: number;
  trend_emerging_paper_ratio: number;
  cooperation_coauthors: number;
  cooperation_cross_inst_ratio: number;
  cooperation_international_ratio: number;
  community_social_mentions: number;
  community_media_mentions: number;
  community_bigname_recs: number;
}

const PINNED_SCHOLAR_DATA: ScholarJSON[] = [
  {
    name: 'Soeren Arlt',
    output_total_papers: 15, output_recent3y_papers: 11, output_active_years: 4,
    academic_total_citations: 110, academic_hindex: 6, academic_max_single_citation: 45,
    domain_top_paper_ratio: 35, domain_term_binding: 85,
    trend_emerging_paper_ratio: 85,
    cooperation_coauthors: 28, cooperation_cross_inst_ratio: 75, cooperation_international_ratio: 45,
    community_social_mentions: 85, community_media_mentions: 7, community_bigname_recs: 4,
  },
  {
    name: 'Badr AlKhamissi',
    output_total_papers: 35, output_recent3y_papers: 19, output_active_years: 7,
    academic_total_citations: 900, academic_hindex: 14, academic_max_single_citation: 260,
    domain_top_paper_ratio: 28, domain_term_binding: 82,
    trend_emerging_paper_ratio: 70,
    cooperation_coauthors: 45, cooperation_cross_inst_ratio: 65, cooperation_international_ratio: 55,
    community_social_mentions: 210, community_media_mentions: 12, community_bigname_recs: 6,
  },
];

// 将 JSON 字段映射到 5 个雷达维度 (0-150 标尺)
function jsonToInfluenceScores(d: ScholarJSON) {
  // 产出力: 论文总量 + 近3年活跃度 + 活跃年数
  const prod = Math.min(150, Math.round(d.output_total_papers * 1.5 + d.output_recent3y_papers * 2.5 + d.output_active_years * 5));
  // 学术影响力: h-index + 引用总量 + 单篇最高引用
  const acad = Math.min(150, Math.round(d.academic_hindex * 8 + d.academic_total_citations / 30 + d.academic_max_single_citation / 8));
  // 领域主导力: 顶刊占比 + 关键词绑定度
  const dom  = Math.min(150, Math.round(d.domain_top_paper_ratio * 1.2 + d.domain_term_binding * 0.5));
  // 趋势敏感度: 新兴论文占比 (0-100 → 0-150)
  const sens = Math.min(150, Math.round(d.trend_emerging_paper_ratio * 1.5));
  // 合作影响半径: 合著人数 + 跨机构 + 国际化比例
  const rad  = Math.min(150, Math.round(d.cooperation_coauthors * 1.8 + d.cooperation_cross_inst_ratio * 0.6 + d.cooperation_international_ratio * 0.4));
  return [
    { label: SCHOLAR_DIMS[0], value: prod, fullMark: 150 },
    { label: SCHOLAR_DIMS[1], value: acad, fullMark: 150 },
    { label: SCHOLAR_DIMS[2], value: dom,  fullMark: 150 },
    { label: SCHOLAR_DIMS[3], value: sens, fullMark: 150 },
    { label: SCHOLAR_DIMS[4], value: rad,  fullMark: 150 },
  ];
}

// 社区热度 → 0-100 hotness
function jsonToHotness(d: ScholarJSON) {
  return Math.min(100, Math.round(d.community_social_mentions / 2 + d.community_media_mentions * 3 + d.community_bigname_recs * 5));
}

// ─── Pinned institution JSON data ───────────────────────────────────────────
interface InstitutionJSON {
  name: string;
  research_output_papers_recent3m: number;
  research_output_growth_rate: number;
  academic_citations_recent3m: number;
  academic_top_paper_ratio: number;
  academic_high_heat_papers: number;
  talent_top_scholars: number;
  talent_top10pct_ratio: number;
  tech_leadership: number;
  industry_coop_paper_ratio: number;
  industry_enterprise_coauth: number;
  industry_funding_scholars: number;
  global_intl_coauth_ratio: number;
  global_overseas_network: number;
  global_conf_participation: number;
}

const PINNED_INSTITUTION_DATA: InstitutionJSON[] = [
  {
    name: 'KAUST',
    research_output_papers_recent3m: 62, research_output_growth_rate: 22,
    academic_citations_recent3m: 1850, academic_top_paper_ratio: 18, academic_high_heat_papers: 14,
    talent_top_scholars: 16, talent_top10pct_ratio: 24,
    tech_leadership: 95,
    industry_coop_paper_ratio: 32, industry_enterprise_coauth: 28, industry_funding_scholars: 9,
    global_intl_coauth_ratio: 58, global_overseas_network: 92, global_conf_participation: 88,
  },
  {
    name: 'EPFL',
    research_output_papers_recent3m: 78, research_output_growth_rate: 15,
    academic_citations_recent3m: 2450, academic_top_paper_ratio: 22, academic_high_heat_papers: 19,
    talent_top_scholars: 12, talent_top10pct_ratio: 21,
    tech_leadership: 88,
    industry_coop_paper_ratio: 28, industry_enterprise_coauth: 35, industry_funding_scholars: 11,
    global_intl_coauth_ratio: 62, global_overseas_network: 90, global_conf_participation: 85,
  },
];

// 将机构 JSON 字段映射到 6 个雷达维度 (0-150 标尺)
// INST_DIMS = ['Innovation', 'Research', 'Talent', 'Impact', 'Growth', 'Network']
function jsonToInstInfluenceScores(d: InstitutionJSON) {
  // Innovation: 技术领导力直接映射
  const innov = Math.min(150, Math.round(d.tech_leadership * 1.5));
  // Research: 引用 + 顶刊占比 + 高热论文
  const maxCit = 3000;
  const research = Math.min(150, Math.round(
    (d.academic_citations_recent3m / maxCit) * 90 +
    d.academic_top_paper_ratio * 1.8 +
    d.academic_high_heat_papers * 1.5,
  ));
  // Talent: 顶级学者数 + 前10%占比
  const talent = Math.min(150, Math.round(d.talent_top_scholars * 5 + d.talent_top10pct_ratio * 1.5));
  // Impact: 引用 + 高热论文
  const impact = Math.min(150, Math.round(
    (d.academic_citations_recent3m / maxCit) * 100 + d.academic_high_heat_papers * 3,
  ));
  // Growth: 近3月产出 + 增长率
  const growth = Math.min(150, Math.round(d.research_output_papers_recent3m * 1.1 + d.research_output_growth_rate * 2.5));
  // Network: 国际合作 + 海外网络 + 会议 + 企业合著
  const network = Math.min(150, Math.round(
    d.global_intl_coauth_ratio * 0.8 +
    d.global_overseas_network * 0.3 +
    d.global_conf_participation * 0.3 +
    d.industry_enterprise_coauth * 0.5,
  ));
  return [
    { label: INST_DIMS[0], value: innov,    fullMark: 150 },
    { label: INST_DIMS[1], value: research, fullMark: 150 },
    { label: INST_DIMS[2], value: talent,   fullMark: 150 },
    { label: INST_DIMS[3], value: impact,   fullMark: 150 },
    { label: INST_DIMS[4], value: growth,   fullMark: 150 },
    { label: INST_DIMS[5], value: network,  fullMark: 150 },
  ];
}

// ─── Pinned trajectory data (Convergence Matrix) ────────────────────────────
// scholar 轨迹用4个月，institution 轨迹用12个月，各自独立
const PINNED_TRAJECTORY_SCHOLAR = {
  time_points: ['2025-11', '2025-12', '2026-01', '2026-02'],
  entities: [
    { name: 'Soeren Arlt',     scores: [68, 72, 77, 81] },
    { name: 'Badr AlKhamissi', scores: [79, 82, 84, 91] },
  ],
};

const PINNED_TRAJECTORY_INSTITUTION = {
  time_points: [
    '2025-03', '2025-04', '2025-05', '2025-06',
    '2025-07', '2025-08', '2025-09', '2025-10',
    '2025-11', '2025-12', '2026-01', '2026-02',
  ],
  entities: [
    { name: 'KAUST', scores: [75, 77, 79, 81, 82, 84, 85, 87, 88, 90, 92, 94] },
    { name: 'EPFL',  scores: [80, 81, 82, 82, 83, 84, 84, 85, 86, 87, 88, 89] },
  ],
};

// 根据 mode 选择对应轨迹表，只要至少一个有 pinned 数据就返回图表数组
function getPinnedTrajectory(nameA: string, nameB: string, mode: 'scholar' | 'institution' | 'region') {
  const table = mode === 'scholar'
    ? PINNED_TRAJECTORY_SCHOLAR
    : mode === 'institution'
    ? PINNED_TRAJECTORY_INSTITUTION
    : null;
  if (!table) return null;
  const rowA = table.entities.find(e => e.name === nameA);
  const rowB = table.entities.find(e => e.name === nameB);
  if (!rowA && !rowB) return null;
  return table.time_points.map((t, i) => ({
    time: t,
    ...(rowA ? { [nameA]: rowA.scores[i] } : {}),
    ...(rowB ? { [nameB]: rowB.scores[i] } : {}),
  }));
}

function jsonToInstHotness(d: InstitutionJSON) {
  return Math.min(100, Math.round(
    d.academic_citations_recent3m / 50 +
    d.research_output_growth_rate +
    d.tech_leadership * 0.3,
  ));
}

// Parse "Inst Name - Country, ..." institution field
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

const RACE_YEARS = [2024, 2025, 2026];
const SKIP_REGIONS = new Set(['待映射', '无', '未知', '']);

// ─── Shared helper: compute rank-history ranks in-place ─────────────────────
function assignRanks(entities: CompEntity[], years: number[]) {
  years.forEach(y => {
    [...entities]
      .sort((a, b) => {
        const sa = a.rankHistory.find(h => h.year === y)?.score ?? 0;
        const sb = b.rankHistory.find(h => h.year === y)?.score ?? 0;
        return sb - sa;
      })
      .forEach((e, i) => {
        const h = e.rankHistory.find(h => h.year === y);
        if (h) h.rank = i + 1;
      });
  });
}

export const Comparison: React.FC = () => {
  const { data: papersData } = usePapers();
  const { data: scholarsData } = useScholars();

  const [mode, setMode] = useState<CompareMode>('region');
  const [itemA, setItemA] = useState<string>('');
  const [itemB, setItemB] = useState<string>('');
  const [activeMetric] = useState<string>('papers');
  const [raceYear, setRaceYear] = useState(2025);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  // ─── Region entities ────────────────────────────────────────────────────────
  const regionEntities = useMemo((): CompEntity[] => {
    if (!papersData) return [];
    type R = {
      papers: number; scholars: Set<string>; awards: number;
      keywords: Set<string>; byYear: Record<number, number>; byMonth: Record<string, number>;
    };
    const stats: Record<string, R> = {};

    for (const [kw, papers] of Object.entries(papersData.samplePapers)) {
      for (const paper of papers) {
        const region = paper.region?.trim() ?? '';
        if (SKIP_REGIONS.has(region)) continue;
        if (!stats[region]) stats[region] = {
          papers: 0, scholars: new Set(), awards: 0,
          keywords: new Set(), byYear: {}, byMonth: {},
        };
        const s = stats[region];
        s.papers++;
        paper.authors.forEach(a => s.scholars.add(a));
        if (paper.awards?.length) s.awards++;
        s.keywords.add(kw);
        s.byYear[paper.year] = (s.byYear[paper.year] ?? 0) + 1;
        const m = `${paper.year}-${String(paper.month).padStart(2, '0')}`;
        s.byMonth[m] = (s.byMonth[m] ?? 0) + 1;
      }
    }

    const entries = Object.entries(stats);
    const maxP = Math.max(1, ...entries.map(([, s]) => s.papers));

    const REGION_DIMS = [
      'Volume (科研体量)', 'Quality (科研质量)', 'Density (人才浓度)',
      'Innovation (产业创新)', 'Connectivity (全球连接)',
    ];

    const entities: CompEntity[] = entries.map(([name, s]) => {
      const ratio = s.papers / maxP;
      // Use mock influenceScores for known regions; generate for others in 0-150 range
      const mockScores = REGION_INFLUENCE_MAP[name];
      const influenceScores = mockScores ?? REGION_DIMS.map((label, i) => ({
        label,
        value: Math.round(Math.min(150, (ratio * 130 + 20) * ([1, 0.9, 0.85, 0.95, 0.75][i] ?? 1))),
        fullMark: 150,
      }));
      const hotness = Math.round(ratio * 100);
      return {
        id: name, name,
        papers: s.papers, scholars: s.scholars.size, awards: s.awards, hotness,
        influenceScores,
        rankHistory: RACE_YEARS.map(y => ({
          year: y, rank: 0,
          score: Math.round(Math.min(100, ((s.byYear[y] ?? 0) / Math.max(1, maxP / 4)) * 100)),
        })),
        monthlyTrend: Object.entries(s.byMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count })),
      };
    }).sort((a, b) => b.papers - a.papers);

    assignRanks(entities, RACE_YEARS);
    return entities;
  }, [papersData]);

  // ─── Institution entities ───────────────────────────────────────────────────
  const institutionEntities = useMemo((): CompEntity[] => {
    // 置顶两家 JSON 精确数据机构
    const pinnedInstNames = new Set(PINNED_INSTITUTION_DATA.map(d => d.name));
    const pinnedInstEntities: CompEntity[] = PINNED_INSTITUTION_DATA.map((d, idx) => {
      const hotness = jsonToInstHotness(d);
      return {
        id: d.name, name: d.name,
        papers: d.research_output_papers_recent3m,
        scholars: d.talent_top_scholars,
        awards: d.academic_high_heat_papers,
        hotness,
        influenceScores: jsonToInstInfluenceScores(d),
        rankHistory: RACE_YEARS.map((y, yi) => ({
          year: y, rank: idx + 1,
          score: Math.max(1, Math.round(hotness * (0.4 + yi * 0.3))),
        })),
        monthlyTrend: [],
      };
    });

    if (!papersData) return pinnedInstEntities;

    type R = {
      papers: number; scholars: Set<string>; awards: number;
      keywords: Set<string>; byYear: Record<number, number>; byMonth: Record<string, number>;
    };
    const stats: Record<string, R> = {};

    for (const [kw, papers] of Object.entries(papersData.samplePapers)) {
      for (const paper of papers) {
        const insts = parseInstitutions(paper.institution);
        for (const inst of insts) {
          if (pinnedInstNames.has(inst)) continue; // 跳过已置顶机构
          if (!stats[inst]) stats[inst] = {
            papers: 0, scholars: new Set(), awards: 0,
            keywords: new Set(), byYear: {}, byMonth: {},
          };
          const s = stats[inst];
          s.papers++;
          paper.authors.forEach(a => s.scholars.add(a));
          if (paper.awards?.length) s.awards++;
          s.keywords.add(kw);
          s.byYear[paper.year] = (s.byYear[paper.year] ?? 0) + 1;
          const m = `${paper.year}-${String(paper.month).padStart(2, '0')}`;
          s.byMonth[m] = (s.byMonth[m] ?? 0) + 1;
        }
      }
    }

    const entries = Object.entries(stats);
    const maxP = Math.max(1, ...entries.map(([, s]) => s.papers));

    const csvInstEntities: CompEntity[] = entries
      .sort(([, a], [, b]) => b.papers - a.papers)
      .slice(0, 60)
      .map(([name, s]) => {
        const ratio = s.papers / maxP;
        const dimWeights = [1, 0.92, 0.88, 0.85, 0.96, 0.78];
        const base150 = Math.round(ratio * 140) + 10;
        const sc150 = Math.min(150, Math.round(s.scholars.size * 4.5));
        const aw150 = Math.min(150, s.awards * 22);
        const kw150 = Math.min(150, s.keywords.size * 18);
        const influenceScores = INST_DIMS.map((label, i) => {
          let val: number;
          if (i === 0) val = base150;
          else if (i === 1) val = Math.round(base150 * dimWeights[1] + sc150 * 0.1);
          else if (i === 2) val = sc150;
          else if (i === 3) val = Math.round((base150 + aw150) / 2);
          else if (i === 4) val = Math.round(base150 * dimWeights[4]);
          else val = Math.round(kw150 * dimWeights[5]);
          return { label, value: Math.min(150, Math.max(10, val)), fullMark: 150 };
        });
        const hotness = Math.round(ratio * 100);
        return {
          id: name, name,
          papers: s.papers, scholars: s.scholars.size, awards: s.awards, hotness,
          influenceScores,
          rankHistory: RACE_YEARS.map(y => ({
            year: y, rank: 0,
            score: Math.round(Math.min(100, ((s.byYear[y] ?? 0) / Math.max(1, maxP / 4)) * 100)),
          })),
          monthlyTrend: Object.entries(s.byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count })),
        };
      });

    assignRanks(csvInstEntities, RACE_YEARS);
    // 置顶 JSON 机构，其余按论文数排序
    return [...pinnedInstEntities, ...csvInstEntities];
  }, [papersData]);

  // ─── Scholar entities ────────────────────────────────────────────────────────
  const scholarEntities = useMemo((): CompEntity[] => {
    // 置顶两位 JSON 精确数据学者
    const pinnedNames = new Set(PINNED_SCHOLAR_DATA.map(d => d.name));
    const pinnedEntities: CompEntity[] = PINNED_SCHOLAR_DATA.map((d, idx) => {
      const hotness = jsonToHotness(d);
      return {
        id: d.name, name: d.name,
        papers: d.output_total_papers, scholars: 1, awards: 0, hotness,
        influenceScores: jsonToInfluenceScores(d),
        rankHistory: RACE_YEARS.map((y, yi) => ({
          year: y, rank: idx + 1,
          score: Math.max(1, Math.round(hotness * (0.4 + yi * 0.3))),
        })),
        monthlyTrend: [],
      };
    });

    if (!scholarsData) return pinnedEntities;

    const scholars = [...scholarsData.scholars]
      .filter(s => !pinnedNames.has(s.name))   // 避免重复
      .sort((a, b) => b.paperCount - a.paperCount)
      .slice(0, 80);
    const maxP = Math.max(1, scholars[0]?.paperCount ?? 1);

    const csvEntities: CompEntity[] = scholars.map((s, idx) => {
      const ratio = s.paperCount / maxP;
      const prod150  = Math.round(ratio * 140) + 10;
      const acad150  = Math.min(150, Math.round(prod150 * 0.88 + s.awards.length * 8));
      const dom150   = Math.min(150, Math.round((s.fields[0]?.split(',').length ?? 1) * 25 + prod150 * 0.3));
      const sens150  = Math.min(150, Math.round(s.keywords.length * 15 + 15));
      const rad150   = Math.min(150, Math.round(prod150 * 0.72 + acad150 * 0.2));
      const hotness  = Math.round(ratio * 100);
      return {
        id: s.name, name: s.name,
        institution: s.institution, region: s.region,
        papers: s.paperCount, scholars: 1, awards: s.awards.length, hotness,
        influenceScores: [
          { label: SCHOLAR_DIMS[0], value: prod150, fullMark: 150 },
          { label: SCHOLAR_DIMS[1], value: acad150, fullMark: 150 },
          { label: SCHOLAR_DIMS[2], value: dom150,  fullMark: 150 },
          { label: SCHOLAR_DIMS[3], value: sens150, fullMark: 150 },
          { label: SCHOLAR_DIMS[4], value: rad150,  fullMark: 150 },
        ],
        rankHistory: RACE_YEARS.map((y, yi) => ({
          year: y, rank: idx + 1,
          score: Math.max(1, Math.round(hotness * (0.4 + yi * 0.3))),
        })),
        monthlyTrend: [],
      } as CompEntity;
    });

    // 置顶 JSON 学者，其余按论文数排序
    return [...pinnedEntities, ...csvEntities];
  }, [scholarsData]);

  // ─── Active list ─────────────────────────────────────────────────────────────
  const activeList = mode === 'region'
    ? regionEntities
    : mode === 'institution'
    ? institutionEntities
    : scholarEntities;

  // region 模式：数据加载完后同步默认选项
  useEffect(() => {
    if (mode === 'region' && activeList.length >= 2 && !itemA) {
      setItemA(activeList[0].id);
      setItemB(activeList[1].id);
    }
  }, [mode, activeList, itemA]);

  // 同步切换 mode + 默认选项，避免异步 effect 导致空白帧
  const handleModeChange = (m: CompareMode) => {
    setMode(m);
    if (m === 'scholar') {
      setItemA(PINNED_SCHOLAR_DATA[0].name);
      setItemB(PINNED_SCHOLAR_DATA[1].name);
    } else if (m === 'institution') {
      setItemA(PINNED_INSTITUTION_DATA[0].name);
      setItemB(PINNED_INSTITUTION_DATA[1].name);
    } else {
      // region：从当前已加载的列表取前两个
      const list = regionEntities;
      if (list.length >= 2) {
        setItemA(list[0].id);
        setItemB(list[1].id);
      }
    }
  };

  const entityA = useMemo(() => activeList.find(e => e.id === itemA), [activeList, itemA]);
  const entityB = useMemo(() => activeList.find(e => e.id === itemB), [activeList, itemB]);
  const getLabel = (id: string) => activeList.find(e => e.id === id)?.name ?? id;

  // ─── Institution pinned trajectory (inline, 不走函数) ───────────────────────
  const INST_TRAJ_MONTHS = [
    '2025-03','2025-04','2025-05','2025-06',
    '2025-07','2025-08','2025-09','2025-10',
    '2025-11','2025-12','2026-01','2026-02',
  ];
  const INST_TRAJ_SCORES: Record<string, number[]> = {
    'KAUST': [75,77,79,81,82,84,85,87,88,90,92,94],
    'EPFL':  [80,81,82,82,83,84,84,85,86,87,88,89],
  };

  // ─── Scholar pinned trajectory (inline) ──────────────────────────────────────
  const SCHOLAR_TRAJ_MONTHS = ['2025-11','2025-12','2026-01','2026-02'];
  const SCHOLAR_TRAJ_SCORES: Record<string, number[]> = {
    'Soeren Arlt':     [68,72,77,81],
    'Badr AlKhamissi': [79,82,84,91],
  };

  // ─── Trajectory trend data ───────────────────────────────────────────────────
  const trendData = useMemo(() => {
    if (!entityA || !entityB) return [];

    // institution 模式：直接使用内联数据
    if (mode === 'institution') {
      const scoresA = INST_TRAJ_SCORES[entityA.name];
      const scoresB = INST_TRAJ_SCORES[entityB.name];
      if (scoresA || scoresB) {
        return INST_TRAJ_MONTHS.map((t, i) => ({
          time: t,
          ...(scoresA ? { [entityA.name]: scoresA[i] } : {}),
          ...(scoresB ? { [entityB.name]: scoresB[i] } : {}),
        }));
      }
      // 无 pinned 数据时回退 rankHistory
      return RACE_YEARS.map(y => ({
        time: String(y),
        [entityA.name]: entityA.rankHistory.find(h => h.year === y)?.score ?? 0,
        [entityB.name]: entityB.rankHistory.find(h => h.year === y)?.score ?? 0,
      }));
    }

    // scholar 模式：直接使用内联数据
    if (mode === 'scholar') {
      const scoresA = SCHOLAR_TRAJ_SCORES[entityA.name];
      const scoresB = SCHOLAR_TRAJ_SCORES[entityB.name];
      if (scoresA || scoresB) {
        return SCHOLAR_TRAJ_MONTHS.map((t, i) => ({
          time: t,
          ...(scoresA ? { [entityA.name]: scoresA[i] } : {}),
          ...(scoresB ? { [entityB.name]: scoresB[i] } : {}),
        }));
      }
      // 无 pinned 数据时合成
      return Array.from({ length: 12 }, (_, i) => ({
        time: `2025-${String(i + 1).padStart(2, '0')}`,
        [entityA.name]: Math.max(1, Math.round(entityA.papers * (0.45 + i / 22))),
        [entityB.name]: Math.max(1, Math.round(entityB.papers * (0.45 + i / 22))),
      }));
    }

    if (mode === 'region') {
      const keyA = REGION_TREND_KEY[entityA.name];
      const keyB = REGION_TREND_KEY[entityB.name];
      const mockA = REGIONAL_TRENDS[keyA ?? ''] ?? [];
      const mockB = REGIONAL_TRENDS[keyB ?? ''] ?? [];

      // Build yearly timeline: mock 2020-2024 + real 2025 + 2026-estimate
      const timeMap = new Map<string, { a: number; b: number }>();

      const HIST_YEARS = ['2020', '2021', '2022', '2023', '2024'];
      HIST_YEARS.forEach(y => {
        const dA = mockA.find((d: any) => (d.time ?? String(d.year)) === y);
        const dB = mockB.find((d: any) => (d.time ?? String(d.year)) === y);
        timeMap.set(y, { a: dA?.papers ?? 0, b: dB?.papers ?? 0 });
      });

      // 2025: sum real monthly counts × SAMPLE_SCALE, cross-fill with news proxy
      const sum25A = entityA.monthlyTrend
        .filter(d => d.month.startsWith('2025'))
        .reduce((s, d) => s + d.count, 0);
      const sum25B = entityB.monthlyTrend
        .filter(d => d.month.startsWith('2025'))
        .reduce((s, d) => s + d.count, 0);
      // News cross-fill: 1663 news items distributed proportionally by paper share
      const totalAB = Math.max(entityA.papers + entityB.papers, 1);
      const newsProxyA = Math.round((entityA.papers / totalAB) * 1663 * 0.8);
      const newsProxyB = Math.round((entityB.papers / totalAB) * 1663 * 0.8);
      if (sum25A > 0 || sum25B > 0) {
        timeMap.set('2025', {
          a: sum25A * SAMPLE_SCALE + newsProxyA,
          b: sum25B * SAMPLE_SCALE + newsProxyB,
        });
      }

      // 2026: partial year — annualise ×6 from Jan-Feb data + news cross-fill
      const sum26A = entityA.monthlyTrend
        .filter(d => d.month.startsWith('2026'))
        .reduce((s, d) => s + d.count, 0);
      const sum26B = entityB.monthlyTrend
        .filter(d => d.month.startsWith('2026'))
        .reduce((s, d) => s + d.count, 0);
      if (sum26A > 0 || sum26B > 0) {
        timeMap.set('2026', {
          a: sum26A * SAMPLE_SCALE * 6 + newsProxyA,
          b: sum26B * SAMPLE_SCALE * 6 + newsProxyB,
        });
      }

      return [...timeMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([time, vals]) => ({
        time,
        [entityA.name]: vals.a,
        [entityB.name]: vals.b,
      }));
    }

    // region fallback: should not reach here, but guard
    return [];
  }, [entityA, entityB, mode]);

  // ─── Horse race data — 只展示选中的两个对比项 ──────────────────────────────
  const horseRaceData = useMemo(() => {
    return [itemA, itemB]
      .map(id => activeList.find(e => e.id === id))
      .filter((e): e is CompEntity => !!e)
      .map(e => ({
        name: e.name.length > 28 ? e.name.substring(0, 28) + '…' : e.name,
        score: e.rankHistory.find(h => h.year === raceYear)?.score ?? 0,
        id: e.id,
      }))
      .sort((a, b) => b.score - a.score);
  }, [activeList, itemA, itemB, raceYear]);

  // ─── Loading state ────────────────────────────────────────────────────────────
  if (!entityA || !entityB) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-dim)] text-sm font-black uppercase tracking-widest animate-pulse">
          Loading Data…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-6 lg:p-10">
      {/* Node Selection Hub */}
      <div className="glass p-10 rounded-[40px] border border-[var(--border-color)] flex flex-col xl:flex-row justify-between items-center gap-12">
        <div className="flex bg-slate-100 dark:bg-slate-900/80 p-2 rounded-2xl border border-[var(--border-color)] self-start xl:self-center">
          {(['region', 'institution', 'scholar'] as CompareMode[]).map(m => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-10 py-3 rounded-xl text-xs font-bold uppercase transition-all tracking-widest ${mode === m ? 'bg-cyan-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
            >
              {m} Battle
            </button>
          ))}
        </div>

        <div className="flex items-center gap-10 flex-1 justify-center max-w-5xl w-full">
          <div className="flex-1 space-y-2 group">
            <label className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-[0.3em] ml-2 block">Target Node Alpha</label>
            <div className="relative">
              <select
                value={itemA}
                onChange={(e) => setItemA(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-[var(--border-color)] rounded-2xl px-6 py-5 text-sm text-cyan-600 dark:text-cyan-400 font-black outline-none focus:border-cyan-500/50 appearance-none shadow-sm"
              >
                {activeList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-cyan-900/50 pointer-events-none" />
            </div>
          </div>

          <div className="text-4xl font-black text-slate-300 dark:text-white px-2 italic opacity-50 dark:opacity-10 select-none animate-pulse">VS</div>

          <div className="flex-1 space-y-2 group">
            <label className="text-[10px] text-pink-600 dark:text-pink-400 font-bold uppercase tracking-[0.3em] ml-2 block">Target Node Bravo</label>
            <div className="relative">
              <select
                value={itemB}
                onChange={(e) => setItemB(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-[var(--border-color)] rounded-2xl px-6 py-5 text-sm text-pink-600 dark:text-pink-400 font-black outline-none focus:border-pink-500/50 appearance-none shadow-sm"
              >
                {activeList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-pink-900/50 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Horse Race: Dynamic Vertical Ranking */}
      <section className="glass p-12 rounded-[50px] border border-[var(--border-color)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
          <div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
              <i className="fa-solid fa-bolt-lightning text-yellow-500" />
              Horse Race: Global Momentum
            </h3>
            <p className="text-slate-500 text-xs mt-2 font-bold tracking-widest uppercase">Real-time competitive displacement index.</p>
          </div>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/40 p-1.5 rounded-full border border-[var(--border-color)]">
            {RACE_YEARS.map(y => (
              <button
                key={y}
                onClick={() => setRaceYear(y)}
                className={`px-5 py-2.5 rounded-full font-black text-xs transition-all ${raceYear === y ? 'bg-white dark:bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[160px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={horseRaceData}
              margin={{ left: 20, right: 80 }}
              onMouseMove={(state: any) => {
                if (state?.activePayload?.length) setHoveredEntity(state.activePayload[0].payload.id);
              }}
              onMouseLeave={() => setHoveredEntity(null)}
            >
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} fontWeight="bold" width={180} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="glass p-4 rounded-2xl border border-[var(--border-color)] shadow-2xl bg-white/90 dark:bg-slate-900/90">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Impact Score</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: 'var(--border-color)', opacity: 0.1 }}
              />
              <Bar dataKey="score" radius={[0, 14, 14, 0]} animationDuration={1000} barSize={28}>
                {horseRaceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.id === itemA ? '#06b6d4' : entry.id === itemB ? '#ec4899' : '#64748b'}
                    fillOpacity={hoveredEntity && hoveredEntity !== entry.id ? 0.3 : (entry.id === itemA || entry.id === itemB ? 1 : 0.5)}
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
        {[
          { entity: entityA, id: itemA, color: '#06b6d4', label: 'Intel Mapping: Delta', tag: 'Alpha' },
          { entity: entityB, id: itemB, color: '#ec4899', label: 'Intel Mapping: Gamma', tag: 'Bravo' },
        ].map(({ entity, color, label, tag }, side) => (
          <div key={tag} className="glass p-12 rounded-[50px] border border-[var(--border-color)] relative overflow-hidden flex flex-col items-center group/card">
            <div className={`absolute top-12 ${side === 0 ? 'left-12' : 'right-12 text-right'}`}>
              <div className="text-[10px] font-black uppercase tracking-[0.5em] mb-2 opacity-50" style={{ color }}>{label}</div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{entity.name}</h4>
              {mode === 'scholar' && entity.institution && (
                <p className="text-slate-500 font-bold text-xs uppercase mt-1 truncate max-w-[200px]">{entity.institution}</p>
              )}
              {mode !== 'scholar' && (
                <p className="text-slate-500 font-bold text-xs uppercase mt-1">{entity.papers} papers · {entity.scholars} scholars</p>
              )}
            </div>
            <div className="w-full h-[420px] mt-20">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={entity.influenceScores}>
                  <PolarGrid stroke="var(--border-color)" strokeOpacity={0.5} />
                  <PolarAngleAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10, fontWeight: '800' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar
                    name={entity.name}
                    dataKey="value"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.15}
                    strokeWidth={4}
                    animationDuration={1800}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-base)' }}
                    itemStyle={{ color: 'var(--text-base)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Trajectory Convergence Area */}
      <div className="glass p-12 rounded-[60px] border border-[var(--border-color)] h-[600px] flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
              <i className="fa-solid fa-microchip text-2xl" />
            </div>
            Trajectory Convergence Matrix
          </h3>
          <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-[var(--border-color)] text-[10px] text-[var(--text-dim)] font-black mono uppercase">
            {mode === 'region'
              ? 'Annual Output · Papers + News Signal (2020 – 2026)'
              : (mode === 'institution' && (INST_TRAJ_SCORES[entityA?.name ?? ''] || INST_TRAJ_SCORES[entityB?.name ?? '']))
                  || (mode === 'scholar' && (SCHOLAR_TRAJ_SCORES[entityA?.name ?? ''] || SCHOLAR_TRAJ_SCORES[entityB?.name ?? '']))
                ? 'Composite Influence Score · 产出20% + 学术25% + 主导15% + 趋势15% + 合作10% + 社区15%'
                : 'Monthly Paper Output · Scaled'}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} fontWeight="bold" />
              <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} fontWeight="bold" />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '20px' }}
                itemStyle={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-base)' }}
                labelStyle={{ color: 'var(--text-base)' }}
              />
              <Legend verticalAlign="top" height={44} iconType="rect" iconSize={10}
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-dim)' }} />
              <Area type="monotone" dataKey={entityA.name} stroke="#06b6d4" strokeWidth={5}
                fillOpacity={1} fill="url(#colorA)" animationDuration={2000} />
              <Area type="monotone" dataKey={entityB.name} stroke="#ec4899" strokeWidth={5}
                fillOpacity={1} fill="url(#colorB)" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategic Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {[
          { entity: entityA, id: itemA, color: 'cyan', accentClass: 'text-cyan-600 dark:text-cyan-400', borderHover: 'hover:border-cyan-500/20', glowBg: 'bg-cyan-500/5', glowHover: 'group-hover:bg-cyan-500/10', tag: 'A', nodeLabel: 'Alpha' },
          { entity: entityB, id: itemB, color: 'pink',  accentClass: 'text-pink-600 dark:text-pink-400',  borderHover: 'hover:border-pink-500/20',  glowBg: 'bg-pink-500/5',  glowHover: 'group-hover:bg-pink-500/10',  tag: 'B', nodeLabel: 'Bravo' },
        ].map(({ entity, accentClass, borderHover, glowBg, glowHover, tag, nodeLabel }) => (
          <div key={tag} className={`glass p-14 rounded-[60px] border border-[var(--border-color)] space-y-10 relative overflow-hidden group ${borderHover} transition-all duration-500`}>
            <div className={`absolute -right-20 -top-20 w-80 h-80 ${glowBg} blur-[100px] rounded-full ${glowHover} transition-colors`} />

            <div className="flex items-center gap-8 border-b border-[var(--border-color)] pb-10">
              <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center font-black text-4xl border ${accentClass} ${tag === 'A' ? 'bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)] border-cyan-500/20' : 'bg-pink-500/10 shadow-[0_0_30px_rgba(236,72,153,0.2)] border-pink-500/20'}`}>
                {tag}
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-2xl tracking-tight leading-tight">{entity.name}</h4>
                {mode === 'scholar' && entity.institution && (
                  <div className="text-xs text-slate-500 font-bold mt-1">{entity.institution}</div>
                )}
                <div className={`text-[10px] font-black uppercase tracking-[0.4em] mt-2 ${accentClass}`}>
                  Intel Node {nodeLabel} Spectrum
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className={`p-6 bg-slate-50 dark:bg-slate-900/60 rounded-[28px] border border-[var(--border-color)] ${tag === 'A' ? 'hover:border-cyan-500/20' : 'hover:border-pink-500/20'} transition-all text-center`}>
                <div className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Papers</div>
                <div className={`text-2xl font-black ${accentClass}`}>{entity.papers}</div>
              </div>
              <div className={`p-6 bg-slate-50 dark:bg-slate-900/60 rounded-[28px] border border-[var(--border-color)] ${tag === 'A' ? 'hover:border-cyan-500/20' : 'hover:border-pink-500/20'} transition-all text-center`}>
                <div className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">
                  {mode === 'scholar' ? 'Awards' : 'Scholars'}
                </div>
                <div className={`text-2xl font-black ${accentClass}`}>
                  {mode === 'scholar' ? entity.awards : entity.scholars}
                </div>
              </div>
              <div className={`p-6 bg-slate-50 dark:bg-slate-900/60 rounded-[28px] border border-[var(--border-color)] ${tag === 'A' ? 'hover:border-cyan-500/20' : 'hover:border-pink-500/20'} transition-all text-center`}>
                <div className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Score</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{entity.hotness}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] px-2 mb-4">
                Annual Output · {RACE_YEARS.join(' / ')}
              </div>
              {entity.rankHistory.map((h, i) => (
                <div key={i} className={`flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-950/40 rounded-2xl border border-[var(--border-color)] ${tag === 'A' ? 'hover:border-cyan-500/40' : 'hover:border-pink-500/40'} transition-all`}>
                  <span className="text-sm font-black text-slate-800 dark:text-white tracking-widest">{h.year} SYNC</span>
                  <div className="flex items-center gap-5">
                    <span className="text-[10px] text-slate-500 font-black">RANK #{h.rank}</span>
                    <span className={`text-sm font-black mono ${accentClass}`}>{h.score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
