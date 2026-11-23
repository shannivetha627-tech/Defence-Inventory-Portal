import React, { useState } from "react";
import { getProductImage, DEFAULT_PRODUCT_IMAGE } from "../data/productImages";
import { StatusBadge } from "./StatusBadge";
import { EyeIcon, EditIcon, PackageIcon } from "./Icons";

export const ProductCard = ({
  item,
  availableQty = null,
  onViewDetails,
  onEdit,
  userRole
}) => {
  const [imgSrc, setImgSrc] = useState(getProductImage(item));

  // Determine stock health
  const isLowStock =
    availableQty !== null &&
    Number(availableQty) <= Number(item.reorder_level);
  const isOutOfStock = availableQty !== null && Number(availableQty) === 0;

  return (
    <div className="product-card">
      <div className="product-card-media">
        <img
          src={imgSrc}
          alt={item.name}
          className="product-image"
          loading="lazy"
          onError={() => setImgSrc(DEFAULT_PRODUCT_IMAGE)}
        />
        <div className="product-media-overlay">
          <span className="product-category-chip">{item.category}</span>
          <span className="product-code-pill">{item.code}</span>
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-header">
          <h4 className="product-name" title={item.name}>
            {item.name}
          </h4>
          <StatusBadge status={item.active ? "ACTIVE" : "INACTIVE"} />
        </div>

        <div className="product-specs-grid">
          <div className="product-spec">
            <span className="spec-label">Unit</span>
            <span className="spec-value">{item.unit}</span>
          </div>
          <div className="product-spec">
            <span className="spec-label">Reorder Level</span>
            <span className="spec-value">{item.reorder_level}</span>
          </div>
          {availableQty !== null && (
            <div className="product-spec">
              <span className="spec-label">Available</span>
              <span
                className={`spec-value font-semibold ${
                  isOutOfStock
                    ? "text-danger"
                    : isLowStock
                    ? "text-warning"
                    : "text-success"
                }`}
              >
                {availableQty} {item.unit}
              </span>
            </div>
          )}
        </div>

        <div className="product-card-actions">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => onViewDetails && onViewDetails(item)}
            title="View full item details"
          >
            <EyeIcon size={14} />
            <span>Details</span>
          </button>

          {userRole !== "REQUESTER" && (
            <button
              type="button"
              className="btn-primary-outline btn-sm"
              onClick={() => onEdit && onEdit(item)}
              title="Edit item catalogue details"
            >
              <EditIcon size={14} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
