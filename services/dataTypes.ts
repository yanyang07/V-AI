/**
 * 与 CSV 数据直接对应的 TypeScript 类型
 * 这些类型反映预处理脚本输出的 JSON 结构
 */

// ─── 关键词论文表 (papers.json) ─────────────────────────────────────────────

export interface CSVPaper {
  id: string;           // arxivID
  keyword: string;      // 关键词
  title: string;        // 论文标题
  authors: string[];    // 作者数组
  date: string;         // 发布时间 "2025-09-12"
  year: number;
  month: number;
  relatedKeywords: string[];
  awards: string[];
  journal: string;
  hotness: number;      // 热度（来自 CSV 热度列）
  institution: string;  // 原始机构字符串
  region: string;       // 地区
  url: string;          // arxiv链接
}

export interface KeywordStat {
  total: number;
  regions: Record<string, number>;
  awards: number;
}

export interface MonthlyCount {
  month: string;   // "2025-09"
  count: number;
}

export interface PapersData {
  keywordStats: Record<string, KeywordStat>;
  keywordTrends: Record<string, MonthlyCount[]>;
  samplePapers: Record<string, CSVPaper[]>;
}

// ─── 关键词学者表 (scholars.json) ───────────────────────────────────────────

export interface CSVScholar {
  name: string;         // 姓名
  institution: string;  // 学者机构（取第一个）
  region: string;       // 学者地区
  email: string;        // 学者联系方式
  awards: string[];     // 学者获奖
  paperCount: number;   // 关联论文数
  keywords: string[];   // 学者关键词
  fields: string[];     // 学者领域
  journal: string;      // 学者期刊
}

export interface ScholarsData {
  scholars: CSVScholar[];
  regionStats: Record<string, number>;
  total: number;
}

// ─── 关键词新闻表 (news.json) ───────────────────────────────────────────────

export interface CSVNews {
  id: string;
  keyword: string;      // 关键词
  platform: string;     // 新闻平台 (Twitter/Reddit/Discord等)
  title: string;        // 新闻标题
  summary: string;      // 新闻梗概（截取前200字）
  date: string;         // 新闻发布时间
  url: string;          // 跳转链接
}

export interface NewsData {
  news: CSVNews[];
  byKeyword: Record<string, CSVNews[]>;
  platformStats: Record<string, number>;
  total: number;
}

// ─── 关键词索引 (keywords.json) ─────────────────────────────────────────────

export interface KeywordInfo {
  word: string;
  category: 'Technology' | 'Company' | 'Person' | 'Product';
  paperCount: number;
  newsCount: number;
  awardPapers: number;
  topRegions: { region: string; count: number }[];
  sparkline: number[];  // 最近6个月论文数
  heat: number;         // 热度 0-100
}

export interface KeywordsData {
  keywords: KeywordInfo[];
}
