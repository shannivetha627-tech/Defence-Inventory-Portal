import React, { useEffect } from "react";
import { XIcon, PackageIcon } from "./Icons";

export const ItemModal = ({
  isOpen,
  isEdit = false,
  formData,
  setFormData,
  errorMessage,
  onSave,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <PackageIcon size={20} />
            </div>
            <div>
              <h3 id="modal-title" className="modal-title">
                {isEdit ? "Edit Catalogue Item" : "Add New Item"}
              </h3>
              <p className="modal-subtitle">
                {isEdit
                  ? "Update specifications and reorder threshold"
                  : "Register a new support item into catalogue"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-danger">
            <span className="alert-dot" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="modal-form"
        >
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="item-code">
                Item Code <span className="text-danger">*</span>
              </label>
              <input
                id="item-code"
                type="text"
                className="form-input"
                placeholder="e.g. ITM026"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="item-name">
                Item Name <span className="text-danger">*</span>
              </label>
              <input
                id="item-name"
                type="text"
                className="form-input"
                placeholder="e.g. Tactical Flashlight"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="item-category">
                Category <span className="text-danger">*</span>
              </label>
              <input
                id="item-category"
                type="text"
                className="form-input"
                placeholder="e.g. Field Equipment"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="item-unit">
                Unit of Measure <span className="text-danger">*</span>
              </label>
              <input
                id="item-unit"
                type="text"
                className="form-input"
                placeholder="e.g. pcs, sets, kits, pairs"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </div>

            <div className="form-group full-col">
              <label className="form-label" htmlFor="item-reorder">
                Reorder Level (Minimum Safe Threshold){" "}
                <span className="text-danger">*</span>
              </label>
              <input
                id="item-reorder"
                type="number"
                min="0"
                className="form-input"
                placeholder="e.g. 5"
                value={formData.reorder_level}
                onChange={(e) =>
                  setFormData({ ...formData, reorder_level: e.target.value })
                }
              />
              <span className="form-hint">
                Triggers low stock alert when balance across stores drops at or below this level.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEdit ? "Update Item" : "Save Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
