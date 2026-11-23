const express = require("express");
const pool = require("../db");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// GET ALL MAINTENANCE TICKETS
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                mt.id,
                mt.item_id,
                i.code AS item_code,
                i.name AS item_name,
                mt.asset_tag,
                mt.due_date,
                mt.status,
                mt.resolution
            FROM maintenance_tickets mt
            JOIN items i
                ON mt.item_id = i.id
            ORDER BY mt.id DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error("Maintenance fetch error:", error);

        res.status(500).json({
            message: "Failed to fetch maintenance tickets"
        });
    }
});


// CREATE MAINTENANCE TICKET
router.post("/", requireRole("ADMIN"), async (req, res) => {
    try {
        const {
            item_id,
            asset_tag,
            due_date
        } = req.body;

        if (!item_id || !due_date) {
            return res.status(400).json({
                message: "Item and due date are required"
            });
        }

        const [itemRows] = await pool.query(
            `SELECT id
             FROM items
             WHERE id = ?
             AND active = TRUE`,
            [item_id]
        );

        if (itemRows.length === 0) {
            return res.status(404).json({
                message: "Active item not found"
            });
        }

        await pool.query(
            `INSERT INTO maintenance_tickets
             (item_id, asset_tag, due_date, status)
             VALUES (?, ?, ?, 'OPEN')`,
            [
                item_id,
                asset_tag || null,
                due_date
            ]
        );

        res.status(201).json({
            message: "Maintenance ticket created successfully"
        });

    } catch (error) {
        console.error("Maintenance create error:", error);

        res.status(500).json({
            message: "Failed to create maintenance ticket"
        });
    }
});


// UPDATE MAINTENANCE TICKET
router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
    try {
        const { id } = req.params;

        const {
            status,
            resolution,
            due_date
        } = req.body;

        const allowedStatuses = [
            "OPEN",
            "IN_PROGRESS",
            "RESOLVED"
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid maintenance status"
            });
        }

        const [ticketRows] = await pool.query(
            `SELECT id
             FROM maintenance_tickets
             WHERE id = ?`,
            [id]
        );

        if (ticketRows.length === 0) {
            return res.status(404).json({
                message: "Maintenance ticket not found"
            });
        }

        await pool.query(
            `UPDATE maintenance_tickets
             SET
                status = COALESCE(?, status),
                resolution = COALESCE(?, resolution),
                due_date = COALESCE(?, due_date)
             WHERE id = ?`,
            [
                status || null,
                resolution || null,
                due_date || null,
                id
            ]
        );

        res.json({
            message: "Maintenance ticket updated successfully"
        });

    } catch (error) {
        console.error("Maintenance update error:", error);

        res.status(500).json({
            message: "Failed to update maintenance ticket"
        });
    }
});

module.exports = router;