"use client";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    brand: string;
    price: number;
    rating: number;
    in_stock: boolean;
    tags: string[];
  };
  highlighting?: {
    name?: string[];
    description?: string[];
  };
}

const categoryIcons: Record<string, string> = {
  Electronics: "⚡",
  Clothing: "👕",
  "Home & Kitchen": "🏠",
  Sports: "🏅",
  Books: "📚",
  Beauty: "✨",
};

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < full; i++) stars.push("★");
  if (half) stars.push("½");
  while (stars.length < 5) stars.push("☆");
  return stars.join("");
}

export default function ProductCard({
  product,
  highlighting,
}: ProductCardProps) {
  const nameHtml =
    highlighting?.name?.[0] || product.name;
  const descHtml =
    highlighting?.description?.[0] ||
    (product.description?.length > 150
      ? product.description.slice(0, 150) + "..."
      : product.description);
  const icon = categoryIcons[product.category] || "📦";

  return (
    <div className="product-card">
      <div className="product-card-header">
        <span className="category-badge">
          {icon} {product.category}
        </span>
        <span
          className={`stock-badge ${product.in_stock ? "in-stock" : "out-of-stock"}`}
        >
          {product.in_stock ? "In Stock" : "Out of Stock"}
        </span>
      </div>
      <h3
        className="product-name"
        dangerouslySetInnerHTML={{ __html: nameHtml }}
      />
      <p className="product-brand">{product.brand}</p>
      <p
        className="product-description"
        dangerouslySetInnerHTML={{ __html: descHtml }}
      />
      <div className="product-footer">
        <span className="product-price">${product.price?.toFixed(2)}</span>
        <span className="product-rating" title={`${product.rating} / 5`}>
          <span className="stars">{renderStars(product.rating)}</span>
          <span className="rating-num">{product.rating}</span>
        </span>
      </div>
      {product.tags && product.tags.length > 0 && (
        <div className="product-tags">
          {(Array.isArray(product.tags)
            ? product.tags.slice(0, 4)
            : String(product.tags).split(",").slice(0, 4)
          ).map((tag, i) => (
            <span key={i} className="tag">
              {String(tag).trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
