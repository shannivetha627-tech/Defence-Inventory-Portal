import { useEffect, useState, useCallback } from "react";
import "./App.css";
import Background3D from "./Background3D";
const productImages = {
  "ITM007": "/products/usb-cable.jpg",
  "ITM010": "/products/extension-board.jpg",
  "ITM013": "/products/adjustable-wrench.jpg",
  "ITM016": "/products/safety-goggles.jpg",
  "ITM017": "/products/safety-helmet.jpg",
  "ITM023": "/products/stapler.jpg",
  "ITM024": "/products/usb-drive.jpg",
};

// Components
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { RoleDashboard } from "./components/RoleDashboards";
import { ItemCatalogueView } from "./components/ItemCatalogueView";
import { StockManagementView } from "./components/StockManagementView";
import { RequestManagementView } from "./components/RequestManagementView";
import {
  UsersView,
  MaintenanceView,
  ReportsView,
  SettingsView
} from "./components/PlaceholdersView";
import { ItemModal } from "./components/ItemModal";
import { ItemDetailsModal } from "./components/ItemDetailsModal";
import { Toast } from "./components/Toast";
import { ShieldIcon, SunIcon, MoonIcon } from "./components/Icons";

function App() {
  // ==========================
  // AUTH STATES
  // ==========================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [userRole, setUserRole] = useState(
    localStorage.getItem("role") || ""
  );

  // ==========================
  // THEME & SHELL STATES
  // ==========================
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  // Keep theme synced with document element
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ==========================
  // TOAST NOTIFICATIONS
  // ==========================
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", title = "") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, title }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ==========================
  // CATALOGUE ITEMS STATES
  // ==========================
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ==========================
  // DASHBOARD STATES
  // ==========================
  const [dashboard, setDashboard] = useState({
    lowStock: [],
    pendingRequests: 0,
    overdueMaintenance: 0,
    recentMovements: []
  });

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  // ==========================
  // STOCK STATES
  // ==========================
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);

  const [receiptStore, setReceiptStore] = useState("1");
  const [receiptItem, setReceiptItem] = useState("1");
  const [receiptQuantity, setReceiptQuantity] = useState("");

  const [receiptMessage, setReceiptMessage] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [issueStore, setIssueStore] = useState("1");
  const [issueRequestId, setIssueRequestId] = useState("");
  const [issueMessage, setIssueMessage] = useState("");
  const [issueError, setIssueError] = useState("");

  const [returnStore, setReturnStore] = useState("1");
  const [returnRequestLineId, setReturnRequestLineId] = useState("");
  const [returnQuantity, setReturnQuantity] = useState("");
  const [returnMessage, setReturnMessage] = useState("");
  const [returnError, setReturnError] = useState("");

  // ==========================
  // ADD & EDIT ITEM STATES
  // ==========================
  const [showAddForm, setShowAddForm] = useState(false);

  const [newItem, setNewItem] = useState({
    code: "",
    name: "",
    category: "",
    unit: "",
    reorder_level: ""
  });

  const [addItemError, setAddItemError] = useState("");

  const [showEditForm, setShowEditForm] = useState(false);

  const [editItem, setEditItem] = useState({
    id: "",
    code: "",
    name: "",
    category: "",
    unit: "",
    reorder_level: ""
  });

  const [editItemError, setEditItemError] = useState("");

  // View Details Modal State
  const [detailsItem, setDetailsItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ==========================
  // REQUEST MANAGEMENT STATES
  // ==========================
  const [requestLines, setRequestLines] = useState([
    { item_id: "", requested_qty: "" }
  ]);
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  // ==========================
  // LOGIN LOGIC
  // ==========================
  const handleLogin = async (e) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoginError("Invalid email or password");
        addToast("Invalid email or password", "error", "Authentication Failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setUserRole(data.role);

      setLoggedIn(true);
      setActiveNav("dashboard");
      addToast(`Welcome back, ${data.role || "User"}`, "success", "Signed In");

    } catch (error) {
      console.error(error);
      setLoginError("Unable to connect to server");
      addToast("Unable to connect to server", "error", "Connection Error");
    }
  };

  // ==========================
  // FETCH ITEMS
  // ==========================
  const fetchItems = useCallback(async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/items",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      setItems(data);

      // Default receipt item dropdown if not set
      if (data.length > 0 && !receiptItem) {
        setReceiptItem(String(data[0].id));
      }

    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }, [receiptItem]);

  // ==========================
  // FETCH STOCK BALANCES
  // ==========================
  const fetchStock = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/stock/balances",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Stock fetch error:", data);
        return;
      }

      setStock(data);

    } catch (error) {
      console.error("Stock fetch error:", error);
    }
  }, []);

  // ==========================
  // FETCH MOVEMENT HISTORY
  // ==========================
  const fetchMovements = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/stock/movements",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Movement history error:", data);
        return;
      }

      setMovements(data);

    } catch (error) {
      console.error("Movement history error:", error);
    }
  }, []);

  // ==========================
  // FETCH DASHBOARD
  // ==========================
  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError("");

    try {
      const token = localStorage.getItem("token");

      // Fetch dashboard data
      const dashboardResponse = await fetch(
        "http://localhost:3000/api/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const dashboardData = await dashboardResponse.json();

      if (!dashboardResponse.ok) {
        setDashboardError(
          dashboardData.message || "Failed to fetch dashboard"
        );
        return;
      }

      // Fetch stock movements to resolve actor names
      const movementsResponse = await fetch(
        "http://localhost:3000/api/stock/movements",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const movementsData = await movementsResponse.json();

      if (!movementsResponse.ok) {
        setDashboard(dashboardData);
        return;
      }

      const actorMap = {};
      movementsData.forEach((movement) => {
        actorMap[movement.id] = movement.actor;
      });

      const updatedRecentMovements = (dashboardData.recentMovements || []).map(
        (movement) => ({
          ...movement,
          actor_name:
            movement.actor_name ||
            actorMap[movement.id] ||
            "Unknown"
        })
      );

      setDashboard({
        ...dashboardData,
        recentMovements: updatedRecentMovements
      });

    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setDashboardError("Unable to connect to server");
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // ==========================
  // FETCH REQUESTS
  // ==========================
  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setRequests(data);

    } catch (error) {
      console.error("Request fetch error:", error);
    }
  }, []);

  // Lifecycle bootstrap
  useEffect(() => {
    if (!loggedIn) {
      return;
    }
    fetchItems();
    fetchDashboard();
    fetchStock();
    fetchMovements();

    if (userRole === "REQUESTER" || userRole === "SUPERVISOR" || userRole === "STOREKEEPER") {
      fetchRequests();
    }
  }, [loggedIn, userRole, fetchItems, fetchDashboard, fetchStock, fetchMovements, fetchRequests]);

  // ==========================
  // SEARCH ITEMS
  // ==========================
  const handleSearch = async (e) => {
    const searchValue = e.target.value;
    setSearch(searchValue);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/items?search=${encodeURIComponent(searchValue)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      setItems(data);

    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // ==========================
  // ADD ITEM
  // ==========================
  const handleAddItem = async () => {
    setAddItemError("");

    if (
      !newItem.code ||
      !newItem.name ||
      !newItem.category ||
      !newItem.unit ||
      newItem.reorder_level === ""
    ) {
      setAddItemError("All fields are required");
      return;
    }

    if (Number(newItem.reorder_level) < 0) {
      setAddItemError("Reorder level cannot be negative");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/items",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            code: newItem.code.trim(),
            name: newItem.name.trim(),
            category: newItem.category.trim(),
            unit: newItem.unit.trim(),
            reorder_level: Number(newItem.reorder_level)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAddItemError(data.message || "Failed to create item");
        return;
      }

      setShowAddForm(false);
      setNewItem({
        code: "",
        name: "",
        category: "",
        unit: "",
        reorder_level: ""
      });

      addToast("Item created successfully", "success", "Catalogue Updated");

      // Refresh items and dashboard
      await fetchItems();
      await fetchDashboard();

      setSearch("");

    } catch (error) {
      console.error(error);
      setAddItemError("Unable to connect to server");
    }
  };

  // ==========================
  // OPEN EDIT FORM
  // ==========================
  const openEditForm = (item) => {
    setEditItem({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      reorder_level: item.reorder_level
    });

    setEditItemError("");
    setShowEditForm(true);
  };

  // ==========================
  // EDIT ITEM
  // ==========================
  const handleEditItem = async () => {
    setEditItemError("");

    if (
      !editItem.code ||
      !editItem.name ||
      !editItem.category ||
      !editItem.unit ||
      editItem.reorder_level === ""
    ) {
      setEditItemError("All fields are required");
      return;
    }

    if (Number(editItem.reorder_level) < 0) {
      setEditItemError("Reorder level cannot be negative");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/items/${editItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            code: editItem.code.trim(),
            name: editItem.name.trim(),
            category: editItem.category.trim(),
            unit: editItem.unit.trim(),
            reorder_level: Number(editItem.reorder_level)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setEditItemError(data.message || "Failed to update item");
        return;
      }

      setShowEditForm(false);
      setEditItem({
        id: "",
        code: "",
        name: "",
        category: "",
        unit: "",
        reorder_level: ""
      });

      addToast("Item updated successfully", "success", "Catalogue Updated");

      await fetchItems();
      await fetchDashboard();

      setSearch("");

    } catch (error) {
      console.error("Edit item error:", error);
      setEditItemError("Unable to connect to server");
    }
  };

  // ==========================
  // DETAILS MODAL
  // ==========================
  const handleOpenDetails = (item) => {
    setDetailsItem(item);
    setShowDetailsModal(true);
  };

  // ==========================
  // RECEIVE STOCK
  // ==========================
  const handleReceiveStock = async () => {
    setReceiptMessage("");
    setReceiptError("");

    if (!receiptQuantity || Number(receiptQuantity) <= 0) {
      setReceiptError("Quantity must be greater than 0");
      addToast("Quantity must be greater than 0", "error", "Validation Error");
      return;
    }

    setStockLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/stock/receipts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            store_id: Number(receiptStore),
            item_id: Number(receiptItem),
            quantity: Number(receiptQuantity)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setReceiptError(data.message || "Failed to receive stock");
        addToast(data.message || "Failed to receive stock", "error");
        return;
      }

      const successMsg = `Stock received successfully: ${data.quantity} ${data.quantity === 1 ? "unit" : "units"
        }`;
      setReceiptMessage(successMsg);
      addToast(successMsg, "success", "Inbound Stock Received");

      setReceiptQuantity("");

      await fetchStock();
      await fetchMovements();
      await fetchDashboard();

    } catch (error) {
      console.error("Receive stock error:", error);
      setReceiptError("Unable to connect to server");
      addToast("Unable to connect to server", "error");
    } finally {
      setStockLoading(false);
    }
  };

  // ==========================
  // ISSUE APPROVED REQUEST
  // ==========================
  const handleIssueStock = async () => {
    setIssueMessage("");
    setIssueError("");

    if (!issueRequestId) {
      setIssueError("Select an approved request");
      addToast("Select an approved request", "error", "Validation Error");
      return;
    }

    setStockLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/stock/issue/${issueRequestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            store_id: Number(issueStore)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setIssueError(data.message || "Failed to issue request");
        addToast(data.message || "Failed to issue request", "error", "Issue Failed");
        return;
      }

      setIssueMessage(
        `Request #${issueRequestId} issued successfully`
      );

      addToast(
        `Request #${issueRequestId} issued successfully`,
        "success",
        "Stock Issued"
      );

      setIssueRequestId("");

      await fetchStock();
      await fetchMovements();
      await fetchRequests();
      await fetchDashboard();

    } catch (error) {
      console.error("Issue stock error:", error);
      setIssueError("Unable to connect to server");
      addToast("Unable to connect to server", "error");
    } finally {
      setStockLoading(false);
    }
  };

  // ==========================
  // RETURN ISSUED ITEM
  // ==========================
  const handleReturnStock = async () => {
    setReturnMessage("");
    setReturnError("");

    if (!returnRequestLineId) {
      setReturnError("Select an issued request line");
      addToast("Select an issued request line", "error", "Validation Error");
      return;
    }

    if (!returnQuantity || Number(returnQuantity) <= 0) {
      setReturnError("Return quantity must be greater than 0");
      addToast(
        "Return quantity must be greater than 0",
        "error",
        "Validation Error"
      );
      return;
    }

    setStockLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/stock/returns",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            store_id: Number(returnStore),
            request_line_id: Number(returnRequestLineId),
            quantity: Number(returnQuantity)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setReturnError(data.message || "Failed to return item");
        addToast(
          data.message || "Failed to return item",
          "error",
          "Return Failed"
        );
        return;
      }

      setReturnMessage(
        `Item returned successfully: ${data.quantity} unit(s)`
      );

      addToast(
        `Item returned successfully: ${data.quantity} unit(s)`,
        "success",
        "Stock Returned"
      );

      setReturnRequestLineId("");
      setReturnQuantity("");

      await fetchStock();
      await fetchMovements();
      await fetchRequests();
      await fetchDashboard();

    } catch (error) {
      console.error("Return stock error:", error);
      setReturnError("Unable to connect to server");
      addToast("Unable to connect to server", "error");
    } finally {
      setStockLoading(false);
    }
  };

  // ==========================
  // REQUEST CREATION & SUBMIT
  // ==========================
  const handleRequestLineChange = (index, field, value) => {
    setRequestLines((current) =>
      current.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      )
    );
  };

  const addRequestLine = () => {
    setRequestLines((current) => [
      ...current,
      { item_id: "", requested_qty: "" }
    ]);
  };

  const removeRequestLine = (index) => {
    if (requestLines.length === 1) return;

    setRequestLines((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const handleCreateRequest = async () => {
    setRequestMessage("");
    setRequestError("");

    for (const line of requestLines) {
      if (!line.item_id || !line.requested_qty || Number(line.requested_qty) <= 0) {
        setRequestError("Select an item and enter a quantity greater than 0 for every line");
        addToast("Select an item and enter a quantity greater than 0 for every line", "error");
        return;
      }
    }

    const itemIds = requestLines.map((line) => line.item_id);
    if (new Set(itemIds).size !== itemIds.length) {
      setRequestError("The same item cannot be added twice");
      addToast("The same item cannot be added twice in one requisition", "error");
      return;
    }

    setRequestLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            items: requestLines.map((line) => ({
              item_id: Number(line.item_id),
              requested_qty: Number(line.requested_qty)
            }))
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setRequestError(data.message || "Failed to create request");
        addToast(data.message || "Failed to create request", "error");
        return;
      }

      const msg = `Request #${data.requestId} created successfully as DRAFT`;
      setRequestMessage(msg);
      addToast(msg, "success", "Draft Requisition Created");

      setRequestLines([{ item_id: "", requested_qty: "" }]);
      await fetchRequests();
      await fetchDashboard();

    } catch (error) {
      console.error("Create request error:", error);
      setRequestError("Unable to connect to server");
      addToast("Unable to connect to server", "error");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSubmitRequest = async (requestId) => {
    setRequestMessage("");
    setRequestError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/requests/${requestId}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setRequestError(data.message || "Failed to submit request");
        addToast(data.message || "Failed to submit request", "error");
        return;
      }

      const msg = `Request #${requestId} submitted successfully`;
      setRequestMessage(msg);
      addToast(msg, "success", "Requisition Submitted");

      await fetchRequests();
      await fetchDashboard();

    } catch (error) {
      console.error("Submit request error:", error);
      setRequestError("Unable to connect to server");
      addToast("Unable to connect to server", "error");
    }
  };
  // ==========================
  // SUPERVISOR APPROVAL
  // ==========================
  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/requests/${requestId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            decision_note: "Approved by supervisor"
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        addToast(
          data.message || "Failed to approve request",
          "error",
          "Approval Failed"
        );
        return;
      }

      addToast(
        `Request #${requestId} approved successfully`,
        "success",
        "Request Approved"
      );

      await fetchRequests();
      await fetchDashboard();

    } catch (error) {
      console.error("Approve request error:", error);
      addToast("Unable to connect to server", "error");
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = window.prompt("Enter rejection reason:");

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      addToast(
        "Rejection reason is required",
        "error",
        "Validation Error"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/requests/${requestId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            decision_note: reason.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        addToast(
          data.message || "Failed to reject request",
          "error",
          "Rejection Failed"
        );
        return;
      }

      addToast(
        `Request #${requestId} rejected successfully`,
        "success",
        "Request Rejected"
      );

      await fetchRequests();
      await fetchDashboard();

    } catch (error) {
      console.error("Reject request error:", error);
      addToast("Unable to connect to server", "error");
    }
  };

  // ==========================
  // LOGOUT
  // ==========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setUserRole("");
    setLoggedIn(false);

    setEmail("");
    setPassword("");

    addToast("You have been signed out", "info", "Session Ended");
  };

  // ==========================
  // LOGIN PAGE VIEW
  // ==========================
  if (!loggedIn) {
    return (
      <div className={`portal-root ${theme}-theme login-view-mode`}>
        <Background3D />

        <div className="login-top-actions">
          <button
            type="button"
            className="theme-switch-btn login-theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>

        <div className="login-page">
          <div className="login-card">
            <div className="login-branding">
              <div className="login-shield-badge">
                <ShieldIcon size={34} className="login-shield-icon" />
              </div>
              <h1 className="login-portal-title">Defence Inventory</h1>
              <p className="login-portal-sub">Support Management Portal</p>
            </div>

            <div className="login-form-header">
              <h2>Secure Sign In</h2>
              <p>Enter your authorized departmental credentials</p>
            </div>

            <form onSubmit={handleLogin} className="login-form-element">
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Departmental Email
                </label>
                <input
                  id="login-email"
                  type="text"
                  className="form-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                    setLoginError("");
                  }}
                  placeholder="e.g. admin@example.com"
                  autoComplete="email"
                />
                {emailError && (
                  <p className="error-message">{emailError}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                    setLoginError("");
                  }}
                  placeholder="Enter your security password"
                  autoComplete="current-password"
                />
                {passwordError && (
                  <p className="error-message">{passwordError}</p>
                )}
              </div>

              {loginError && (
                <div className="alert alert-danger login-alert">
                  <span className="alert-dot" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="forgot-password">
                <button
                  type="button"
                  className="forgot-pass-btn"
                  onClick={() =>
                    alert("Password reset feature will be implemented soon.")
                  }
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="login-button">
                Sign In to Portal
              </button>
            </form>

            <div className="demo-credentials-footer">
              <span className="demo-creds-title">Demo Access Accounts:</span>
              <div className="demo-creds-chips">
                <button
                  type="button"
                  className="demo-chip"
                  onClick={() => {
                    setEmail("admin@example.com");
                    setPassword("password123");
                  }}
                  title="Click to fill Admin credentials"
                >
                  Admin
                </button>
                <button
                  type="button"
                  className="demo-chip"
                  onClick={() => {
                    setEmail("requester@example.com");
                    setPassword("password123");
                  }}
                  title="Click to fill Requester credentials"
                >
                  Requester
                </button>
                <button
                  type="button"
                  className="demo-chip"
                  onClick={() => {
                    setEmail("supervisor@example.com");
                    setPassword("password123");
                  }}
                  title="Click to fill Supervisor credentials"
                >
                  Supervisor
                </button>
                <button
                  type="button"
                  className="demo-chip"
                  onClick={() => {
                    setEmail("storekeeper@example.com");
                    setPassword("password123");
                  }}
                  title="Click to fill Storekeeper credentials"
                >
                  Storekeeper
                </button>
              </div>
            </div>
          </div>
        </div>

        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // ==========================
  // AUTHENTICATED APPLICATION
  // ==========================
  const renderCurrentView = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <RoleDashboard
            userRole={userRole}
            dashboard={dashboard}
            items={items}
            stock={stock}
            requests={requests}
            movements={movements}
            onNavigate={(target) => setActiveNav(target)}
            onSubmitRequest={handleSubmitRequest}
            onOpenDetails={handleOpenDetails}
          />
        );

      case "catalogue":
        return (
          <ItemCatalogueView
            items={items}
            stock={stock}
            loading={loading}
            search={search}
            onSearch={handleSearch}
            onOpenAddModal={() => {
              setAddItemError("");
              setShowAddForm(true);
            }}
            onOpenEditModal={openEditForm}
            onOpenDetailsModal={handleOpenDetails}
            userRole={userRole}
          />
        );

      case "stock":
        return (
          <StockManagementView
            stock={stock}
            movements={movements}
            items={items}
            stockLoading={stockLoading}
            receiptStore={receiptStore}
            setReceiptStore={setReceiptStore}
            receiptItem={receiptItem}
            setReceiptItem={setReceiptItem}
            receiptQuantity={receiptQuantity}
            setReceiptQuantity={setReceiptQuantity}
            receiptMessage={receiptMessage}
            receiptError={receiptError}
            onReceiveStock={handleReceiveStock}

            issueStore={issueStore}
            setIssueStore={setIssueStore}
            issueRequestId={issueRequestId}
            setIssueRequestId={setIssueRequestId}
            issueMessage={issueMessage}
            issueError={issueError}
            onIssueStock={handleIssueStock}

            returnStore={returnStore}
            setReturnStore={setReturnStore}
            returnRequestLineId={returnRequestLineId}
            setReturnRequestLineId={setReturnRequestLineId}
            returnQuantity={returnQuantity}
            setReturnQuantity={setReturnQuantity}
            returnMessage={returnMessage}
            returnError={returnError}
            onReturnStock={handleReturnStock}

            requests={requests}
            defaultTab="overview"
          />
        );

      case "stock-receipt":
        return (
          <StockManagementView
            stock={stock}
            movements={movements}
            items={items}
            stockLoading={stockLoading}
            receiptStore={receiptStore}
            setReceiptStore={setReceiptStore}
            receiptItem={receiptItem}
            setReceiptItem={setReceiptItem}
            receiptQuantity={receiptQuantity}
            setReceiptQuantity={setReceiptQuantity}
            receiptMessage={receiptMessage}
            receiptError={receiptError}
            onReceiveStock={handleReceiveStock}

            issueStore={issueStore}
            setIssueStore={setIssueStore}
            issueRequestId={issueRequestId}
            setIssueRequestId={setIssueRequestId}
            issueMessage={issueMessage}
            issueError={issueError}
            onIssueStock={handleIssueStock}

            returnStore={returnStore}
            setReturnStore={setReturnStore}
            returnRequestLineId={returnRequestLineId}
            setReturnRequestLineId={setReturnRequestLineId}
            returnQuantity={returnQuantity}
            setReturnQuantity={setReturnQuantity}
            returnMessage={returnMessage}
            returnError={returnError}
            onReturnStock={handleReturnStock}

            requests={requests}
            defaultTab="receive"
          />
        );

      case "movements":
        return (
          <StockManagementView
            stock={stock}
            movements={movements}
            items={items}
            stockLoading={stockLoading}
            receiptStore={receiptStore}
            setReceiptStore={setReceiptStore}
            receiptItem={receiptItem}
            setReceiptItem={setReceiptItem}
            receiptQuantity={receiptQuantity}
            setReceiptQuantity={setReceiptQuantity}
            receiptMessage={receiptMessage}
            receiptError={receiptError}
            onReceiveStock={handleReceiveStock}

            issueStore={issueStore}
            setIssueStore={setIssueStore}
            issueRequestId={issueRequestId}
            setIssueRequestId={setIssueRequestId}
            issueMessage={issueMessage}
            issueError={issueError}
            onIssueStock={handleIssueStock}

            returnStore={returnStore}
            setReturnStore={setReturnStore}
            returnRequestLineId={returnRequestLineId}
            setReturnRequestLineId={setReturnRequestLineId}
            returnQuantity={returnQuantity}
            setReturnQuantity={setReturnQuantity}
            returnMessage={returnMessage}
            returnError={returnError}
            onReturnStock={handleReturnStock}

            requests={requests}
            defaultTab="movements"
          />
        );

      case "requests":
      case "request-history":
        return (
          <RequestManagementView
            userRole={userRole}
            items={items}
            requests={requests}
            requestLines={requestLines}
            onRequestLineChange={handleRequestLineChange}
            onAddRequestLine={addRequestLine}
            onRemoveRequestLine={removeRequestLine}
            onCreateRequest={handleCreateRequest}
            onSubmitRequest={handleSubmitRequest}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            requestLoading={requestLoading}
            requestMessage={requestMessage}
            requestError={requestError}
            defaultTab="list"
          />
        );

      case "new-request":
        return (
          <RequestManagementView
            userRole={userRole}
            items={items}
            requests={requests}
            requestLines={requestLines}
            onRequestLineChange={handleRequestLineChange}
            onAddRequestLine={addRequestLine}
            onRemoveRequestLine={removeRequestLine}
            onCreateRequest={handleCreateRequest}
            onSubmitRequest={handleSubmitRequest}
            requestLoading={requestLoading}
            requestMessage={requestMessage}
            requestError={requestError}
            defaultTab="create"
          />
        );

      case "users":
        return <UsersView />;

      case "maintenance":
        return <MaintenanceView dashboard={dashboard} />;

      case "reports":
        return <ReportsView items={items} stock={stock} movements={movements} />;

      case "activity":
        return (
          <StockManagementView
            stock={stock}
            movements={movements}
            items={items}
            stockLoading={stockLoading}
            receiptStore={receiptStore}
            setReceiptStore={setReceiptStore}
            receiptItem={receiptItem}
            setReceiptItem={setReceiptItem}
            receiptQuantity={receiptQuantity}
            setReceiptQuantity={setReceiptQuantity}
            receiptMessage={receiptMessage}
            receiptError={receiptError}
            onReceiveStock={handleReceiveStock}

            issueStore={issueStore}
            setIssueStore={setIssueStore}
            issueRequestId={issueRequestId}
            setIssueRequestId={setIssueRequestId}
            issueMessage={issueMessage}
            issueError={issueError}
            onIssueStock={handleIssueStock}

            returnStore={returnStore}
            setReturnStore={setReturnStore}
            returnRequestLineId={returnRequestLineId}
            setReturnRequestLineId={setReturnRequestLineId}
            returnQuantity={returnQuantity}
            setReturnQuantity={setReturnQuantity}
            returnMessage={returnMessage}
            returnError={returnError}
            onReturnStock={handleReturnStock}

            requests={requests}
            defaultTab="movements"
          />
        );

      case "stock-issue":
        return (
          <StockManagementView
            stock={stock}
            movements={movements}
            items={items}
            stockLoading={stockLoading}
            receiptStore={receiptStore}
            setReceiptStore={setReceiptStore}
            receiptItem={receiptItem}
            setReceiptItem={setReceiptItem}
            receiptQuantity={receiptQuantity}
            setReceiptQuantity={setReceiptQuantity}
            receiptMessage={receiptMessage}
            receiptError={receiptError}
            onReceiveStock={handleReceiveStock}

            issueStore={issueStore}
            setIssueStore={setIssueStore}
            issueRequestId={issueRequestId}
            setIssueRequestId={setIssueRequestId}
            issueMessage={issueMessage}
            issueError={issueError}
            onIssueStock={handleIssueStock}

            returnStore={returnStore}
            setReturnStore={setReturnStore}
            returnRequestLineId={returnRequestLineId}
            setReturnRequestLineId={setReturnRequestLineId}
            returnQuantity={returnQuantity}
            setReturnQuantity={setReturnQuantity}
            returnMessage={returnMessage}
            returnError={returnError}
            onReturnStock={handleReturnStock}

            requests={requests}
            defaultTab="issue"
          />
        );

      case "stock-return":
        return (
          <StockManagementView
            stock={stock}
            movements={movements}
            items={items}
            stockLoading={stockLoading}
            receiptStore={receiptStore}
            setReceiptStore={setReceiptStore}
            receiptItem={receiptItem}
            setReceiptItem={setReceiptItem}
            receiptQuantity={receiptQuantity}
            setReceiptQuantity={setReceiptQuantity}
            receiptMessage={receiptMessage}
            receiptError={receiptError}
            onReceiveStock={handleReceiveStock}

            issueStore={issueStore}
            setIssueStore={setIssueStore}
            issueRequestId={issueRequestId}
            setIssueRequestId={setIssueRequestId}
            issueMessage={issueMessage}
            issueError={issueError}
            onIssueStock={handleIssueStock}

            returnStore={returnStore}
            setReturnStore={setReturnStore}
            returnRequestLineId={returnRequestLineId}
            setReturnRequestLineId={setReturnRequestLineId}
            returnQuantity={returnQuantity}
            setReturnQuantity={setReturnQuantity}
            returnMessage={returnMessage}
            returnError={returnError}
            onReturnStock={handleReturnStock}

            requests={requests}
            defaultTab="return"
          />
        );
      case "stock-issue":
      case "stock-return":
        return (
          <StockManagementView
            stock={stock}
            movements={movements}
            items={items}
            stockLoading={stockLoading}
            receiptStore={receiptStore}
            setReceiptStore={setReceiptStore}
            receiptItem={receiptItem}
            setReceiptItem={setReceiptItem}
            receiptQuantity={receiptQuantity}
            setReceiptQuantity={setReceiptQuantity}
            receiptMessage={receiptMessage}
            receiptError={receiptError}
            onReceiveStock={handleReceiveStock}

            issueStore={issueStore}
            setIssueStore={setIssueStore}
            issueRequestId={issueRequestId}
            setIssueRequestId={setIssueRequestId}
            issueMessage={issueMessage}
            issueError={issueError}
            onIssueStock={handleIssueStock}

            returnStore={returnStore}
            setReturnStore={setReturnStore}
            returnRequestLineId={returnRequestLineId}
            setReturnRequestLineId={setReturnRequestLineId}
            returnQuantity={returnQuantity}
            setReturnQuantity={setReturnQuantity}
            returnMessage={returnMessage}
            returnError={returnError}
            onReturnStock={handleReturnStock}

            requests={requests}
            defaultTab="overview"
          />
        );

      case "settings":
        return (
          <SettingsView
            theme={theme}
            onToggleTheme={toggleTheme}
            userRole={userRole}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <RoleDashboard
            userRole={userRole}
            dashboard={dashboard}
            items={items}
            stock={stock}
            requests={requests}
            movements={movements}
            onNavigate={(target) => setActiveNav(target)}
            onSubmitRequest={handleSubmitRequest}
            onOpenDetails={handleOpenDetails}
          />
        );
    }
  };

  return (
    <div className={`portal-root ${theme}-theme`}>
      <div className="portal-app-layout">
        {/* SIDEBAR */}
        <Sidebar
          userRole={userRole}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pendingCount={Number(dashboard.pendingRequests) || 0}
        />

        {/* MAIN BODY AREA */}
        <div className="portal-main-wrapper">
          {/* TOPBAR */}
          <Topbar
            userRole={userRole}
            activeNav={activeNav}
            onMenuClick={() => setSidebarOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            onNavigate={(target) => setActiveNav(target)}
            dashboard={dashboard}
            searchTerm={search}
            onSearchChange={handleSearch}
          />

          {/* MAIN WORKSPACE CONTENT */}
          <main className="portal-content-area">
            {renderCurrentView()}
          </main>
        </div>
      </div>

      {/* MODAL: ADD ITEM */}
      <ItemModal
        isOpen={showAddForm}
        isEdit={false}
        formData={newItem}
        setFormData={setNewItem}
        errorMessage={addItemError}
        onSave={handleAddItem}
        onClose={() => {
          setShowAddForm(false);
          setAddItemError("");
        }}
      />

      {/* MODAL: EDIT ITEM */}
      <ItemModal
        isOpen={showEditForm}
        isEdit={true}
        formData={editItem}
        setFormData={setEditItem}
        errorMessage={editItemError}
        onSave={handleEditItem}
        onClose={() => {
          setShowEditForm(false);
          setEditItemError("");
        }}
      />

      {/* MODAL: VIEW ITEM DETAILS */}
      <ItemDetailsModal
        item={detailsItem}
        stockRecords={stock}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onEdit={(item) => {
          setShowDetailsModal(false);
          openEditForm(item);
        }}
        userRole={userRole}
      />

      {/* TOAST SYSTEM */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;







