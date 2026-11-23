import React from "react";
import { DashboardCard } from "./DashboardCard";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import {
  PackageIcon,
  AlertTriangleIcon,
  ClipboardListIcon,
  WrenchIcon,
  BoxesIcon,
  PlusIcon,
  ArrowRightIcon,
  HistoryIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon
} from "./Icons";

export const RoleDashboard = ({
  userRole,
  dashboard,
  items,
  stock,
  requests,
  movements,
  onNavigate,
  onSubmitRequest,
  onOpenDetails
}) => {
  switch (userRole) {
    case "REQUESTER":
      return (
        <RequesterDashboard
          dashboard={dashboard}
          requests={requests}
          items={items}
          onNavigate={onNavigate}
          onSubmitRequest={onSubmitRequest}
        />
      );

    case "SUPERVISOR":
      return (
        <SupervisorDashboard
          dashboard={dashboard}
          requests={requests}
          movements={movements}
          onNavigate={onNavigate}
        />
      );

    case "STOREKEEPER":
      return (
        <StorekeeperDashboard
          dashboard={dashboard}
          stock={stock}
          movements={movements}
          onNavigate={onNavigate}
        />
      );

    case "ADMIN":
    default:
      return (
        <AdminDashboard
          dashboard={dashboard}
          items={items}
          stock={stock}
          movements={movements}
          onNavigate={onNavigate}
          onOpenDetails={onOpenDetails}
        />
      );
  }
};

/* ========================================================
   1. ADMIN DASHBOARD
   ======================================================== */
