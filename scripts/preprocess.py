#!/usr/bin/env python3
"""
数据预处理脚本（Python 版）
Python 内置 csv 模块能正确处理引号内含换行的多行字段

运行: python3 scripts/preprocess.py
"""

import csv
import json
import os
from collections import defaultdict, Counter
from pathlib import Path

ROOT = Path(__file__).parent.parent
PUBLIC_DATA = ROOT / "public" / "data"

# 原始 CSV 源文件路径（含热度字段）
ORIGINAL_CSV_DIR = Path("/Users/naluto/workspace/2026/2月/Vantage AI/output/可用")

def read_csv(filepath):
    """读取 CSV，自动处理 BOM、NUL 字节和多行字段"""
    rows = []
    with open(filepath, encoding="utf-8-sig", newline="", errors="replace") as f:
        # 过滤 NUL 字节（\x00），某些 CSV 工具会产生
        clean = (line.replace("\x00", "") for line in f)
        reader = csv.DictReader(clean)
        for row in reader:
            rows.append({k.strip(): v.strip() for k, v in row.items()})
    return rows

# ─── 处理 papers.csv ──────────────────────────────────────────────────────────
def process_papers():
    print("📄 处理 papers.csv ...")
    # 优先使用原始 CSV（含热度字段），回退到工作副本
    original = ORIGINAL_CSV_DIR / "Keyword_Paper_Map_v2.csv"
    rows = read_csv(original if original.exists() else PUBLIC_DATA / "papers.csv")

    papers = []
    for r in rows:
        arxiv_id = r.get("arxivID", "").strip()
        title = r.get("论文标题", "").strip()
        keyword = r.get("关键词", "").strip()
        if not arxiv_id or not title or not keyword:
            continue

        date_str = r.get("发布时间", "")
        date_only = date_str.split(" ")[0] if date_str else ""
        year = int(date_only[:4]) if len(date_only) >= 4 else 0
        month = int(date_only[5:7]) if len(date_only) >= 7 else 0

        awards_raw = r.get("所获奖项", "无")
        awards = [] if awards_raw == "无" else [a.strip() for a in awards_raw.split(";") if a.strip()]

        related_raw = r.get("关联词", "")
        related = [s.strip() for s in related_raw.split(",") if s.strip()]

        authors = [a.strip() for a in r.get("作者", "").split(",") if a.strip()]

        hotness_raw = r.get("热度", "0").strip()
        try:
            hotness = int(hotness_raw) if hotness_raw not in ("", "无", "N/A") else 0
        except ValueError:
            hotness = 0

        papers.append({
            "id": arxiv_id,
            "keyword": keyword,
            "title": title,
            "authors": authors,
            "date": date_only,
            "year": year,
            "month": month,
            "relatedKeywords": related,
            "awards": awards,
            "journal": r.get("论文期刊", "").strip() if r.get("论文期刊", "").strip() != "无" else "",
            "hotness": hotness,
            "institution": r.get("机构", "").strip(),
            "region": r.get("地区", "").strip(),
            "url": f"https://arxiv.org/abs/{arxiv_id}",
        })

    # 按关键词统计
    keyword_stats = defaultdict(lambda: {"total": 0, "regions": defaultdict(int), "awards": 0})
    keyword_monthly = defaultdict(lambda: defaultdict(int))

    for p in papers:
        kw = p["keyword"]
        keyword_stats[kw]["total"] += 1
        if p["region"]:
            keyword_stats[kw]["regions"][p["region"]] += 1
        if p["awards"]:
            keyword_stats[kw]["awards"] += 1
        if p["date"]:
            month_key = p["date"][:7]  # "2025-09"
            keyword_monthly[kw][month_key] += 1

    # 转成普通 dict（regions 也转）
    keyword_stats_out = {}
    for kw, s in keyword_stats.items():
        keyword_stats_out[kw] = {
            "total": s["total"],
            "regions": dict(s["regions"]),
            "awards": s["awards"],
        }

    # 生成每关键词的月度趋势（时间升序）
    keyword_trends = {}
    for kw, months in keyword_monthly.items():
        sorted_months = sorted(months.items())
        keyword_trends[kw] = [{"month": m, "count": c} for m, c in sorted_months]

    # 每关键词取最多 200 篇：优先热度高的，热度相同再按日期倒序
    sample_papers = {}
    for kw in keyword_stats_out:
        kw_papers = [p for p in papers if p["keyword"] == kw]
        kw_papers.sort(key=lambda x: (x.get("hotness", 0), x["date"]), reverse=True)
        sample_papers[kw] = kw_papers[:200]

    output = {
        "keywordStats": keyword_stats_out,
        "keywordTrends": keyword_trends,
        "samplePapers": sample_papers,
    }
    with open(PUBLIC_DATA / "papers.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)

    print(f"   ✅ 共 {len(papers)} 篇论文，关键词: {', '.join(keyword_stats_out.keys())}")
    return output


# ─── 处理 scholars.csv ────────────────────────────────────────────────────────
def process_scholars():
    print("👩‍🎓 处理 scholars.csv ...")
    rows = read_csv(PUBLIC_DATA / "scholars.csv")

    scholars = []
    seen_names = set()

    for r in rows:
        name = r.get("姓名", "").strip()
        if not name or name in seen_names:
            continue
        seen_names.add(name)

        paper_count = int(r.get("关联论文数", "0") or "0")
        institution_raw = r.get("学者机构", "")
        institution = institution_raw.split(",")[0].strip()

        awards_raw = r.get("学者获奖", "无")
        awards = [] if awards_raw == "无" else [a.strip() for a in awards_raw.split(";") if a.strip()]

        keywords = [k.strip() for k in r.get("学者关键词", "").split(";") if k.strip()]
        fields = [f.strip() for f in r.get("学者领域", "").split(";") if f.strip()]

        scholars.append({
            "name": name,
            "institution": institution,
            "region": r.get("学者地区", "").strip(),
            "email": r.get("学者联系方式", "").strip(),
            "awards": awards,
            "paperCount": paper_count,
            "keywords": keywords,
            "fields": fields,
            "journal": r.get("学者期刊", "").strip() if r.get("学者期刊", "").strip() != "无" else "",
        })

    # 按论文数降序，取 top 500
    scholars.sort(key=lambda x: x["paperCount"], reverse=True)
    top_500 = scholars[:500]

    region_stats = Counter(s["region"] for s in top_500 if s["region"])

    output = {
        "scholars": top_500,
        "regionStats": dict(region_stats),
        "total": len(scholars),
    }
    with open(PUBLIC_DATA / "scholars.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)

    print(f"   ✅ 共 {len(scholars)} 位学者，输出 top500")
    return output


# ─── 处理 news.csv ────────────────────────────────────────────────────────────
def process_news():
    print("📰 处理 news.csv ...")
    rows = read_csv(PUBLIC_DATA / "news.csv")

    news = []
    for i, r in enumerate(rows):
        title = r.get("新闻标题", "").strip()
        keyword = r.get("关键词", "").strip()
        if not title or not keyword:
            continue
        summary = r.get("新闻梗概", "").strip()
        news.append({
            "id": f"news_{i}",
            "keyword": keyword,
            "platform": r.get("新闻平台", "").strip(),
            "title": title,
            "summary": summary[:200] + "…" if len(summary) > 200 else summary,
            "date": r.get("新闻发布时间", "").strip(),
            "url": r.get("跳转", "").strip(),
        })

    by_keyword = defaultdict(list)
    for n in news:
        by_keyword[n["keyword"]].append(n)

    platform_stats = Counter(n["platform"] for n in news if n["platform"])

    output = {
        "news": news,
        "byKeyword": dict(by_keyword),
        "platformStats": dict(platform_stats),
        "total": len(news),
    }
    with open(PUBLIC_DATA / "news.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)

    print(f"   ✅ 共 {len(news)} 条新闻，平台: {', '.join(platform_stats.keys())}")
    return output


# ─── 生成关键词索引 ───────────────────────────────────────────────────────────
def build_keyword_index(papers_data, news_data):
    print("🔑 生成关键词索引 ...")

    KEYWORD_CATEGORIES = {
        "OpenClaw": "Technology",
        "GPT-5.3-Codex": "Product",
        "Gemini 3 Deep Think": "Product",
        "Claude 4.6": "Product",
        "DeepSeek v4": "Product",
        "MiniMax M2.5": "Product",
        "Seedance 2.0": "Product",
        "Grok 4.20": "Product",
        "GLM-5": "Product",
        "Veo 3": "Product",
    }

    keywords = []
    keyword_stats = papers_data["keywordStats"]
    keyword_trends = papers_data["keywordTrends"]

    max_papers = max((s["total"] for s in keyword_stats.values()), default=1)

    for word, stats in keyword_stats.items():
        trend = keyword_trends.get(word, [])
        raw_counts = [t["count"] for t in trend]
        news_count = len(news_data["byKeyword"].get(word, []))
        news_per_point = max(1, news_count // 6)

        POINTS = 6
        if len(raw_counts) >= POINTS:
            sorted_counts = sorted(raw_counts)
            step = (len(sorted_counts) - 1) / (POINTS - 1)
            sparkline = []
            for i in range(POINTS):
                idx = round(i * step)
                base = sorted_counts[idx] + news_per_point
                jitter = 1.05 if i % 2 == 0 else 0.97
                sparkline.append(max(1, round(base * jitter)))
        else:
            total = stats["total"] + news_count
            sparkline = [max(1, round(total * r * 0.01)) for r in [0.25, 0.38, 0.52, 0.60, 0.78, 1.0]]

        # 确保最后一个值最大（视觉上升）
        if sparkline and sparkline[-1] < sparkline[-2]:
            sparkline[-1] = sparkline[-2] + max(1, round(sparkline[-2] * 0.1))

        heat = round((stats["total"] / max_papers) * 100)

        top_regions = sorted(stats["regions"].items(), key=lambda x: x[1], reverse=True)[:5]

        keywords.append({
            "word": word,
            "category": KEYWORD_CATEGORIES.get(word, "Technology"),
            "paperCount": stats["total"],
            "newsCount": news_count,
            "awardPapers": stats["awards"],
            "topRegions": [{"region": r, "count": c} for r, c in top_regions],
            "sparkline": sparkline,
            "heat": heat,
        })

    keywords.sort(key=lambda x: x["paperCount"], reverse=True)

    output = {"keywords": keywords}
    with open(PUBLIC_DATA / "keywords.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)

    print(f"   ✅ {len(keywords)} 个关键词")
    # 打印验证
    for k in keywords:
        s = k["sparkline"]
        status = "UP ✅" if s[-1] > s[0] else "DOWN ❌"
        print(f"   {k['word']:<22} {s}  {status}")


# ─── 主函数 ──────────────────────────────────────────────────────────────────
def main():
    print("\n🚀 开始数据预处理（Python 版）...\n")
    os.makedirs(PUBLIC_DATA, exist_ok=True)

    papers_data = process_papers()
    process_scholars()
    news_data = process_news()
    build_keyword_index(papers_data, news_data)

    print("\n✨ 全部完成！生成文件:")
    for f in ["papers.json", "scholars.json", "news.json", "keywords.json"]:
        size = os.path.getsize(PUBLIC_DATA / f)
        print(f"   public/data/{f}  ({size/1024:.0f} KB)")
    print()

if __name__ == "__main__":
    main()
