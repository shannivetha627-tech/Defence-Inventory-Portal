import React from "react";
import {
  UsersIcon,
  WrenchIcon,
  BarChart3Icon,
  HistoryIcon,
  SettingsIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ShieldIcon,
  SunIcon,
  MoonIcon,
  ClockIcon
} from "./Icons";
import { StatusBadge } from "./StatusBadge";

export const UsersView = () => {
  const demoUsers = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
      dept: "Executive Operations",
      status: "ACTIVE"
    },
    {
      id: 2,
      name: "Requester User",
      email: "requester@example.com",
      role: "REQUESTER",
      dept: "Support Regiment",
      status: "ACTIVE"
    },
    {
      id: 3,
      name: "Supervisor User",
      email: "supervisor@example.com",
      role: "SUPERVISOR",
      dept: "Logistics Oversight",
      status: "ACTIVE"
    },
    {
      id: 4,
      name: "Storekeeper User",
      email: "storekeeper@example.com",
      role: "STOREKEEPER",
      dept: "Central Depot",
      status: "ACTIVE"
    }
  ];

  return (
    <div className="view-flow animate-fadeIn">
      <div className="view-header">
        <div>
          <h2 className="view-title">Portal User Directory</h2>
          <p className="view-subtitle">
            Authenticated role-based access control directory
          </p>
        </div>
      </div>

      <div className="panel-card table-responsive">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Personnel</th>
              <th>Official Email</th>
              <th>Assigned Department</th>
              <th>System Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {demoUsers.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">
                  <div className="user-cell">
                    <div className="user-avatar-sm">{u.name.charAt(0)}</div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td className="font-mono text-secondary">{u.email}</td>
                <td>{u.dept}</td>
                <td>
                  <span className="role-chip">{u.role}</span>
                </td>
                <td>
                  <StatusBadge status={u.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const MaintenanceView = ({ dashboard }) => {
  const overdueCount = Number(dashboard?.overdueMaintenance) || 0;

  return (
    <div className="view-flow animate-fadeIn">
      <div className="view-header">
        <div>
          <h2 className="view-title">Maintenance Operations</h2>
          <p className="view-subtitle">
            Preventative equipment servicing & maintenance log
          </p>
        </div>
      </div>

      <div className="dashboard-grid-cards">
        <div className="dashboard-stat-card card-rose">
          <div className="card-top">
            <span className="card-title">Overdue Maintenance</span>
            <div className="card-icon-wrap">
              <WrenchIcon size={22} />
            </div>
          </div>
          <div className="card-value-wrap">
            <h3 className="card-value">{overdueCount}</h3>
          </div>
          <p className="card-subtitle">Equipment units overdue for service</p>
          <div className="card-glow" />
        </div>

        <div className="dashboard-stat-card card-blue">
          <div className="card-top">
            <span className="card-title">Status</span>
            <div className="card-icon-wrap">
              <CheckCircleIcon size={22} />
            </div>
          </div>
          <div className="card-value-wrap">
            <h3 className="card-value">Active</h3>
          </div>
          <p className="card-subtitle">Scheduled servicing protocols</p>
          <div className="card-glow" />
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <span className="panel-indicator indicator-warning" />
            <h3>Maintenance Status Overview</h3>
          </div>
        </div>
        <div className="panel-body">
          {overdueCount > 0 ? (
            <div className="maintenance-alert-banner">
              <div className="maint-icon-wrap">
                <WrenchIcon size={24} />
              </div>
              <div className="maint-text">
                <h4>{overdueCount} Tickets Flagged as Overdue</h4>
                <p>
                  Preventative servicing on workshop items is scheduled according to defence support protocols. Check service logs with field technicians.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-secondary">
              All equipment units are compliant with current maintenance inspection schedules.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ReportsView = ({ items = [], stock = [], movements = [] }) => {
  const totalStockUnits = stock.reduce(
    (sum, s) => sum + (Number(s.quantity) || 0),
    0
  );

  return (
    <div className="view-flow animate-fadeIn">
      <div className="view-header">
        <div>
          <h2 className="view-title">Inventory Reports & Analytics</h2>
          <p className="view-subtitle">
            High-level metrics across catalogue items, warehouse distribution and transactions
          </p>
        </div>
      </div>

      <div className="dashboard-grid-cards">
        <div className="dashboard-stat-card card-blue">
          <div className="card-top">
            <span className="card-title">Catalogue Capacity</span>
            <div className="card-icon-wrap">
              <BarChart3Icon size={22} />
            </div>
          </div>
          <div className="card-value-wrap">
            <h3 className="card-value">{items.length}</h3>
          </div>
          <p className="card-subtitle">Unique SKUs registered</p>
          <div className="card-glow" />
        </div>

        <div className="dashboard-stat-card card-purple">
          <div className="card-top">
            <span className="card-title">Stored Units</span>
            <div className="card-icon-wrap">
              <BarChart3Icon size={22} />
            </div>
          </div>
          <div className="card-value-wrap">
            <h3 className="card-value">{totalStockUnits}</h3>
          </div>
          <p className="card-subtitle">Physical units in storage</p>
          <div className="card-glow" />
        </div>

        <div className="dashboard-stat-card card-emerald">
          <div className="card-top">
            <span className="card-title">Ledger Entries</span>
            <div className="card-icon-wrap">
              <HistoryIcon size={22} />
            </div>
          </div>
          <div className="card-value-wrap">
            <h3 className="card-value">{movements.length}</h3>
          </div>
          <p className="card-subtitle">Recorded transactions</p>
          <div className="card-glow" />
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <span className="panel-indicator indicator-primary" />
            <h3>Inventory Distribution Summary</h3>
          </div>
        </div>
        <div className="panel-body">
          <p className="text-secondary">
            Warehouse operations are currently distributed across 3 key depot facilities: Central Store, Workshop Store, and Office Store. Real-time balance updates are synced with movement ledger timestamps.
          </p>
        </div>
      </div>
    </div>
  );
};

export const SettingsView = ({ theme, onToggleTheme, userRole, onLogout }) => {
  return (
    <div className="view-flow animate-fadeIn">
      <div className="view-header">
        <div>
          <h2 className="view-title">Portal Settings & Preferences</h2>
          <p className="view-subtitle">
            Configure display preferences and view session details
          </p>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title-wrap">
            <span className="panel-indicator indicator-primary" />
            <h3>Appearance & Theme</h3>
          </div>
        </div>
        <div className="panel-body">
          <div className="settings-row">
            <div>
              <h5 className="settings-item-title">Color Theme</h5>
              <p className="settings-item-desc">
                Toggle between dark navy/indigo and pearl ivory light theme
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={onToggleTheme}
            >
              {theme === "dark" ? (
                <>
                  <SunIcon size={16} />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <MoonIcon size={16} />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ marginTop: "24px" }}>
        <div className="panel-header">
          <div className="panel-title-wrap">
            <span className="panel-indicator indicator-primary" />
            <h3>Active Session</h3>
          </div>
        </div>
        <div className="panel-body">
          <div className="settings-row">
            <div>
              <h5 className="settings-item-title">Current Access Role</h5>
              <p className="settings-item-desc">
                Logged in under verified system role: <strong>{userRole}</strong>
              </p>
            </div>
            <button
              type="button"
              className="btn-danger-outline"
              onClick={onLogout}
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
