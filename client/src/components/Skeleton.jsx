import React from "react";

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-line skeleton-title" />
    <div className="skeleton-line skeleton-value" />
    <div className="skeleton-line skeleton-subtitle" />
  </div>
);

export const SkeletonProductCard = () => (
  <div className="skeleton-product-card">
    <div className="skeleton-media" />
    <div className="skeleton-body">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-pill" />
      <div className="skeleton-grid-2">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    </div>
  </div>
);

export const SkeletonTableRows = ({ rows = 4, cols = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, rIdx) => (
      <tr key={rIdx} className="skeleton-row">
        {Array.from({ length: cols }).map((_, cIdx) => (
          <td key={cIdx}>
            <div className="skeleton-cell" />
          </td>
        ))}
      </tr>
    ))}
  </>
);
