import React, { useState } from "react";
import { XIcon, PackageIcon, BoxesIcon, EditIcon } from "./Icons";
import { getProductImage, DEFAULT_PRODUCT_IMAGE } from "../data/productImages";
import { StatusBadge } from "./StatusBadge";

export const ItemDetailsModal = ({
  item,
  stockRecords = [],
  isOpen,
  onClose,
  onEdit,
  userRole
}) => {
  if (!isOpen || !item) return null;

  const [imgSrc, setImgSrc] = useState(getProductImage(item));

  // Find stores holding this item
  const itemStock = stockRecords.filter(
    (s) => Number(s.item_id) === Number(item.id) || s.item_code === item.code
  );

  const totalQty = itemStock.reduce(
    (sum, s) => sum + (Number(s.quantity) || 0),
    0
  );

  const isLowStock = totalQty <= Number(item.reorder_level);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="product-code-pill">{item.code}</span>
            <h3 className="modal-title">{item.name}</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="details-modal-grid">
          <div className="details-media-col">
            <img
              src={imgSrc}
              alt={item.name}
              className="details-product-img"
              onError={() => setImgSrc(DEFAULT_PRODUCT_IMAGE)}
            />
            <div className="details-status-row">
              <StatusBadge status={item.active ? "ACTIVE" : "INACTIVE"} />
              <span
                className={`stock-pill ${
                  isLowStock ? "pill-warning" : "pill-success"
                }`}
              >
                {totalQty} {item.unit} available
              </span>
            </div>
          </div>

          <div className="details-info-col">
            <div className="details-spec-list">
              <div className="details-spec-row">
                <span className="details-spec-label">Item Code</span>
                <span className="details-spec-val font-mono">{item.code}</span>
              </div>
              <div className="details-spec-row">
                <span className="details-spec-label">Category</span>
                <span className="details-spec-val">{item.category}</span>
              </div>
              <div className="details-spec-row">
                <span className="details-spec-label">Standard Unit</span>
                <span className="details-spec-val">{item.unit}</span>
              </div>
              <div className="details-spec-row">
                <span className="details-spec-label">Reorder Threshold</span>
                <span className="details-spec-val">
                  {item.reorder_level} {item.unit}
                </span>
              </div>
            </div>

            <div className="details-stock-section">
              <div className="details-section-title">
                <BoxesIcon size={16} />
                <span>Store Balance Breakdown</span>
              </div>

              {itemStock.length === 0 ? (
                <div className="details-empty-stock">
                  <span>No recorded stock in any warehouse yet.</span>
                </div>
              ) : (
                <div className="details-store-table-wrap">
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Store Location</th>
                        <th>Available Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemStock.map((s, idx) => {
                        const qty = Number(s.quantity) || 0;
                        const low = qty <= Number(item.reorder_level);
                        return (
                          <tr key={idx}>
                            <td>{s.store || s.store_name || "Central Store"}</td>
                            <td className="font-semibold">
                              {qty} {item.unit}
                            </td>
                            <td>
                              <span
                                className={`status-pill ${
                                  qty === 0
                                    ? "status-crit"
                                    : low
                                    ? "status-warn"
                                    : "status-ok"
                                }`}
                              >
                                {qty === 0
                                  ? "Depleted"
                                  : low
                                  ? "Low Stock"
                                  : "Healthy"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {userRole !== "REQUESTER" && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
            >
              <EditIcon size={15} />
              <span>Edit Item</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
