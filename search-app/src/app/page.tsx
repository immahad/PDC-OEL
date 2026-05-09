"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import FacetPanel from "@/components/FacetPanel";
import Pagination from "@/components/Pagination";
import SortDropdown from "@/components/SortDropdown";
import type { SearchResponse, FacetCount } from "@/types";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "score desc";
  const page = parseInt(searchParams.get("page") || "1");
  const categories = searchParams.getAll("category");
  const brands = searchParams.getAll("brand");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const buildUrl = useCallback(
    (overrides: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams();
      const vals = {
        q: overrides.q !== undefined ? overrides.q : q,
        sort: overrides.sort !== undefined ? overrides.sort : sort,
        page: overrides.page !== undefined ? overrides.page : String(page),
        category:
          overrides.category !== undefined
            ? overrides.category
            : categories,
        brand:
          overrides.brand !== undefined ? overrides.brand : brands,
        minPrice:
          overrides.minPrice !== undefined ? overrides.minPrice : minPrice,
        maxPrice:
          overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice,
        inStock:
          overrides.inStock !== undefined
            ? overrides.inStock
            : inStock
              ? "true"
              : "",
      };

      if (vals.q) params.set("q", vals.q as string);
      if (vals.sort && vals.sort !== "score desc")
        params.set("sort", vals.sort as string);
      if (vals.page && vals.page !== "1")
        params.set("page", vals.page as string);
      if (vals.minPrice) params.set("minPrice", vals.minPrice as string);
      if (vals.maxPrice) params.set("maxPrice", vals.maxPrice as string);
      if (vals.inStock === "true") params.set("inStock", "true");

      const catArr = Array.isArray(vals.category)
        ? vals.category
        : vals.category
          ? [vals.category as string]
          : [];
      catArr.forEach((c) => params.append("category", c));

      const brandArr = Array.isArray(vals.brand)
        ? vals.brand
        : vals.brand
          ? [vals.brand as string]
          : [];
      brandArr.forEach((b) => params.append("brand", b));

      return `/?${params.toString()}`;
    },
    [q, sort, page, categories, brands, minPrice, maxPrice, inStock]
  );

  const searchParamsString = searchParams.toString();

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/search?${searchParamsString}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Search failed");
        setData(json);
      } else {
        setData(json);
      }
    } catch {
      setError("Failed to connect to search service");
    } finally {
      setLoading(false);
    }
  }, [searchParamsString]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearch = (newQuery: string) => {
    router.push(buildUrl({ q: newQuery, page: "1" }));
  };

  const handleSortChange = (newSort: string) => {
    router.push(buildUrl({ sort: newSort, page: "1" }));
  };

  const handlePageChange = (newPage: number) => {
    router.push(buildUrl({ page: String(newPage) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCategory = (cat: string) => {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    router.push(buildUrl({ category: next, page: "1" }));
  };

  const toggleBrand = (brand: string) => {
    const next = brands.includes(brand)
      ? brands.filter((b) => b !== brand)
      : [...brands, brand];
    router.push(buildUrl({ brand: next, page: "1" }));
  };

  const toggleInStock = () => {
    router.push(buildUrl({ inStock: inStock ? "" : "true", page: "1" }));
  };

  const handlePriceChange = (min: string, max: string) => {
    router.push(buildUrl({ minPrice: min, maxPrice: max, page: "1" }));
  };

  const clearAll = () => {
    router.push(buildUrl({
      category: [],
      brand: [],
      minPrice: "",
      maxPrice: "",
      inStock: "",
      page: "1",
    }));
  };

  const categoryFacets: FacetCount[] = data?.facets?.category || [];
  const brandFacets: FacetCount[] = data?.facets?.brand || [];
  const totalResults = data?.totalResults || 0;
  const results = data?.results || [];
  const highlighting = data?.highlighting || {};
  const totalPages = data?.totalPages || 0;

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">◎</span>
            <h1>SolrSearch</h1>
            <span className="logo-badge">Powered by Apache Solr</span>
          </div>
          <SearchBar initialQuery={q} onSearch={handleSearch} />
        </div>
      </header>

      <main className="main-layout">
        <button
          className="mobile-filter-toggle"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          ☰ Filters
          {(categories.length > 0 || brands.length > 0 || inStock) && (
            <span className="filter-badge">
              {categories.length + brands.length + (inStock ? 1 : 0)}
            </span>
          )}
        </button>

        <div className={`facet-sidebar ${mobileFiltersOpen ? "open" : ""}`}>
          <FacetPanel
            categoryFacets={categoryFacets}
            brandFacets={brandFacets}
            selectedCategories={categories}
            selectedBrands={brands}
            inStock={inStock}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onToggleCategory={toggleCategory}
            onToggleBrand={toggleBrand}
            onToggleInStock={toggleInStock}
            onPriceChange={handlePriceChange}
            onClearAll={clearAll}
          />
        </div>

        <div className="results-area">
          <div className="results-header">
            <p className="results-count">
              {loading ? (
                "Searching..."
              ) : error ? (
                <span className="error-text">⚠ {error}</span>
              ) : (
                <>
                  Found <strong>{totalResults}</strong> result
                  {totalResults !== 1 ? "s" : ""}
                  {q && (
                    <>
                      {" "}for <strong>&ldquo;{q}&rdquo;</strong>
                    </>
                  )}
                </>
              )}
            </p>
            <SortDropdown currentSort={sort} onSortChange={handleSortChange} />
          </div>

          {loading ? (
            <div className="results-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line medium" />
                </div>
              ))}
            </div>
          ) : results.length === 0 && !error ? (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h2>No results found</h2>
              <p>Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="results-grid">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  highlighting={highlighting[product.id]}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="loading-screen">
          <span className="logo-icon spin">◎</span>
          <p>Loading SolrSearch...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
