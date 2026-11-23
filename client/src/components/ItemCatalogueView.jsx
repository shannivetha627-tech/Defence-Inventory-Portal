import React, { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import { SkeletonProductCard, SkeletonTableRows } from "./Skeleton";
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  GridIcon,
  ListIcon,
  EyeIcon,
  EditIcon,
  PackageIcon,
  XIcon
} from "./Icons";

export const ItemCatalogueView = ({
  items = [],
  stock = [],
  loading = false,
  search = "",
  onSearch,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailsModal,
  userRole
}) => {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedStockLevel, setSelectedStockLevel] = useState("ALL");

  // Build a lookup map of total available stock per item code or item id
  const stockMap = useMemo(() => {
    const map = {};
    if (Array.isArray(stock)) {
      stock.forEach((row) => {
        const idKey = String(row.item_id);
        const codeKey = row.item_code;
        const qty = Number(row.quantity) || 0;

        if (idKey) {
          map[idKey] = (map[idKey] || 0) + qty;
        }
        if (codeKey) {
          map[codeKey] = (map[codeKey] || 0) + qty;
        }
      });
    }
    return map;
  }, [stock]);

  // Extract unique categories from items
  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [items]);

  // Client-side filtering on top of backend search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus === "ACTIVE" && !item.active) return false;
      if (selectedStatus === "INACTIVE" && item.active) return false;

      // Stock level filter
      const available = stockMap[String(item.id)] ?? stockMap[item.code] ?? 0;
      if (selectedStockLevel === "LOW" && available > Number(item.reorder_level)) {
        return false;
      }
      if (selectedStockLevel === "IN_STOCK" && available <= 0) {
        return false;
      }

      return true;
    });
  }, [items, selectedCategory, selectedStatus, selectedStockLevel, stockMap]);

  const hasActiveFilters =
    selectedCategory !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedStockLevel !== "ALL" ||
    search.trim() !== "";

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSelectedStockLevel("ALL");
    if (onSearch) {
      onSearch({ target: { value: "" } });
    }
  };

  return (
    <div className="catalogue-view-flow animate-fadeIn">
      {/* PAGE TITLE BAR */}
      <div className="view-header">
        <div>
          <h2 className="view-title">Item Catalogue</h2>
          <p className="view-subtitle">
            Browse and manage all registered inventory support items
          </p>
        </div>

        {userRole !== "REQUESTER" && (
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAddModal}
          >
            <PlusIcon size={16} />
            <span>+ Add Item</span>
          </button>
        )}
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="filter-controls-card">
        <div className="search-bar-wrap">
          <SearchIcon size={18} className="search-input-icon" />
          <input
            type="text"
            className="catalogue-search-input"
            placeholder="Search products by code, name or category..."
            value={search}
            onChange={onSearch}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearch({ target: { value: "" } })}
              aria-label="Clear search"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        <div className="filters-group">
          {/* CATEGORY SELECTOR */}
          <div className="filter-select-wrap">
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* STOCK LEVEL FILTER */}
          <div className="filter-select-wrap">
            <select
              className="filter-select"
              value={selectedStockLevel}
              onChange={(e) => setSelectedStockLevel(e.target.value)}
              aria-label="Filter by stock level"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW">Low Stock</option>
            </select>
          </div>

          {/* STATUS FILTER */}
          <div className="filter-select-wrap">
            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* VIEW TOGGLE (GRID vs TABLE) */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
              aria-label="Switch to grid view"
            >
              <GridIcon size={17} />
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
              aria-label="Switch to table view"
            >
              <ListIcon size={17} />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn-filter-reset"
              onClick={handleResetFilters}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* CATALOGUE CONTENT */}
      {loading ? (
        viewMode === "grid" ? (
          <div className="product-grid-layout">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        ) : (
          <div className="table-responsive panel-card">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <SkeletonTableRows rows={6} cols={7} />
              </tbody>
            </table>
          </div>
        )
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<PackageIcon size={36} />}
          title="No products match your criteria"
          description="Try broadening your search term or resetting your category/status filters."
          actionText={hasActiveFilters ? "Reset All Filters" : undefined}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
        />
      ) : viewMode === "grid" ? (
        <div className="product-grid-layout">
          {filteredItems.map((item) => {
            const availQty =
              stockMap[String(item.id)] ?? stockMap[item.code] ?? null;
            return (
              <ProductCard
                key={item.id}
                item={item}
                availableQty={availQty}
                onViewDetails={onOpenDetailsModal}
                onEdit={onOpenEditModal}
                userRole={userRole}
              />
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="panel-card table-responsive">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Reorder Level</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const availQty =
                  stockMap[String(item.id)] ?? stockMap[item.code] ?? 0;
                const isLow = availQty <= Number(item.reorder_level);
                return (
                  <tr key={item.id}>
                    <td className="font-mono font-medium">{item.code}</td>
                    <td className="font-medium">{item.name}</td>
                    <td>
                      <span className="category-tag">{item.category}</span>
                    </td>
                    <td>{item.unit}</td>
                    <td>{item.reorder_level}</td>
                    <td>
                      <span
                        className={`font-semibold ${isLow ? "text-warning" : "text-success"
                          }`}
                      >
                        {availQty} {item.unit}
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        status={item.active ? "ACTIVE" : "INACTIVE"}
                      />
                    </td>
                    <td>
                      <div className="table-btn-group">
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onOpenDetailsModal(item)}
                          title="View Details"
                        >
                          <EyeIcon size={14} />
                          <span>View</span>
                        </button>
                        {userRole !== "REQUESTER" && (
                          <button
                            type="button"
                            className="btn-table-action action-edit"
                            onClick={() => onOpenEditModal(item)}
                            title="Edit Item"
                          >
                            <EditIcon size={14} />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
