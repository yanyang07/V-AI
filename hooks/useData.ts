/**
 * React 数据 Hooks
 *
 * 使用方式（以 Scholars 页面为例）：
 *   const { data, loading, error } = useScholars();
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage msg={error} />;
 *   // 使用 data.scholars
 *
 * 每个 hook 都有三个返回值：
 *   - data: 加载完毕的数据（加载中时为 null）
 *   - loading: 是否正在加载
 *   - error: 错误信息（正常时为 null）
 */

import { useState, useEffect } from 'react';
import {
  loadKeywords,
  loadPapers,
  loadScholars,
  loadNews,
} from '../services/dataService';
import type {
  KeywordsData,
  PapersData,
  ScholarsData,
  NewsData,
} from '../services/dataTypes';

// ─── 通用 hook 工厂 ───────────────────────────────────────────────────────────
function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      });

    // 清理函数：组件卸载时忽略旧请求
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

// ─── 具体 Hooks ──────────────────────────────────────────────────────────────

/** 加载关键词热词数据 */
export function useKeywords() {
  return useAsyncData<KeywordsData>(loadKeywords);
}

/** 加载论文数据 */
export function usePapers() {
  return useAsyncData<PapersData>(loadPapers);
}

/** 加载学者数据 */
export function useScholars() {
  return useAsyncData<ScholarsData>(loadScholars);
}

/** 加载新闻数据 */
export function useNews() {
  return useAsyncData<NewsData>(loadNews);
}
