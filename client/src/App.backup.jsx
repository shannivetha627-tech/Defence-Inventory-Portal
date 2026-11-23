import { useEffect, useState } from "react";
import "./App.css";

function App() {
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

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // ==========================
  // ADD ITEM STATES
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

  // ==========================
  // SEARCH STATE
  // ==========================

  const [search, setSearch] = useState("");

  // ==========================
  // EDIT ITEM STATES
  // ==========================

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

  // ==========================
  // LOGIN
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
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setUserRole(data.role);

      setLoggedIn(true);

    } catch (error) {
      console.error(error);
      setLoginError("Unable to connect to server");
    }
  };

  // ==========================
  // FETCH ITEMS
  // ==========================

  useEffect(() => {
    if (!loggedIn) {
      return;
    }
    fetchDashboard();
    fetchStock();
    fetchMovements();

    const fetchItems = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:3000/api/items",
          {
            headers: {
              Authorization: `Bearer ${token} `
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
        console.error("Error fetching items:", error);

      } finally {
        setLoading(false);
      }
    };

    fetchItems();

  }, [loggedIn]);

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

    // Check required fields
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

    // Check reorder level
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

      // If backend returns error
      if (!response.ok) {
        setAddItemError(
          data.message || "Failed to create item"
        );
        return;
      }

      // Close form
      setShowAddForm(false);

      // Clear form
      setNewItem({
        code: "",
        name: "",
        category: "",
        unit: "",
        reorder_level: ""
      });

      // Fetch updated items
      const itemsResponse = await fetch(
        "http://localhost:3000/api/items",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const itemsData = await itemsResponse.json();

      setItems(itemsData);

      // Clear search
      setSearch("");

    } catch (error) {
      console.error(error);

      setAddItemError(
        "Unable to connect to server"
      );
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

    // Check required fields
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

    // Check reorder level
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

      // If backend returns error
      if (!response.ok) {
        setEditItemError(
          data.message || "Failed to update item"
        );
        return;
      }

      // Close edit form
      setShowEditForm(false);

      // Clear edit data
      setEditItem({
        id: "",
        code: "",
        name: "",
        category: "",
        unit: "",
        reorder_level: ""
      });

      // Fetch updated items
      const itemsResponse = await fetch(
        "http://localhost:3000/api/items",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const itemsData = await itemsResponse.json();

      setItems(itemsData);

      // Clear search
      setSearch("");

    } catch (error) {
      console.error("Edit item error:", error);

      setEditItemError(
        "Unable to connect to server"
      );
    }
  };

  // ==========================
  // FETCH STOCK BALANCES
  // ==========================

  const fetchStock = async () => {
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
  };


  // ==========================
  // FETCH MOVEMENT HISTORY
  // ==========================

  const fetchMovements = async () => {
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
  };


  // ==========================
  // RECEIVE STOCK
  // ==========================

  const handleReceiveStock = async () => {

    setReceiptMessage("");
    setReceiptError("");

    if (!receiptQuantity || Number(receiptQuantity) <= 0) {
      setReceiptError("Quantity must be greater than 0");
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
        setReceiptError(
          data.message || "Failed to receive stock"
        );
        return;
      }

      setReceiptMessage(
        `Stock received successfully: ${data.quantity} ${data.quantity === 1 ? "unit" : "units"}`
      );

      setReceiptQuantity("");

      await fetchStock();
      await fetchMovements();

    } catch (error) {

      console.error("Receive stock error:", error);

      setReceiptError(
        "Unable to connect to server"
      );

    } finally {

      setStockLoading(false);

    }
  };
  // ==========================
  // FETCH DASHBOARD
  // ==========================

  const fetchDashboard = async () => {
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

      // Fetch stock movements because this API already
      // provides the correct actor name
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

      // Create a lookup of movement ID -> actor name
      const actorMap = {};

      movementsData.forEach((movement) => {
        actorMap[movement.id] = movement.actor;
      });

      // Add actor_name to dashboard movements
      const updatedRecentMovements =
        dashboardData.recentMovements.map((movement) => ({
          ...movement,
          actor_name:
            movement.actor_name ||
            actorMap[movement.id] ||
            "Unknown"
        }));

      setDashboard({
        ...dashboardData,
        recentMovements: updatedRecentMovements
      });

    } catch (error) {
      console.error("Dashboard fetch error:", error);

      setDashboardError(
        "Unable to connect to server"
      );

    } finally {
      setDashboardLoading(false);
    }
  };

  // ==========================
  // REQUEST MANAGEMENT
  // ==========================

  const [requestLines, setRequestLines] = useState([
    { item_id: "", requested_qty: "" }
  ]);
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  const fetchRequests = async () => {
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
  };

  const handleRequestLineChange = (index, field, value) => {
    setRequestLines((current) =>
      current.map((line, i) =>
        i === index
          ? { ...line, [field]: value }
          : line
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
        return;
      }
    }

    const itemIds = requestLines.map((line) => line.item_id);
    if (new Set(itemIds).size !== itemIds.length) {
      setRequestError("The same item cannot be added twice");
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
        return;
      }

      setRequestMessage(`Request #${data.requestId} created successfully as DRAFT`);
      setRequestLines([{ item_id: "", requested_qty: "" }]);
      await fetchRequests();

    } catch (error) {
      console.error("Create request error:", error);
      setRequestError("Unable to connect to server");

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
        return;
      }

      setRequestMessage(`Request #${requestId} submitted successfully`);
      await fetchRequests();

    } catch (error) {
      console.error("Submit request error:", error);
      setRequestError("Unable to connect to server");
    }
  };

  useEffect(() => {
    if (!loggedIn || userRole !== "REQUESTER") {
      return;
    }

    fetchRequests();
  }, [loggedIn, userRole]);

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
  };

  // ==========================
  // LOGIN PAGE
  // ==========================

  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-card">

          <h1>Defence Inventory Portal</h1>

          <h2>Login</h2>

          <form onSubmit={handleLogin}>

            <label>Email</label>

            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
                setLoginError("");
              }}
              placeholder="Enter your email"
            />

            {emailError && (
              <p className="error-message">
                {emailError}
              </p>
            )}

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
                setLoginError("");
              }}
              placeholder="Enter your password"
            />

            {passwordError && (
              <p className="error-message">
                {passwordError}
              </p>
            )}

            {loginError && (
              <p className="error-message login-error">
                {loginError}
              </p>
            )}

            <div className="forgot-password">

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Password reset feature will be implemented soon."
                  )
                }
              >
                Forgot Password?
              </button>

            </div>

            <button
              type="submit"
              className="login-button"
            >
              Login
            </button>

          </form>

        </div>

      </div>
    );
  }

  // ==========================
  // ITEM CATALOGUE
  // ==========================

  return (
    <div className="app">

      <header className="header">

        <div>

          <h1>Defence Inventory Portal</h1>

          <p>Inventory & Maintenance Management</p>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="container">

        {/* ==========================
            DASHBOARD
        ========================== */}

        <section className="dashboard-section">

          <div className="dashboard-heading">
            <div>
              <h2>Dashboard</h2>
              <p className="dashboard-subtitle">
                Inventory and maintenance overview
              </p>
            </div>
          </div>

          {dashboardLoading && (
            <p className="loading">Loading dashboard...</p>
          )}

          {dashboardError && (
            <p className="error-message">
              {dashboardError}
            </p>
          )}

          {!dashboardLoading && !dashboardError && (
            <>
              {/* SUMMARY CARDS */}
              <div className="dashboard-cards">

                <div className="dashboard-card">
                  <h3>Low Stock</h3>
                  <p>{dashboard.lowStock.length}</p>
                  <span>Items below reorder level</span>
                </div>

                <div className="dashboard-card">
                  <h3>Pending Requests</h3>
                  <p>{dashboard.pendingRequests}</p>
                  <span>Requests awaiting approval</span>
                </div>

                <div className="dashboard-card">
                  <h3>Overdue Maintenance</h3>
                  <p>{dashboard.overdueMaintenance}</p>
                  <span>Maintenance tickets overdue</span>
                </div>

              </div>

              {/* LOW STOCK */}
              <div className="dashboard-panel">

                <h3>Low Stock Items</h3>

                {dashboard.lowStock.length === 0 ? (
                  <p>No low stock items.</p>
                ) : (
                  <div className="table-card dashboard-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Store</th>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Reorder Level</th>
                        </tr>
                      </thead>

                      <tbody>
                        {dashboard.lowStock.map((item) => (
                          <tr key={`${item.store_id}-${item.item_id}`}>
                            <td>{item.store_name}</td>
                            <td>{item.item_name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.reorder_level}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

              {/* RECENT STOCK MOVEMENTS */}
              <div className="dashboard-panel">

                <h3>Recent Stock Movements</h3>

                {dashboard.recentMovements.length === 0 ? (
                  <p>No recent movements.</p>
                ) : (
                  <div className="table-card dashboard-table">
                    <table>
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
                        {dashboard.recentMovements.map((movement) => (
                          <tr key={movement.id}>
                            <td>{movement.store_name}</td>
                            <td>
                              {movement.item_code} - {movement.item_name}
                            </td>
                            <td>
                              <span className="status active">
                                {movement.type}
                              </span>
                            </td>
                            <td>{movement.quantity}</td>
                            <td>{movement.actor_name || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </>
          )}

        </section>

        {/* ==========================
            ITEM CATALOGUE
        ========================== */}

        <div className="page-header">

          <div>
            <h2>Item Catalogue</h2>
            <p>Manage inventory items</p>
          </div>

          <button
            className="add-button"
            onClick={() => {
              setShowAddForm(true);
              setAddItemError("");
              setShowEditForm(false);
            }}
          >
            + Add Item
          </button>

        </div>

        {/* ==========================
            ADD ITEM FORM
        ========================== */}

        {showAddForm && (

          <div className="add-form-card">

            <h3>Add New Item</h3>

            {addItemError && (
              <p className="error-message">
                {addItemError}
              </p>
            )}

            <div className="form-grid">

              {/* ITEM CODE */}

              <div>

                <label>Item Code</label>

                <input
                  type="text"
                  placeholder="Example: ITM002"
                  value={newItem.code}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      code: e.target.value
                    })
                  }
                />

              </div>

              {/* ITEM NAME */}

              <div>

                <label>Item Name</label>

                <input
                  type="text"
                  placeholder="Example: Printer"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      name: e.target.value
                    })
                  }
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label>Category</label>

                <input
                  type="text"
                  placeholder="Example: Electronics"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      category: e.target.value
                    })
                  }
                />

              </div>

              {/* UNIT */}

              <div>

                <label>Unit</label>

                <input
                  type="text"
                  placeholder="Example: pcs"
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      unit: e.target.value
                    })
                  }
                />

              </div>

              {/* REORDER LEVEL */}

              <div>

                <label>Reorder Level</label>

                <input
                  type="number"
                  min="0"
                  placeholder="Example: 5"
                  value={newItem.reorder_level}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      reorder_level: e.target.value
                    })
                  }
                />

              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="form-actions">

              <button
                className="save-button"
                onClick={handleAddItem}
              >
                Save Item
              </button>

              <button
                className="cancel-button"
                onClick={() => {
                  setShowAddForm(false);
                  setAddItemError("");
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        )}

        {/* ==========================
            EDIT ITEM FORM
        ========================== */}

        {showEditForm && (

          <div className="add-form-card">

            <h3>Edit Item</h3>

            {editItemError && (
              <p className="error-message">
                {editItemError}
              </p>
            )}

            <div className="form-grid">

              {/* ITEM CODE */}

              <div>

                <label>Item Code</label>

                <input
                  type="text"
                  placeholder="Example: ITM002"
                  value={editItem.code}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      code: e.target.value
                    })
                  }
                />

              </div>

              {/* ITEM NAME */}

              <div>

                <label>Item Name</label>

                <input
                  type="text"
                  placeholder="Example: Printer"
                  value={editItem.name}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      name: e.target.value
                    })
                  }
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label>Category</label>

                <input
                  type="text"
                  placeholder="Example: Electronics"
                  value={editItem.category}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      category: e.target.value
                    })
                  }
                />

              </div>

              {/* UNIT */}

              <div>

                <label>Unit</label>

                <input
                  type="text"
                  placeholder="Example: pcs"
                  value={editItem.unit}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      unit: e.target.value
                    })
                  }
                />

              </div>

              {/* REORDER LEVEL */}

              <div>

                <label>Reorder Level</label>

                <input
                  type="number"
                  min="0"
                  placeholder="Example: 5"
                  value={editItem.reorder_level}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      reorder_level: e.target.value
                    })
                  }
                />

              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="form-actions">

              <button
                className="save-button"
                onClick={handleEditItem}
              >
                Update Item
              </button>

              <button
                className="cancel-button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditItemError("");
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        )}

        {/* ==========================
            SEARCH
        ========================== */}

        <div className="search-box">

          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={handleSearch}
          />

        </div>

        {/* ==========================
            TABLE
        ========================== */}

        <div className="table-card">

          {loading ? (

            <p className="loading">
              Loading items...
            </p>

          ) : (

            <table>

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

                {items.length === 0 ? (

                  <tr>

                    <td colSpan="7">
                      No items found
                    </td>

                  </tr>

                ) : (

                  items.map((item) => (

                    <tr key={item.id}>

                      <td>
                        {item.code}
                      </td>

                      <td>
                        {item.name}
                      </td>

                      <td>
                        {item.category}
                      </td>

                      <td>
                        {item.unit}
                      </td>

                      <td>
                        {item.reorder_level}
                      </td>

                      <td>

                        <span className="status active">
                          Active
                        </span>

                      </td>

                      <td>

                        <button
                          className="edit-button"
                          onClick={() => {
                            openEditForm(item);
                            setShowAddForm(false);
                          }}
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          )}

        </div>


        {/* ==========================
            STOCK MANAGEMENT
        ========================== */}

        <section className="stock-section">

          <div className="page-header">

            <div>

              <h2>Stock Management</h2>

              <p>
                Receive stock and view stock movement history
              </p>

            </div>

          </div>


          {/* RECEIVE STOCK FORM */}

          <div className="add-form-card">

            <h3>Receive Stock</h3>

            {receiptError && (
              <p className="error-message">
                {receiptError}
              </p>
            )}

            {receiptMessage && (
              <p style={{ color: "green", marginTop: "10px" }}>
                {receiptMessage}
              </p>
            )}

            <div className="form-grid">

              <div>

                <label>Store</label>

                <select
                  value={receiptStore}
                  onChange={(e) =>
                    setReceiptStore(e.target.value)
                  }
                >

                  <option value="1">
                    Central Store
                  </option>

                  <option value="2">
                    Workshop Store
                  </option>

                  <option value="3">
                    Office Store
                  </option>

                </select>

              </div>


              <div>

                <label>Item</label>

                <select
                  value={receiptItem}
                  onChange={(e) =>
                    setReceiptItem(e.target.value)
                  }
                >

                  {items.map((item) => (

                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.code} - {item.name}
                    </option>

                  ))}

                </select>

              </div>


              <div>

                <label>Quantity</label>

                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={receiptQuantity}
                  onChange={(e) =>
                    setReceiptQuantity(e.target.value)
                  }
                />

              </div>

            </div>


            <div className="form-actions">

              <button
                className="save-button"
                onClick={handleReceiveStock}
                disabled={stockLoading}
              >
                {stockLoading
                  ? "Receiving..."
                  : "Receive Stock"}
              </button>

            </div>

          </div>


          {/* CURRENT STOCK */}

          <div className="table-card">

            <h3>Current Stock</h3>

            {stockLoading && stock.length === 0 ? (

              <p className="loading">
                Loading stock...
              </p>

            ) : (

              <table>

                <thead>

                  <tr>

                    <th>Store</th>
                    <th>Item Code</th>
                    <th>Item</th>
                    <th>Unit</th>
                    <th>Quantity</th>

                  </tr>

                </thead>

                <tbody>

                  {stock.length === 0 ? (

                    <tr>

                      <td colSpan="5">
                        No stock records found
                      </td>

                    </tr>

                  ) : (

                    stock.map((row) => (

                      <tr key={row.id}>

                        <td>
                          {row.store}
                        </td>

                        <td>
                          {row.item_code}
                        </td>

                        <td>
                          {row.item_name}
                        </td>

                        <td>
                          {row.unit}
                        </td>

                        <td>
                          {row.quantity}
                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            )}

          </div>


          {/* MOVEMENT HISTORY */}

          <div className="table-card">

            <h3>Stock Movement History</h3>

            {movements.length === 0 ? (

              <p>
                No stock movements found
              </p>

            ) : (

              <table>

                <thead>

                  <tr>

                    <th>ID</th>
                    <th>Store</th>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Actor</th>
                    <th>Date</th>

                  </tr>

                </thead>

                <tbody>

                  {movements.map((movement) => (

                    <tr key={movement.id}>

                      <td>
                        {movement.id}
                      </td>

                      <td>
                        {movement.store}
                      </td>

                      <td>
                        {movement.item_code} - {movement.item_name}
                      </td>

                      <td>
                        <span className="status active">
                          {movement.type}
                        </span>
                      </td>

                      <td>
                        {movement.quantity}
                      </td>

                      <td>
                        {movement.actor}
                      </td>

                      <td>
                        {new Date(
                          movement.created_at
                        ).toLocaleString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </section>
        {/* ==========================
            REQUEST MANAGEMENT
        ========================== */}

        {userRole === "REQUESTER" && (
          <section className="stock-section">

            <div className="page-header">
              <div>
                <h2>Request Management</h2>
                <p>Create multi-item requests and submit them for approval</p>
              </div>
            </div>

            <div className="add-form-card">
              <h3>Create Request</h3>

              {requestError && (
                <p className="error-message">
                  {requestError}
                </p>
              )}

              {requestMessage && (
                <p style={{ color: "green", marginTop: "10px" }}>
                  {requestMessage}
                </p>
              )}

              {requestLines.map((line, index) => (
                <div className="form-grid" key={index} style={{ marginBottom: "12px" }}>

                  <div>
                    <label>Item</label>
                    <select
                      value={line.item_id}
                      onChange={(e) =>
                        handleRequestLineChange(index, "item_id", e.target.value)
                      }
                    >
                      <option value="">Select item</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} - {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter quantity"
                      value={line.requested_qty}
                      onChange={(e) =>
                        handleRequestLineChange(index, "requested_qty", e.target.value)
                      }
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "end" }}>
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => removeRequestLine(index)}
                      disabled={requestLines.length === 1}
                    >
                      Remove
                    </button>
                  </div>

                </div>
              ))}

              <div className="form-actions">
                <button
                  type="button"
                  className="edit-button"
                  onClick={addRequestLine}
                >
                  + Add Another Item
                </button>

                <button
                  type="button"
                  className="save-button"
                  onClick={handleCreateRequest}
                  disabled={requestLoading}
                >
                  {requestLoading ? "Creating..." : "Create Request"}
                </button>
              </div>
            </div>

            <div className="table-card">
              <h3>My Requests</h3>

              {requests.length === 0 ? (
                <p>No requests found</p>
              ) : (
                <table>
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
                    {requests.map((request) => (
                      <tr key={request.line_id}>
                        <td>{request.id}</td>
                        <td>{request.item_code} - {request.item_name}</td>
                        <td>{request.requested_qty}</td>
                        <td>
                          <span className="status active">
                            {request.status}
                          </span>
                        </td>
                        <td>
                          {request.status === "DRAFT" && (
                            <button
                              className="save-button"
                              onClick={() => handleSubmitRequest(request.id)}
                            >
                              Submit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </section>
        )}


      </main>

    </div>
  );
}

export default App;