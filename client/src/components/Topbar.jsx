import React, { useState, useRef, useEffect } from "react";
import {
  MenuIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  LogoutIcon,
  SettingsIcon,
  AlertTriangleIcon,
  ClockIcon,
  ClipboardListIcon,
  SearchIcon,
  PackageIcon
} from "./Icons";

export const Topbar = ({
  userRole,
  activeNav,
  onMenuClick,
  theme,
  onToggleTheme,
  onLogout,
  onNavigate,
  dashboard = { lowStock: [], pendingRequests: 0, overdueMaintenance: 0 },
  searchTerm = "",
  onSearchChange
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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

  const getPageTitle = () => {
    switch (activeNav) {
      case "dashboard":
        return "Executive Dashboard";
      case "catalogue":
        return "Item Catalogue";
      case "stock":
        return "Stores & Stock Balances";
      case "stock-receipt":
        return "Stock Receipts";
      case "stock-issue":
        return "Stock Issue Dispatch";
      case "stock-return":
        return "Stock Returns";
      case "movements":
        return "Stock Movement Ledger";
      case "requests":
        return userRole === "SUPERVISOR"
          ? "Pending Approvals"
          : "Request Management";
      case "new-request":
        return "Create Support Request";
      case "request-history":
        return "Request History";
      case "users":
        return "Team & User Access";
      case "maintenance":
        return "Maintenance Operations";
      case "reports":
        return "Analytics & Inventory Reports";
      case "activity":
        return "Audit & Activity Log";
      case "settings":
        return "Portal Settings";
      default:
        return "Dashboard";
    }
  };

  // Calculate notifications from real dashboard data
  const lowStockCount = dashboard.lowStock ? dashboard.lowStock.length : 0;
  const pendingRequests = Number(dashboard.pendingRequests) || 0;
  const overdueMaint = Number(dashboard.overdueMaintenance) || 0;
  const totalAlerts = lowStockCount + pendingRequests + overdueMaint;

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle navigation drawer"
        >
          <MenuIcon size={22} />
        </button>

        <div className="topbar-breadcrumbs">
          <span className="crumb-root">Portal</span>
          <span className="crumb-separator">/</span>
          <span className="crumb-current">{getPageTitle()}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* TOPBAR SEARCH TRIGGER/INPUT */}
        <div className="topbar-search-box">
          <SearchIcon size={16} className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Quick search catalogue..."
            value={searchTerm}
            onChange={(e) => {
              if (onSearchChange) onSearchChange(e);
              if (activeNav !== "catalogue" && onNavigate) {
                onNavigate("catalogue");
              }
            }}
          />
        </div>

        {/* THEME TOGGLE ICON BUTTON */}
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          aria-label="Toggle dark/light theme"
        >
          {theme === "dark" ? <SunIcon size={19} /> : <MoonIcon size={19} />}
        </button>

        {/* NOTIFICATIONS DROPDOWN */}
        <div className="topbar-notif-wrap" ref={notifRef}>
          <button
            type="button"
            className={`topbar-icon-btn ${totalAlerts > 0 ? "has-badge" : ""}`}
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            title="System alerts & notifications"
            aria-label="View notifications"
          >
            <BellIcon size={19} />
            {totalAlerts > 0 && (
              <span className="notif-badge-pill">{totalAlerts}</span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="notif-dropdown-menu">
              <div className="notif-dropdown-header">
                <div className="notif-header-title">
                  <h5>System Alerts</h5>
                  <span className="notif-count-chip">{totalAlerts} Active</span>
                </div>
              </div>

              <div className="notif-list">
                {lowStockCount > 0 && (
                  <div
                    className="notif-item notif-warning clickable"
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      onNavigate("stock");
                    }}
                  >
                    <div className="notif-icon-col">
                      <AlertTriangleIcon size={18} />
                    </div>
                    <div className="notif-body">
                      <h6>Low Stock Alert</h6>
                      <p>
                        {lowStockCount} {lowStockCount === 1 ? "item is" : "items are"} below minimum reorder threshold.
                      </p>
                    </div>
                  </div>
                )}

                {pendingRequests > 0 && (
                  <div
                    className="notif-item notif-info clickable"
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      onNavigate("requests");
                    }}
                  >
                    <div className="notif-icon-col">
                      <ClipboardListIcon size={18} />
                    </div>
                    <div className="notif-body">
                      <h6>Pending Approvals</h6>
                      <p>
                        {pendingRequests} support-item {pendingRequests === 1 ? "request is" : "requests are"} awaiting approval.
                      </p>
                    </div>
                  </div>
                )}

                {overdueMaint > 0 && (
                  <div
                    className="notif-item notif-danger clickable"
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      onNavigate("maintenance");
                    }}
                  >
                    <div className="notif-icon-col">
                      <ClockIcon size={18} />
                    </div>
                    <div className="notif-body">
                      <h6>Overdue Maintenance</h6>
                      <p>
                        {overdueMaint} equipment maintenance {overdueMaint === 1 ? "ticket is" : "tickets are"} overdue for servicing.
                      </p>
                    </div>
                  </div>
                )}

                {totalAlerts === 0 && (
                  <div className="notif-empty">
                    <p>All inventory operations are running nominally.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE PILL & DROPDOWN */}
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile-btn"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            aria-expanded={profileDropdownOpen}
          >
            <div className="topbar-avatar">{roleName.charAt(0)}</div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{roleName}</span>
              <span className="topbar-role-badge">{userRole || "USER"}</span>
            </div>
            <ChevronDownIcon size={14} className="topbar-chevron" />
          </button>

          {profileDropdownOpen && (
            <div className="topbar-profile-dropdown">
              <div className="profile-dropdown-user-header">
                <div className="dropdown-avatar-large">
                  {roleName.charAt(0)}
                </div>
                <div>
                  <h5 className="dropdown-name">{roleName}</h5>
                  <span className="dropdown-role">{userRole}</span>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="profile-dropdown-item"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onNavigate("settings");
                }}
              >
                <SettingsIcon size={16} />
                <span>Portal Preferences</span>
              </button>

              <button
                type="button"
                className="profile-dropdown-item"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onNavigate("catalogue");
                }}
              >
                <PackageIcon size={16} />
                <span>Browse Catalogue</span>
              </button>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="profile-dropdown-item text-danger"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onLogout();
                }}
              >
                <LogoutIcon size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