const AdminDashboard = ({
  dashboard,
  items = [],
  stock = [],
  movements = [],
  onNavigate,
  onOpenDetails
}) => {
  const lowStockCount = dashboard.lowStock ? dashboard.lowStock.length : 0;
  const pendingRequests = Number(dashboard.pendingRequests) || 0;
  const overdueMaint = Number(dashboard.overdueMaintenance) || 0;
  const totalStockUnits = stock.reduce(
    (sum, s) => sum + (Number(s.quantity) || 0),
    0
  );
  const recentMovementCount = dashboard.recentMovements
    ? dashboard.recentMovements.length
    : movements.length;

  // Real store breakdown from stock
  const storeBreakdown = stock.reduce((acc, row) => {
    const sName = row.store || row.store_name || "Central Store";
    acc[sName] = (acc[sName] || 0) + (Number(row.quantity) || 0);
    return acc;
  }, {});

  return (
    <div className="dashboard-content-flow animate-fadeIn">
      {/* GREETING HERO BANNER */}
      <div className="dashboard-hero-banner">
        <div className="hero-text-wrap">
          <h2 className="hero-greeting">Welcome back, Admin User 👋</h2>
          <p className="hero-subtitle">
            Manage the inventory system, users and maintenance operations.
          </p>
        </div>
        <div className="hero-actions-wrap">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate("catalogue")}
          >
            <PackageIcon size={16} />
            <span>Catalogue</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate("stock")}
          >
            <BoxesIcon size={16} />
            <span>Stores & Stock</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="dashboard-grid-cards">
        <DashboardCard
          title="Total Items"
          value={items.length}
          subtitle="Active catalogue SKUs"
          icon={<PackageIcon size={22} />}
          color="blue"
          onClick={() => onNavigate("catalogue")}
        />
        <DashboardCard
          title="Total Stock"
          value={totalStockUnits}
          subtitle="Physical units across stores"
          icon={<BoxesIcon size={22} />}
          color="emerald"
          onClick={() => onNavigate("stock")}
        />
        <DashboardCard
          title="Pending Requests"
          value={pendingRequests}
          subtitle="Awaiting supervisor decision"
          icon={<ClipboardListIcon size={22} />}
          color="purple"
          onClick={() => onNavigate("requests")}
        />
        <DashboardCard
          title="Low Stock"
          value={lowStockCount}
          subtitle="Items below reorder level"
          icon={<AlertTriangleIcon size={22} />}
          color="amber"
          onClick={() => onNavigate("stock")}
        />
        <DashboardCard
          title="Maintenance Due"
          value={overdueMaint}
          subtitle="Equipment tickets overdue"
          icon={<WrenchIcon size={22} />}
          color="rose"
          onClick={() => onNavigate("maintenance")}
        />
        <DashboardCard
          title="Recent Activity"
          value={recentMovementCount}
          subtitle="Transactions in ledger"
          icon={<HistoryIcon size={22} />}
          color="blue"
          onClick={() => onNavigate("activity")}
        />
      </div>

      {/* REAL DATA VISUALIZATION: STORE DISTRIBUTION */}
      {Object.keys(storeBreakdown).length > 0 && (
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <span className="panel-indicator indicator-primary" />
              <h3>Warehouse Storage Distribution</h3>
            </div>
            <span className="badge-count-pill">
              {totalStockUnits} Total Units Stored
            </span>
          </div>
          <div className="panel-body">
            <div className="chart-bars-wrap">
              {Object.entries(storeBreakdown).map(([storeName, qty]) => {
                const percent =
                  totalStockUnits > 0
                    ? Math.round((qty / totalStockUnits) * 100)
                    : 0;
                return (
                  <div key={storeName} className="chart-bar-item">
                    <div className="chart-bar-header">
                      <span className="chart-store-name">{storeName}</span>
                      <span className="chart-store-stat">
                        {qty} units ({percent}%)
                      </span>
                    </div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TWO-COLUMN LAYOUT: LOW STOCK & RECENT MOVEMENTS */}
      <div className="dashboard-columns-2">
        {/* LOW STOCK ALERTS */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <span className="panel-indicator indicator-warning" />
              <h3>Low Stock Alerts</h3>
            </div>
            <button
              type="button"
              className="panel-link-btn"
              onClick={() => onNavigate("stock")}
            >
              <span>Manage Stock</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>

          <div className="panel-body">
            {lowStockCount === 0 ? (
              <EmptyState
                icon={<CheckCircleIcon size={32} className="text-success" />}
                title="Stock Levels Optimal"
                description="All items are operating comfortably above their reorder thresholds."
              />
            ) : (
              <div className="table-responsive">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Reorder Level</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.lowStock.slice(0, 5).map((item) => (
                      <tr key={`${item.store_id}-${item.item_id}`}>
                        <td className="font-medium">{item.store_name}</td>
                        <td>{item.item_name}</td>
                        <td>
                          <span className="stock-critical-pill">
                            {item.quantity} units
                          </span>
                        </td>
                        <td>{item.reorder_level} units</td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => onNavigate("stock")}
                          >
                            Receive
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RECENT STOCK MOVEMENTS */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <span className="panel-indicator indicator-primary" />
              <h3>Recent Stock Movements</h3>
            </div>
            <button
              type="button"
              className="panel-link-btn"
              onClick={() => onNavigate("activity")}
            >
              <span>Full Ledger</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>

          <div className="panel-body">
            {!dashboard.recentMovements ||
            dashboard.recentMovements.length === 0 ? (
              <EmptyState
                icon={<HistoryIcon size={32} />}
                title="No Movements Logged"
                description="Stock receipts and issues will automatically show here."
              />
            ) : (
              <div className="table-responsive">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Actor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentMovements.slice(0, 5).map((movement) => (
                      <tr key={movement.id}>
                        <td>{movement.store_name}</td>
                        <td className="font-medium">
                          {movement.item_code} - {movement.item_name}
                        </td>
                        <td>
                          <StatusBadge status={movement.type} />
                        </td>
                        <td className="font-semibold">{movement.quantity}</td>
                        <td className="text-secondary">
                          {movement.actor_name || "System"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAINTENANCE ALERTS SECTION */}
      {overdueMaint > 0 && (
        <div className="maintenance-alert-banner">
          <div className="maint-icon-wrap">
            <WrenchIcon size={24} />
          </div>
          <div className="maint-text">
            <h4>Maintenance Operational Notice</h4>
            <p>
              {overdueMaint} equipment {overdueMaint === 1 ? "unit has" : "units have"} passed their scheduled preventive maintenance date.
            </p>
          </div>
          <button
            type="button"
            className="btn-warning-outline"
            onClick={() => onNavigate("maintenance")}
          >
            Review Tickets
          </button>
        </div>
      )}
    </div>
  );
};

/* ========================================================
   2. REQUESTER DASHBOARD
   ======================================================== */
const RequesterDashboard = ({
  dashboard,
  requests = [],
  items = [],
  onNavigate,
  onSubmitRequest
}) => {
  const myRequests = requests || [];
  const awaitingApproval = myRequests.filter((r) => r.status === "SUBMITTED").length;
  const approvedRequests = myRequests.filter((r) => r.status === "APPROVED").length;
  const completedOrDraft = myRequests.filter(
    (r) => r.status === "DRAFT" || r.status === "CLOSED" || r.status === "ISSUED"
  ).length;

  return (
    <div className="dashboard-content-flow animate-fadeIn">
      {/* HERO GREETING */}
      <div className="dashboard-hero-banner hero-requester">
        <div className="hero-text-wrap">
          <h2 className="hero-greeting">Welcome back, Requester User 👋</h2>
          <p className="hero-subtitle">
            Submit and track your support-item requests.
          </p>
        </div>
        <div className="hero-actions-wrap">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate("new-request")}
          >
            <PlusIcon size={16} />
            <span>+ New Request</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="dashboard-grid-cards">
        <DashboardCard
          title="My Requests"
          value={myRequests.length}
          subtitle="Total requests logged"
          icon={<ClipboardListIcon size={22} />}
          color="blue"
          onClick={() => onNavigate("requests")}
        />
        <DashboardCard
          title="Awaiting Approval"
          value={awaitingApproval}
          subtitle="Under supervisor review"
          icon={<ClockIcon size={22} />}
          color="amber"
          onClick={() => onNavigate("requests")}
        />
        <DashboardCard
          title="Approved Requests"
          value={approvedRequests}
          subtitle="Ready for storekeeper dispatch"
          icon={<CheckCircleIcon size={22} />}
          color="emerald"
          onClick={() => onNavigate("requests")}
        />
        <DashboardCard
          title="Draft / Fulfilled"
          value={completedOrDraft}
          subtitle="Drafted or dispatched items"
          icon={<PackageIcon size={22} />}
          color="purple"
          onClick={() => onNavigate("requests")}
        />
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="quick-actions-bar">
        <h4 className="quick-actions-title">Quick Actions</h4>
        <div className="quick-actions-buttons">
          <button
            type="button"
            className="quick-action-card"
            onClick={() => onNavigate("new-request")}
          >
            <div className="quick-action-icon plus-icon-bg">
              <PlusIcon size={20} />
            </div>
            <div>
              <h5>+ New Request</h5>
              <p>Add items to requisition builder</p>
            </div>
          </button>

          <button
            type="button"
            className="quick-action-card"
            onClick={() => onNavigate("catalogue")}
          >
            <div className="quick-action-icon package-icon-bg">
              <PackageIcon size={20} />
            </div>
            <div>
              <h5>Browse Catalogue</h5>
              <p>Explore equipment & specs</p>
            </div>
          </button>

          <button
            type="button"
            className="quick-action-card"
            onClick={() => onNavigate("requests")}
          >
            <div className="quick-action-icon list-icon-bg">
              <ClipboardListIcon size={20} />
            </div>
            <div>
              <h5>View My Requests</h5>
              <p>Track statuses & approvals</p>
            </div>
          </button>
        </div>
      </div>

      {/* MY RECENT REQUESTS */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <span className="panel-indicator indicator-primary" />
            <h3>Recently Submitted Requests</h3>
          </div>
          <button
            type="button"
            className="panel-link-btn"
            onClick={() => onNavigate("requests")}
          >
            <span>View All</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>

        <div className="panel-body">
          {myRequests.length === 0 ? (
            <EmptyState
              icon={<ClipboardListIcon size={32} />}
              title="No Requests Yet"
              description="You have not created any support item requests yet. Click '+ New Request' to start."
              actionText="+ New Request"
              onAction={() => onNavigate("new-request")}
            />
          ) : (
            <div className="table-responsive">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.slice(0, 5).map((request) => (
                    <tr key={request.line_id || request.id}>
                      <td className="font-mono">#{request.id}</td>
                      <td className="font-medium">
                        {request.item_code} - {request.item_name}
                      </td>
                      <td>{request.requested_qty} units</td>
                      <td>
                        <StatusBadge status={request.status} />
                      </td>
                      <td>
                        {request.status === "DRAFT" ? (
                          <button
                            type="button"
                            className="btn-table-action action-submit"
                            onClick={() => onSubmitRequest(request.id)}
                          >
                            Submit
                          </button>
                        ) : (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================
   3. SUPERVISOR DASHBOARD
   ======================================================== */
const SupervisorDashboard = ({
  dashboard,
  requests = [],
  movements = [],
  onNavigate
}) => {
  const pendingCount = Number(dashboard.pendingRequests) || 0;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;
  const submittedCount = requests.filter((r) => r.status === "SUBMITTED").length;

  return (
    <div className="dashboard-content-flow animate-fadeIn">
      {/* GREETING BANNER */}
      <div className="dashboard-hero-banner hero-supervisor">
        <div className="hero-text-wrap">
          <h2 className="hero-greeting">Welcome back, Supervisor User 👋</h2>
          <p className="hero-subtitle">
            Review pending requests and keep approvals moving.
          </p>
        </div>
        <div className="hero-actions-wrap">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate("requests")}
          >
            <ClipboardListIcon size={16} />
            <span>Pending Approvals</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="dashboard-grid-cards">
        <DashboardCard
          title="Pending Approvals"
          value={pendingCount}
          subtitle="Requests awaiting authorization"
          icon={<ClockIcon size={22} />}
          color="amber"
          onClick={() => onNavigate("requests")}
        />
        <DashboardCard
          title="Recently Submitted"
          value={submittedCount}
          subtitle="Department requests in queue"
          icon={<ClipboardListIcon size={22} />}
          color="blue"
          onClick={() => onNavigate("requests")}
        />
        <DashboardCard
          title="Approved"
          value={approvedCount}
          subtitle="Dispatched for store issuance"
          icon={<CheckCircleIcon size={22} />}
          color="emerald"
        />
        <DashboardCard
          title="Rejected"
          value={rejectedCount}
          subtitle="Returned or denied requisitions"
          icon={<AlertTriangleIcon size={22} />}
          color="rose"
        />
      </div>

      {/* PENDING APPROVAL QUEUE */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <span className="panel-indicator indicator-warning" />
            <h3>Requests Requiring Attention</h3>
          </div>
          <span className="badge-count-pill">{pendingCount} Pending</span>
        </div>

        <div className="panel-body">
          {pendingCount === 0 ? (
            <EmptyState
              icon={<CheckCircleIcon size={32} className="text-success" />}
              title="All Approvals Cleared"
              description="There are no pending requisitions requiring supervisor sign-off."
            />
          ) : (
            <div className="table-responsive">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Requester</th>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests
                    .filter((r) => r.status === "SUBMITTED" || r.status === "DRAFT")
                    .slice(0, 5)
                    .map((r) => (
                      <tr key={r.line_id || r.id}>
                        <td className="font-mono">#{r.id}</td>
                        <td className="font-medium">Requester User</td>
                        <td>
                          {r.item_code} - {r.item_name}
                        </td>
                        <td>{r.requested_qty} units</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => onNavigate("requests")}
                          >
                            <EyeIcon size={14} />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================
   4. STOREKEEPER DASHBOARD
   ======================================================== */
const StorekeeperDashboard = ({
  dashboard,
  stock = [],
  movements = [],
  onNavigate
}) => {
  const totalUnits = stock.reduce(
    (sum, s) => sum + (Number(s.quantity) || 0),
    0
  );
  const lowStockCount = dashboard.lowStock ? dashboard.lowStock.length : 0;
  const pendingIssueCount = Number(dashboard.pendingRequests) || 0;
  const movementCount = dashboard.recentMovements
    ? dashboard.recentMovements.length
    : movements.length;

  return (
    <div className="dashboard-content-flow animate-fadeIn">
      {/* HERO BANNER */}
      <div className="dashboard-hero-banner hero-storekeeper">
        <div className="hero-text-wrap">
          <h2 className="hero-greeting">Welcome back, Storekeeper User 👋</h2>
          <p className="hero-subtitle">
            Manage stock movements and fulfil approved requests.
          </p>
        </div>
        <div className="hero-actions-wrap">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate("stock-receipt")}
          >
            <PackageIcon size={16} />
            <span>Receive Stock</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="dashboard-grid-cards">
        <DashboardCard
          title="Current Stock"
          value={totalUnits}
          subtitle="Total physical units in depot"
          icon={<BoxesIcon size={22} />}
          color="blue"
          onClick={() => onNavigate("stock")}
        />
        <DashboardCard
          title="Low Stock"
          value={lowStockCount}
          subtitle="Items needing replenishment"
          icon={<AlertTriangleIcon size={22} />}
          color="amber"
          onClick={() => onNavigate("stock")}
        />
        <DashboardCard
          title="Approved for Issue"
          value={pendingIssueCount}
          subtitle="Requisitions ready for dispatch"
          icon={<ClipboardListIcon size={22} />}
          color="purple"
          onClick={() => onNavigate("stock-issue")}
        />
        <DashboardCard
          title="Recent Movements"
          value={movementCount}
          subtitle="Logged warehouse transactions"
          icon={<HistoryIcon size={22} />}
          color="emerald"
          onClick={() => onNavigate("movements")}
        />
      </div>

      {/* STOREKEEPER QUICK ACTIONS */}
      <div className="quick-actions-bar">
        <h4 className="quick-actions-title">Primary Stock Actions</h4>
        <div className="quick-actions-buttons">
          <button
            type="button"
            className="quick-action-card"
            onClick={() => onNavigate("stock-receipt")}
          >
            <div className="quick-action-icon plus-icon-bg">
              <PackageIcon size={20} />
            </div>
            <div>
              <h5>Receive Stock</h5>
              <p>Check in inbound deliveries</p>
            </div>
          </button>

          <button
            type="button"
            className="quick-action-card"
            onClick={() => onNavigate("stock-issue")}
          >
            <div className="quick-action-icon list-icon-bg">
              <ClipboardListIcon size={20} />
            </div>
            <div>
              <h5>Issue Stock</h5>
              <p>Fulfil approved requisitions</p>
            </div>
          </button>

          <button
            type="button"
            className="quick-action-card"
            onClick={() => onNavigate("stock-return")}
          >
            <div className="quick-action-icon history-icon-bg">
              <HistoryIcon size={20} />
            </div>
            <div>
              <h5>Process Return</h5>
              <p>Log inventory returns</p>
            </div>
          </button>

          <button
            type="button"
            className="quick-action-card"
            onClick={() => onNavigate("movements")}
          >
            <div className="quick-action-icon package-icon-bg">
              <HistoryIcon size={20} />
            </div>
            <div>
              <h5>View Movement</h5>
              <p>Audit warehouse ledger</p>
            </div>
          </button>
        </div>
      </div>

      {/* TWO PANELS: LOW STOCK & RECENT MOVEMENTS */}
      <div className="dashboard-columns-2">
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <span className="panel-indicator indicator-warning" />
              <h3>Low Stock Alerts</h3>
            </div>
            <button
              type="button"
              className="panel-link-btn"
              onClick={() => onNavigate("stock-receipt")}
            >
              <span>Replenish</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
          <div className="panel-body">
            {lowStockCount === 0 ? (
              <EmptyState
                icon={<CheckCircleIcon size={32} className="text-success" />}
                title="Stock Healthy"
                description="No items currently require urgent purchase orders."
              />
            ) : (
              <div className="table-responsive">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Reorder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.lowStock.slice(0, 5).map((item) => (
                      <tr key={`${item.store_id}-${item.item_id}`}>
                        <td>{item.store_name}</td>
                        <td className="font-medium">{item.item_name}</td>
                        <td>
                          <span className="stock-critical-pill">
                            {item.quantity}
                          </span>
                        </td>
                        <td>{item.reorder_level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <span className="panel-indicator indicator-primary" />
              <h3>Recent Stock Movements</h3>
            </div>
            <button
              type="button"
              className="panel-link-btn"
              onClick={() => onNavigate("movements")}
            >
              <span>Ledger</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
          <div className="panel-body">
            {!dashboard.recentMovements ||
            dashboard.recentMovements.length === 0 ? (
              <EmptyState
                icon={<HistoryIcon size={32} />}
                title="No Recent Activity"
                description="Movements will show here as soon as stock is received or issued."
              />
            ) : (
              <div className="table-responsive">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentMovements.slice(0, 5).map((movement) => (
                      <tr key={movement.id}>
                        <td>{movement.store_name}</td>
                        <td className="font-medium">{movement.item_name}</td>
                        <td>
                          <StatusBadge status={movement.type} />
                        </td>
                        <td className="font-semibold">{movement.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
