"use client";

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { label: "Relevance", value: "score desc" },
  { label: "Price: Low → High", value: "price asc" },
  { label: "Price: High → Low", value: "price desc" },
  { label: "Rating: Best First", value: "rating desc" },
  { label: "Newest", value: "date_added desc" },
  { label: "Name: A → Z", value: "name_sort asc" },
];

export default function SortDropdown({
  currentSort,
  onSortChange,
}: SortDropdownProps) {
  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select" className="sort-label">
        Sort by:
      </label>
      <select
        id="sort-select"
        className="sort-select"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
