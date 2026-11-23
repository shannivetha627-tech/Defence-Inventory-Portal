const express = require("express");
const pool = require("../db");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();


// CREATE REQUEST
router.post("/", requireRole("REQUESTER"), async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "At least one item is required"
            });
        }

        for (const item of items) {
            if (
                !item.item_id ||
                !Number.isInteger(Number(item.requested_qty)) ||
                Number(item.requested_qty) <= 0
            ) {
                return res.status(400).json({
                    message: "Each item must have a valid quantity"
                });
            }
        }

        await connection.beginTransaction();

        const [requestResult] = await connection.query(
            `INSERT INTO requests
             (requester_id, status)
             VALUES (?, 'DRAFT')`,
            [req.user.userId]
        );

        const requestId = requestResult.insertId;

        for (const item of items) {
            await connection.query(
                `INSERT INTO request_lines
                 (request_id, item_id, requested_qty)
                 VALUES (?, ?, ?)`,
                [
                    requestId,
                    item.item_id,
                    Number(item.requested_qty)
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Request created successfully",
            requestId
        });

    } catch (error) {
        await connection.rollback();

        console.error("Create request error:", error);

        res.status(500).json({
            message: "Failed to create request"
        });

    } finally {
        connection.release();
    }
});


// GET REQUESTS OF LOGGED-IN REQUESTER
router.get("/", requireRole("REQUESTER"), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                r.id,
                r.status,
                r.decision_note,
                r.supervisor_id,
                rl.id AS line_id,
                rl.item_id,
                i.code AS item_code,
                i.name AS item_name,
                rl.requested_qty,
                rl.issued_qty
             FROM requests r
             JOIN request_lines rl
                ON r.id = rl.request_id
             JOIN items i
                ON rl.item_id = i.id
             WHERE r.requester_id = ?
             ORDER BY r.id DESC`,
            [req.user.userId]
        );

        res.json(rows);

    } catch (error) {
        console.error("Fetch requests error:", error);

        res.status(500).json({
            message: "Failed to fetch requests"
        });
    }
});


// SUBMIT REQUEST
router.post("/:id/submit", requireRole("REQUESTER"), async (req, res) => {
    try {
        const { id } = req.params;

        const [requests] = await pool.query(
            `SELECT id, status
             FROM requests
             WHERE id = ?
             AND requester_id = ?`,
            [id, req.user.userId]
        );

        if (requests.length === 0) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (requests[0].status !== "DRAFT") {
            return res.status(409).json({
                message: "Only draft requests can be submitted"
            });
        }

        const [lines] = await pool.query(
            `SELECT id
             FROM request_lines
             WHERE request_id = ?`,
            [id]
        );

        if (lines.length === 0) {
            return res.status(400).json({
                message: "Cannot submit an empty request"
            });
        }

        await pool.query(
            `UPDATE requests
             SET status = 'SUBMITTED'
             WHERE id = ?`,
            [id]
        );

        res.json({
            message: "Request submitted successfully",
            requestId: Number(id),
            status: "SUBMITTED"
        });

    } catch (error) {
        console.error("Submit request error:", error);

        res.status(500).json({
            message: "Failed to submit request"
        });
    }
});


module.exports = router;