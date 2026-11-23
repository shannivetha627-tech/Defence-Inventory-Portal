import React from "react";
import {
  ShieldIcon,
  DashboardIcon,
  PackageIcon,
  BoxesIcon,
  ClipboardListIcon,
  UsersIcon,
  WrenchIcon,
  BarChart3Icon,
  HistoryIcon,
  SettingsIcon,
  LogoutIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  XIcon,
} from "./Icons";

export const Sidebar = ({
  userRole,
  activeNav,
  setActiveNav,
  onLogout,
  theme,
  onToggleTheme,
  isOpen,
  onClose,
  pendingCount = 0,
}) => {
  // Navigation items mapping per role
  const getNavItems = () => {
    switch (userRole) {
      case "REQUESTER":
        return [
          { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
          {
            id: "requests",
            label: "My Requests",
            icon: <ClipboardListIcon />,
            badge: pendingCount > 0 ? pendingCount : null,
          },
          { id: "new-request", label: "New Request", icon: <PlusIcon /> },
          { id: "catalogue", label: "Item Catalogue", icon: <PackageIcon /> },
          {
            id: "request-history",
            label: "Request History",
            icon: <HistoryIcon />,
          },
        ];

      case "SUPERVISOR":
        return [
          { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
          {
            id: "requests",
            label: "Pending Approvals",
            icon: <ClipboardListIcon />,
            badge: pendingCount > 0 ? pendingCount : null,
          },
          {
            id: "request-history",
            label: "Request History",
            icon: <HistoryIcon />,
          },
          { id: "catalogue", label: "Item Catalogue", icon: <PackageIcon /> },
          { id: "maintenance", label: "Maintenance", icon: <WrenchIcon /> },
          { id: "reports", label: "Reports", icon: <BarChart3Icon /> },
        ];

      case "STOREKEEPER":
        return [
          { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
          { id: "stock", label: "Stock Overview", icon: <BoxesIcon /> },
          { id: "stock-receipt", label: "Receipts", icon: <PackageIcon /> },
          {
            id: "stock-issue",
            label: "Issue Stock",
            icon: <ClipboardListIcon />,
          },
          { id: "stock-return", label: "Returns", icon: <HistoryIcon /> },
          { id: "movements", label: "Movement Ledger", icon: <HistoryIcon /> },
          { id: "catalogue", label: "Item Catalogue", icon: <PackageIcon /> },
        ];

      case "ADMIN":
      default:
        return [
          { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
          { id: "users", label: "Users", icon: <UsersIcon /> },
          { id: "catalogue", label: "Item Catalogue", icon: <PackageIcon /> },
          { id: "stock", label: "Stores & Stock", icon: <BoxesIcon /> },
          {
            id: "requests",
            label: "Requests",
            icon: <ClipboardListIcon />,
            badge: pendingCount > 0 ? pendingCount : null,
          },
          { id: "maintenance", label: "Maintenance", icon: <WrenchIcon /> },
          { id: "reports", label: "Reports", icon: <BarChart3Icon /> },
          { id: "activity", label: "Audit / Activity", icon: <HistoryIcon /> },
          { id: "settings", label: "Settings", icon: <SettingsIcon /> },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "REQUESTER":
        return "Requester User";
      case "SUPERVISOR":
        return "Supervisor User";
      case "STOREKEEPER":
        return "Storekeeper User";
      default:
        return "Defence Staff";
    }
  };

  const roleName = getRoleDisplayName(userRole);

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        {/* BRANDING HEADER */}
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <div className="brand-shield-glow">
              <ShieldIcon size={26} className="brand-icon" />
            </div>
            <div className="brand-text">
              <h2 className="brand-title">Defence Inventory</h2>
              <span className="brand-tagline">Support Management Portal</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <div className="sidebar-nav-container">
          <span className="nav-group-title">MAIN NAVIGATION</span>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                  {isActive && <span className="nav-active-indicator" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER / PROFILE */}
        <div className="sidebar-footer">
          <div className="sidebar-theme-row">
            <span className="theme-toggle-label">Interface Theme</span>
            <button
              type="button"
              className="theme-switch-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <>
                  <SunIcon size={16} />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <MoonIcon size={16} />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          <div className="sidebar-profile-card">
            <div className="profile-avatar-circle">{roleName.charAt(0)}</div>
            <div className="profile-details">
              <h4 className="profile-name">{roleName}</h4>
              <span className="profile-role-badge">{userRole || "USER"}</span>
            </div>
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={onLogout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogoutIcon size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
