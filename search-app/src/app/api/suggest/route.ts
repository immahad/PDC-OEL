import { NextRequest, NextResponse } from "next/server";
import { buildSuggestUrl } from "@/lib/solr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const solrUrl = buildSuggestUrl(q);

  try {
    const res = await fetch(solrUrl, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const suggestData = data.suggest?.mySuggester?.[q];
      const suggestions: string[] = [];

      if (suggestData?.suggestions && suggestData.suggestions.length > 0) {
        for (const s of suggestData.suggestions) {
          suggestions.push(s.term);
        }
        return NextResponse.json({ suggestions });
      }
    }

    // Fallback to basic search if suggest component isn't returning data
    const SOLR_BASE = process.env.SOLR_URL || "http://localhost:8983/solr";
    const COLLECTION = process.env.SOLR_COLLECTION || "products";
    const fallbackUrl = `${SOLR_BASE}/${COLLECTION}/select?defType=edismax&qf=name&q=${encodeURIComponent(q)}*&wt=json&rows=8&fl=name`;
    
    const fallbackRes = await fetch(fallbackUrl, { cache: "no-store" });
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      const names = (data.response?.docs || []).map(
        (d: { name: string | string[] }) => Array.isArray(d.name) ? d.name[0] : d.name
      );
      // Remove duplicates
      const uniqueNames = Array.from(new Set(names));
      return NextResponse.json({ suggestions: uniqueNames });
    }
    
    return NextResponse.json({ suggestions: [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
