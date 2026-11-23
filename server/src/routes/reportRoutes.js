const express = require("express");
const pool = require("../db");

const router = express.Router();


// STOCK REPORT - JSON
router.get("/stock", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                s.name AS store,
                i.code AS item_code,
                i.name AS item_name,
                i.category,
                i.unit,
                sb.quantity,
                i.reorder_level
            FROM stock_balances sb
            JOIN stores s
                ON sb.store_id = s.id
            JOIN items i
                ON sb.item_id = i.id
            ORDER BY s.name, i.name
        `);

        res.json(rows);

    } catch (error) {
        console.error("Stock report error:", error);

        res.status(500).json({
            message: "Failed to fetch stock report"
        });
    }
});


// STOCK REPORT - CSV
router.get("/stock.csv", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                s.name AS store,
                i.code AS item_code,
                i.name AS item_name,
                i.category,
                i.unit,
                sb.quantity,
                i.reorder_level
            FROM stock_balances sb
            JOIN stores s
                ON sb.store_id = s.id
            JOIN items i
                ON sb.item_id = i.id
            ORDER BY s.name, i.name
        `);

        const headers = [
            "store",
            "item_code",
            "item_name",
            "category",
            "unit",
            "quantity",
            "reorder_level"
        ];

        const csvRows = rows.map(row => {
            return headers.map(header => {
                const value = row[header];

                if (value === null || value === undefined) {
                    return "";
                }

                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(",");
        });

        const csv = [
            headers.join(","),
            ...csvRows
        ].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=stock-report.csv"
        );

        res.send(csv);

    } catch (error) {
        console.error("CSV report error:", error);

        res.status(500).json({
            message: "Failed to generate CSV report"
        });
    }
});


module.exports = router;