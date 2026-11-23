const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        // Low stock items
        const [lowStock] = await pool.query(`
            SELECT
                sb.store_id,
                sb.item_id,
                s.name AS store_name,
                i.code AS item_code,
                i.name AS item_name,
                sb.quantity,
                i.reorder_level
            FROM stock_balances sb
            JOIN stores s ON sb.store_id = s.id
            JOIN items i ON sb.item_id = i.id
            WHERE sb.quantity <= i.reorder_level
            ORDER BY sb.quantity ASC
        `);

        // Pending requests
        const [pendingRows] = await pool.query(`
            SELECT COUNT(*) AS count
            FROM requests
            WHERE status = 'SUBMITTED'
        `);

        // Overdue maintenance
        const [overdueRows] = await pool.query(`
            SELECT COUNT(*) AS count
            FROM maintenance_tickets
            WHERE due_date < CURDATE()
            AND status != 'RESOLVED'
        `);

        // Recent stock movements
        const [recentMovements] = await pool.query(`
    SELECT
        sm.id,
        sm.store_id,
        sm.item_id,
        s.name AS store_name,
        i.code AS item_code,
        i.name AS item_name,
        sm.type,
        sm.quantity,
        sm.actor_id,
        u.name AS actor_name,
        sm.created_at
    FROM stock_movements sm
    JOIN stores s ON sm.store_id = s.id
    JOIN items i ON sm.item_id = i.id
    LEFT JOIN users u ON sm.actor_id = u.id
    ORDER BY sm.id DESC
    LIMIT 10
`);

        res.json({
            lowStock,
            pendingRequests: pendingRows[0].count,
            overdueMaintenance: overdueRows[0].count,
            recentMovements
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Failed to fetch dashboard data"
        });
    }
});

module.exports = router;