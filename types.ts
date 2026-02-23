
export interface FundingEvent {
  year: number;
  company: string;
  amount: string;
  investor: string;
  logo: string;
}

export interface TrendData {
  time: string;
  papers: number;
  paperGrowth: string;
  citations: number;
  social: number;
  news: number;
  funding: number;
  compositeIndex: number;
  fundingEvents?: FundingEvent[];
}

export interface Award {
  year: number;
  name: string;
  organization: string;
}

export interface Migration {
  year: number;
  institution: string;
}

export enum SortOption {
  RELEVANCE = 'RELEVANCE',
  HOTNESS = 'HOTNESS',
  CITATIONS = 'CITATIONS',
  RECENCY = 'RECENCY',
  INFLUENCE = 'INFLUENCE'
}

export interface InfluenceScore {
  label: string;
  value: number;
  fullMark: number;
}

export interface RankPoint {
  year: number;
  rank: number;
  score: number;
}

export interface ScholarRelationship {
  id: string;
  name: string;
  avatar: string;
  role: 'teacher' | 'student';
}

export interface Scholar {
  id: string;
  nameEn: string;
  nameZh: string;
  institution: string[];
  field: string[];
  avatar: string;
  awards: Award[];
  hotness: number;
  email: string;
  citations: number;
  migration: Migration[];
  influenceScores: InfluenceScore[];
  rankHistory: RankPoint[];
  region: string;
  trendData: { year: number; value: number }[];
  teachers: ScholarRelationship[];
  students: ScholarRelationship[];
}

export interface Paper {
  id: string;
  title: string;
  year: number;
  date?: string;        // 论文日期 "YYYY-MM-DD"
  citations: number;
  hotness: number;
  awards: string[];
  trend: number[];
  authors: string[];
  tags: string[];
  venue: string;
  journal?: string;
  abstract?: string;
  url?: string;
}

export interface Institution {
  id: string;
  name: string;
  logo: string;
  region: string;
  description: string;
  website: string;          // New: Official website URL
  staffCount: string;       // Changed to string for flexibility (e.g. "2000+")
  articleCount: number;
  productCount: number; 
  hotness: number;     
  fundingStatus: 'Invested' | 'Funded' | 'Internal' | 'Public' | 'Non-Profit';
  lastAmount: string;       // Most recent or total significant funding
  investors: string[];      // New: Who invested in them
  portfolio: string[];      // New: Who they invested in (or key projects)
  fundingTrend: { year: string; amount: number; label: string }[]; // New: Funding history graph data
  influenceScores: InfluenceScore[];
  rankHistory: RankPoint[];
}

export interface RegionData {
  id: string;
  name: string;
  influenceScores: InfluenceScore[];
  rankHistory: RankPoint[];
}

export interface SocialPost {
  id: string;
  platform: 'X' | 'Reddit' | 'HuggingFace';
  user: string;
  avatar: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  url?: string;
}

export type HotWordCategory = 'Technology' | 'Company' | 'Person' | 'Product';

export interface HotWord {
  id: string;
  word: string;
  category: HotWordCategory;
  heat: number;
  trend: number[];
}

export interface Project {
  id: string;
  name: string;
  stars: string;
  description: string;
  trend: number[];
  category: string;
  url?: string;
}

export interface News {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}
