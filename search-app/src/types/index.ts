export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  in_stock: boolean;
  tags: string[];
  date_added: string;
}

export interface SolrHighlighting {
  [docId: string]: {
    name?: string[];
    description?: string[];
  };
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface SearchFilters {
  q: string;
  category: string[];
  brand: string[];
  minPrice: string;
  maxPrice: string;
  inStock: string;
  sort: string;
  page: string;
}

export interface SearchResponse {
  results: Product[];
  totalResults: number;
  page: number;
  totalPages: number;
  highlighting: SolrHighlighting;
  facets: {
    category: FacetCount[];
    brand: FacetCount[];
  };
}

export interface SuggestResponse {
  suggestions: string[];
}
