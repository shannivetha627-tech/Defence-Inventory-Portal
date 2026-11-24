const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { loginUser } = require("./auth");
const authenticateToken = require("./middleware/authMiddleware");
const requireRole = require("./middleware/roleMiddleware");
const itemRoutes = require("./routes/itemRoutes");
const stockRoutes = require("./routes/stockRoutes");
const requestRoutes = require("./routes/requestRoutes");
const supervisorRoutes = require("./routes/supervisorRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const app = express();

const developmentOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];
const configuredOrigins = (process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = new Set([...developmentOrigins, ...configuredOrigins]);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
    }
}));
app.use(express.json());


// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "Defence Inventory API is running"
    });
});


// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "API is healthy"
    });
});


// ===============================
// DATABASE TEST
// ===============================

app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT DATABASE() AS database_name"
        );

        res.json({
            status: "OK",
            message: "MySQL connection successful",
            database: rows[0].database_name
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "ERROR",
            message: "MySQL connection failed"
        });
    }
});


// ===============================
// LOGIN API
// ===============================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Check user and password
        const result = await loginUser(email, password);

        // Invalid login
        if (!result) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Successful login
        res.json({
            message: "Login successful",
            token: result.token,
            role: result.role,
            userId: result.userId,
            name: result.name
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});


// ===============================
// PROTECTED API
// ===============================

app.get(
    "/api/protected",
    authenticateToken,
    (req, res) => {
        res.json({
            message: "You can access this protected API",
            userId: req.user.userId,
            role: req.user.role
        });
    }
);


// ===============================
// ADMIN ONLY
// ===============================

app.get(
    "/api/admin",
    authenticateToken,
    requireRole("ADMIN"),
    (req, res) => {
        res.json({
            message: "Welcome Admin",
            role: req.user.role
        });
    }
);


// ===============================
// REQUESTER ONLY
// ===============================

app.get(
    "/api/requester",
    authenticateToken,
    requireRole("REQUESTER"),
    (req, res) => {
        res.json({
            message: "Welcome Requester",
            role: req.user.role
        });
    }
);


// ===============================
// SUPERVISOR ONLY
// ===============================

app.get(
    "/api/supervisor",
    authenticateToken,
    requireRole("SUPERVISOR"),
    (req, res) => {
        res.json({
            message: "Welcome Supervisor",
            role: req.user.role
        });
    }
);


// ===============================
// STOREKEEPER ONLY
// ===============================

app.get(
    "/api/storekeeper",
    authenticateToken,
    requireRole("STOREKEEPER"),
    (req, res) => {
        res.json({
            message: "Welcome Storekeeper",
            role: req.user.role
        });
    }
);


// ===============================
// ITEM CATALOGUE ROUTES
// ===============================

app.use(
    "/api/items",
    authenticateToken,
    itemRoutes
);
app.use("/api/stock", authenticateToken, stockRoutes);
app.use("/api/requests", authenticateToken, requestRoutes);
app.use("/api/supervisor", authenticateToken, supervisorRoutes);
app.use("/api/maintenance", authenticateToken, maintenanceRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/reports", authenticateToken, reportRoutes);

// ===============================
// START SERVER
// ===============================

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
