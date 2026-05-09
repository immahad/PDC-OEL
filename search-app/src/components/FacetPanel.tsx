"use client";

import { FacetCount } from "@/types";

interface FacetPanelProps {
  categoryFacets: FacetCount[];
  brandFacets: FacetCount[];
  selectedCategories: string[];
  selectedBrands: string[];
  inStock: boolean;
  minPrice: string;
  maxPrice: string;
  onToggleCategory: (cat: string) => void;
  onToggleBrand: (brand: string) => void;
  onToggleInStock: () => void;
  onPriceChange: (min: string, max: string) => void;
  onClearAll: () => void;
}

export default function FacetPanel({
  categoryFacets,
  brandFacets,
  selectedCategories,
  selectedBrands,
  inStock,
  minPrice,
  maxPrice,
  onToggleCategory,
  onToggleBrand,
  onToggleInStock,
  onPriceChange,
  onClearAll,
}: FacetPanelProps) {
  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    inStock ||
    minPrice ||
    maxPrice;

  return (
    <aside className="facet-panel">
      <div className="facet-header">
        <h2>Filters</h2>
        {hasFilters && (
          <button className="clear-filters-btn" onClick={onClearAll}>
            Clear All
          </button>
        )}
      </div>

      {/* Category Facets */}
      <div className="facet-section">
        <h3 className="facet-title">Category</h3>
        <div className="facet-list">
          {categoryFacets.map((f) => (
            <label key={f.value} className="facet-item">
              <input
                type="checkbox"
                checked={selectedCategories.includes(f.value)}
                onChange={() => onToggleCategory(f.value)}
              />
              <span className="facet-label">{f.value}</span>
              <span className="facet-count">{f.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Facets */}
      <div className="facet-section">
        <h3 className="facet-title">Brand</h3>
        <div className="facet-list">
          {brandFacets.map((f) => (
            <label key={f.value} className="facet-item">
              <input
                type="checkbox"
                checked={selectedBrands.includes(f.value)}
                onChange={() => onToggleBrand(f.value)}
              />
              <span className="facet-label">{f.value}</span>
              <span className="facet-count">{f.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="facet-section">
        <h3 className="facet-title">Price Range</h3>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="price-input"
            min="0"
          />
          <span className="price-dash">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="price-input"
            min="0"
          />
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="facet-section">
        <label className="facet-item stock-toggle">
          <input
            type="checkbox"
            checked={inStock}
            onChange={onToggleInStock}
          />
          <span className="facet-label">In Stock Only</span>
        </label>
      </div>
    </aside>
  );
}
