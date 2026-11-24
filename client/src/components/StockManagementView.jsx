import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import { SkeletonTableRows } from "./Skeleton";
import {
  BoxesIcon,
  PackageIcon,
  HistoryIcon,
  SearchIcon,
  PlusIcon,
  CheckCircleIcon
} from "./Icons";

export const StockManagementView = ({
  stock = [],
  movements = [],
  items = [],
  stockLoading = false,
  receiptStore = "1",
  setReceiptStore,
  receiptItem = "1",
  setReceiptItem,
  receiptQuantity = "",
  setReceiptQuantity,
  receiptMessage = "",
  receiptError = "",
  onReceiveStock,

  issueStore = "1",
  setIssueStore,
  issueRequestId = "",
  setIssueRequestId,
  issueMessage = "",
  issueError = "",
  onIssueStock,

  returnStore = "1",
  setReturnStore,
  returnRequestLineId = "",
  setReturnRequestLineId,
  returnQuantity = "",
  setReturnQuantity,
  returnCondition = "GOOD",
  setReturnCondition,
  returnConditionNote = "",
  setReturnConditionNote,
  returnMessage = "",
  returnError = "",
  onReturnStock,

  requests = [],

  defaultTab = "overview"
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [stockSearch, setStockSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("ALL");

  // Filter stock rows
  const filteredStock = stock.filter((row) => {
    if (storeFilter !== "ALL" && row.store !== storeFilter) {
      return false;
    }
    if (stockSearch.trim()) {
      const q = stockSearch.toLowerCase();
      const codeMatch = row.item_code?.toLowerCase().includes(q);
      const nameMatch = row.item_name?.toLowerCase().includes(q);
      const storeMatch = row.store?.toLowerCase().includes(q);
      if (!codeMatch && !nameMatch && !storeMatch) return false;
    }
    return true;
  });

  return (
    <div className="stock-view-flow animate-fadeIn">
      {/* HEADER */}
      <div className="view-header">
        <div>
          <h2 className="view-title">Stock Management & Ledger</h2>
          <p className="view-subtitle">
            Monitor real-time store balances, receive inbound shipments, and audit movement logs
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="stock-tabs-nav">
        <button
          type="button"
          className={`stock-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BoxesIcon size={17} />
          <span>Stock Overview</span>
          <span className="tab-count-pill">{stock.length}</span>
        </button>

        <button
          type="button"
          className={`stock-tab-btn ${activeTab === "receive" ? "active" : ""}`}
          onClick={() => setActiveTab("receive")}
        >
          <PackageIcon size={17} />
          <span>Receive Stock</span>
        </button>

        <button
          type="button"
          className={`stock-tab-btn ${activeTab === "movements" ? "active" : ""}`}
          onClick={() => setActiveTab("movements")}
        >
          <HistoryIcon size={17} />
          <span>Movement Ledger</span>
          <span className="tab-count-pill">{movements.length}</span>
        </button>

        <button
          type="button"
          className={`stock-tab-btn ${activeTab === "issue" ? "active" : ""}`}
          onClick={() => setActiveTab("issue")}
        >
          <CheckCircleIcon size={17} />
          <span>Issue Stock</span>
        </button>

        <button
          type="button"
          className={`stock-tab-btn ${activeTab === "return" ? "active" : ""}`}
          onClick={() => setActiveTab("return")}
        >
          <PackageIcon size={17} />
          <span>Return Stock</span>
        </button>
      </div>

      {/* TAB 1: STOCK OVERVIEW */}
      {activeTab === "overview" && (
        <div className="stock-tab-content animate-fadeIn">
          <div className="filter-controls-card">
            <div className="search-bar-wrap">
              <SearchIcon size={18} className="search-input-icon" />
              <input
                type="text"
                className="catalogue-search-input"
                placeholder="Search stock balances by code, item or store..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
              />
            </div>

            <div className="filters-group">
              <div className="filter-select-wrap">
                <select
                  className="filter-select"
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                >
                  <option value="ALL">All Store Locations</option>
                  <option value="Central Store">Central Store</option>
                  <option value="Workshop Store">Workshop Store</option>
                  <option value="Office Store">Office Store</option>
                </select>
              </div>
            </div>
          </div>

          <div className="panel-card table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Unit</th>
                  <th>Available Quantity</th>
                  <th>Stock Health</th>
                </tr>
              </thead>
              <tbody>
                {stockLoading && stock.length === 0 ? (
                  <SkeletonTableRows rows={6} cols={6} />
                ) : filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <EmptyState
                        icon={<BoxesIcon size={32} />}
                        title="No stock records found"
                        description="Try adjusting your store filter or search keyword."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((row) => {
                    const qty = Number(row.quantity) || 0;
                    let healthStatus = "HEALTHY";
                    if (qty === 0) healthStatus = "CRITICAL";
                    else if (qty <= 5) healthStatus = "LOW STOCK";

                    return (
                      <tr key={row.id}>
                        <td className="font-medium">{row.store}</td>
                        <td className="font-mono">{row.item_code}</td>
                        <td className="font-medium">{row.item_name}</td>
                        <td>{row.unit}</td>
                        <td>
                          <span
                            className={`font-semibold ${
                              qty === 0
                                ? "text-danger"
                                : qty <= 5
                                ? "text-warning"
                                : "text-success"
                            }`}
                          >
                            {qty} {row.unit}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={healthStatus} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RECEIVE STOCK FORM */}
      {activeTab === "receive" && (
        <div className="stock-tab-content animate-fadeIn">
          <div className="panel-card form-panel-card">
            <div className="form-panel-header">
              <div className="form-panel-icon">
                <PackageIcon size={22} />
              </div>
              <div>
                <h3>Receive Inbound Stock</h3>
                <p>Register received inventory shipments directly into target warehouse storage</p>
              </div>
            </div>

            {receiptError && (
              <div className="alert alert-danger">
                <span className="alert-dot" />
                <span>{receiptError}</span>
              </div>
            )}

            {receiptMessage && (
              <div className="alert alert-success">
                <CheckCircleIcon size={18} />
                <span>{receiptMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onReceiveStock();
              }}
              className="receive-stock-form"
            >
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="receipt-store">
                    Target Store Location
                  </label>
                  <select
                    id="receipt-store"
                    className="form-input form-select"
                    value={receiptStore}
                    onChange={(e) => setReceiptStore(e.target.value)}
                  >
                    <option value="1">Central Store</option>
                    <option value="2">Workshop Store</option>
                    <option value="3">Office Store</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="receipt-item">
                    Catalogue Item
                  </label>
                  <select
                    id="receipt-item"
                    className="form-input form-select"
                    value={receiptItem}
                    onChange={(e) => setReceiptItem(e.target.value)}
                  >
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} - {item.name} ({item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="receipt-qty">
                    Received Quantity
                  </label>
                  <input
                    id="receipt-qty"
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Enter quantity"
                    value={receiptQuantity}
                    onChange={(e) => setReceiptQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={stockLoading}
                >
                  <PlusIcon size={16} />
                  <span>
                    {stockLoading ? "Receiving..." : "Receive Stock"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: ISSUE APPROVED REQUEST */}
      {activeTab === "issue" && (
        <div className="stock-tab-content animate-fadeIn">
          <div className="panel-card form-panel-card">
            <div className="form-panel-header">
              <div className="form-panel-icon">
                <CheckCircleIcon size={22} />
              </div>
              <div>
                <h3>Issue Approved Request</h3>
                <p>
                  Issue approved inventory to the requester and update stock automatically
                </p>
              </div>
            </div>

            {issueError && (
              <div className="alert alert-danger">
                <span className="alert-dot" />
                <span>{issueError}</span>
              </div>
            )}

            {issueMessage && (
              <div className="alert alert-success">
                <CheckCircleIcon size={18} />
                <span>{issueMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onIssueStock();
              }}
              className="receive-stock-form"
            >
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="issue-store">
                    Issue From Store
                  </label>
                  <select
                    id="issue-store"
                    className="form-input form-select"
                    value={issueStore}
                    onChange={(e) => setIssueStore(e.target.value)}
                  >
                    <option value="1">Central Store</option>
                    <option value="2">Workshop Store</option>
                    <option value="3">Office Store</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="issue-request">
                    Approved Request
                  </label>
                  <select
                    id="issue-request"
                    className="form-input form-select"
                    value={issueRequestId}
                    onChange={(e) => setIssueRequestId(e.target.value)}
                  >
                    <option value="">Select approved request</option>

                    {requests
                      .filter((request) => request.status === "APPROVED")
                      .map((request) => (
                        <option key={request.line_id} value={request.id}>
                          #{request.id} - {request.item_code} -{" "}
                          {request.item_name} - Qty {request.requested_qty}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={stockLoading || !issueRequestId}
                >
                  <CheckCircleIcon size={16} />
                  <span>
                    {stockLoading ? "Issuing..." : "Issue Approved Request"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: RETURN ISSUED ITEM */}
      {activeTab === "return" && (
        <div className="stock-tab-content animate-fadeIn">
          <div className="panel-card form-panel-card">
            <div className="form-panel-header">
              <div className="form-panel-icon">
                <PackageIcon size={22} />
              </div>
              <div>
                <h3>Return Issued Item</h3>
                <p>
                  Record returned inventory and restore the quantity to the selected store
                </p>
              </div>
            </div>

            {returnError && (
              <div className="alert alert-danger">
                <span className="alert-dot" />
                <span>{returnError}</span>
              </div>
            )}

            {returnMessage && (
              <div className="alert alert-success">
                <CheckCircleIcon size={18} />
                <span>{returnMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onReturnStock();
              }}
              className="receive-stock-form"
            >
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="return-store">
                    Return To Store
                  </label>
                  <select
                    id="return-store"
                    className="form-input form-select"
                    value={returnStore}
                    onChange={(e) => setReturnStore(e.target.value)}
                  >
                    <option value="1">Central Store</option>
                    <option value="2">Workshop Store</option>
                    <option value="3">Office Store</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="return-line">
                    Issued Request Line
                  </label>
                  <select
                    id="return-line"
                    className="form-input form-select"
                    value={returnRequestLineId}
                    onChange={(e) => setReturnRequestLineId(e.target.value)}
                  >
                    <option value="">Select issued request line</option>

                    {requests
                      .filter(
                        (request) =>
                          request.status === "ISSUED" &&
                          Number(request.issued_qty) > 0
                      )
                      .map((request) => (
                        <option key={request.line_id} value={request.line_id}>
                          #{request.id} - {request.item_code} -{" "}
                          {request.item_name} - Issued {request.issued_qty}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="return-qty">
                    Return Quantity
                  </label>
                  <input
                    id="return-qty"
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Enter quantity"
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group return-condition-fields">
                <label className="form-label" htmlFor="return-condition">Return condition</label>
                <select id="return-condition" className="form-input form-select" value={returnCondition} onChange={(event) => setReturnCondition(event.target.value)}>
                  <option value="GOOD">Good — return to available stock</option>
                  <option value="DAMAGED">Damaged — quarantine and create maintenance ticket</option>
                  <option value="MAINTENANCE">Needs maintenance — quarantine and create ticket</option>
                </select>
                {returnCondition !== "GOOD" && <label className="form-group" htmlFor="return-condition-note">Condition / maintenance note<textarea id="return-condition-note" className="form-input" value={returnConditionNote} onChange={(event) => setReturnConditionNote(event.target.value)} maxLength={1000} required placeholder="Describe the issue" /></label>}
              </div>

              <div className="form-actions-row">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    stockLoading ||
                    !returnRequestLineId ||
                    !returnQuantity ||
                    (returnCondition !== "GOOD" && !returnConditionNote.trim())
                  }
                >
                  <PackageIcon size={16} />
                  <span>
                    {stockLoading ? "Returning..." : "Return Item"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: MOVEMENT LEDGER */}
      {activeTab === "movements" && (
        <div className="stock-tab-content animate-fadeIn">
          <div className="panel-card table-responsive">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <span className="panel-indicator indicator-primary" />
                <h3>Stock Movement Audit Ledger</h3>
              </div>
              <span className="badge-count-pill">{movements.length} Total</span>
            </div>

            <table className="portal-table">
              <thead>
                <tr>
                  <th>Movement ID</th>
                  <th>Store</th>
                  <th>Item</th>
                  <th>Movement Type</th>
                  <th>Quantity</th>
                  <th>Logged By</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <EmptyState
                        icon={<HistoryIcon size={32} />}
                        title="No stock movements found"
                        description="Warehouse transactions will automatically appear here once stock is processed."
                      />
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="font-mono font-medium">#{movement.id}</td>
                      <td className="font-medium">{movement.store}</td>
                      <td>
                        {movement.item_code} - {movement.item_name}
                      </td>
                      <td>
                        <StatusBadge status={movement.type} />
                      </td>
                      <td className="font-semibold">{movement.quantity}</td>
                      <td className="text-secondary">
                        {movement.actor || "System"}
                      </td>
                      <td className="text-secondary text-sm">
                        {movement.created_at
                          ? new Date(movement.created_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};



