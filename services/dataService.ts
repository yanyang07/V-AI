/**
 * 数据服务层
 * 负责从 public/data/*.json 加载数据，并提供缓存
 *
 * 架构说明：
 * - 浏览器请求 /data/papers.json 等（Vite 自动从 public/ 目录提供）
 * - 用 Map 做内存缓存，同一数据只加载一次
 * - 所有函数返回 Promise，支持 async/await
 */

import type { PapersData, ScholarsData, NewsData, KeywordsData } from './dataTypes';

// 内存缓存，避免重复请求
const cache = new Map<string, unknown>();

async function fetchJSON<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as T;

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`加载数据失败: ${path} (${response.status})`);
  }
  const data = await response.json() as T;
  cache.set(path, data);
  return data;
}

// ─── 公开API ─────────────────────────────────────────────────────────────────

/** 加载关键词索引（热词列表、heat分数、sparkline） */
export function loadKeywords(): Promise<KeywordsData> {
  return fetchJSON<KeywordsData>('/data/keywords.json');
}

/** 加载论文数据（按关键词分组的论文列表 + 趋势） */
export function loadPapers(): Promise<PapersData> {
  return fetchJSON<PapersData>('/data/papers.json');
}

/** 加载学者数据（top500学者） */
export function loadScholars(): Promise<ScholarsData> {
  return fetchJSON<ScholarsData>('/data/scholars.json');
}

/** 加载新闻数据（按关键词分组的资讯） */
export function loadNews(): Promise<NewsData> {
  return fetchJSON<NewsData>('/data/news.json');
}

/** 清空缓存（用于调试或强制刷新） */
export function clearCache(): void {
  cache.clear();
}
