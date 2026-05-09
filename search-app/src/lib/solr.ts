const SOLR_BASE = process.env.SOLR_URL || "http://localhost:8983/solr";
const COLLECTION = process.env.SOLR_COLLECTION || "products";

export function buildSearchUrl(params: {
  q?: string;
  category?: string[];
  brand?: string[];
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: string;
  rows?: number;
}): string {
  const {
    q = "*:*",
    category = [],
    brand = [],
    minPrice,
    maxPrice,
    inStock,
    sort = "score desc",
    page = "1",
    rows = 12,
  } = params;

  const start = (parseInt(page) - 1) * rows;
  const url = new URL(`${SOLR_BASE}/${COLLECTION}/select`);

  if (q && q !== "*:*") {
    url.searchParams.set("defType", "edismax");
    url.searchParams.set("qf", "name^3 description tags^2 brand category");
    // Add wildcard to single-word queries to mimic "starts with" for better UX
    const searchQuery = q.includes(" ") ? q : `${q}*`;
    url.searchParams.set("q", searchQuery);
  } else {
    url.searchParams.set("q", "*:*");
  }

  url.searchParams.set("wt", "json");
  url.searchParams.set("start", String(start));
  url.searchParams.set("rows", String(rows));
  url.searchParams.set("sort", sort);

  // Highlighting
  url.searchParams.set("hl", "true");
  url.searchParams.set("hl.fl", "name,description");
  url.searchParams.set("hl.simple.pre", "<mark>");
  url.searchParams.set("hl.simple.post", "</mark>");
  url.searchParams.set("hl.fragsize", "200");

  // Facets
  url.searchParams.set("facet", "true");
  url.searchParams.append("facet.field", "category");
  url.searchParams.append("facet.field", "brand");
  url.searchParams.set("facet.mincount", "1");

  // Filter queries
  if (category.length > 0) {
    const fq = category.map((c) => `"${c}"`).join(" OR ");
    url.searchParams.append("fq", `category:(${fq})`);
  }
  if (brand.length > 0) {
    const fq = brand.map((b) => `"${b}"`).join(" OR ");
    url.searchParams.append("fq", `brand:(${fq})`);
  }
  if (minPrice || maxPrice) {
    const min = minPrice || "*";
    const max = maxPrice || "*";
    url.searchParams.append("fq", `price:[${min} TO ${max}]`);
  }
  if (inStock === "true") {
    url.searchParams.append("fq", "in_stock:true");
  }

  return url.toString();
}

export function buildSuggestUrl(prefix: string): string {
  const url = new URL(`${SOLR_BASE}/${COLLECTION}/suggest`);
  url.searchParams.set("suggest", "true");
  url.searchParams.set("suggest.dictionary", "mySuggester");
  url.searchParams.set("suggest.q", prefix);
  url.searchParams.set("suggest.count", "8");
  url.searchParams.set("wt", "json");
  return url.toString();
}

export function parseFacetField(
  facetFields: Record<string, (string | number)[]> | undefined,
  field: string
): { value: string; count: number }[] {
  if (!facetFields || !facetFields[field]) return [];
  const arr = facetFields[field];
  const result: { value: string; count: number }[] = [];
  for (let i = 0; i < arr.length; i += 2) {
    result.push({ value: arr[i] as string, count: arr[i + 1] as number });
  }
  return result;
}
