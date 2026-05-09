import { NextRequest, NextResponse } from "next/server";
import { buildSearchUrl, parseFacetField } from "@/lib/solr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") || "*:*";
  const category = searchParams.getAll("category");
  const brand = searchParams.getAll("brand");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") || "";
  const sort = searchParams.get("sort") || "score desc";
  const page = searchParams.get("page") || "1";
  const rows = 12;

  const solrUrl = buildSearchUrl({
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sort,
    page,
    rows,
  });

  try {
    const res = await fetch(solrUrl, { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Solr request failed", details: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    const docs = data.response?.docs || [];
    const numFound = data.response?.numFound || 0;
    const highlighting = data.highlighting || {};
    const facetFields = data.facet_counts?.facet_fields || {};

    return NextResponse.json({
      results: docs,
      totalResults: numFound,
      page: parseInt(page),
      totalPages: Math.ceil(numFound / rows),
      highlighting,
      facets: {
        category: parseFacetField(facetFields, "category"),
        brand: parseFacetField(facetFields, "brand"),
      },
    });
  } catch (error) {
    console.error("Solr connection error:", error);
    return NextResponse.json(
      {
        error: "Cannot connect to Solr. Make sure Solr is running on port 8983.",
        results: [],
        totalResults: 0,
        page: 1,
        totalPages: 0,
        highlighting: {},
        facets: { category: [], brand: [] },
      },
      { status: 503 }
    );
  }
}
