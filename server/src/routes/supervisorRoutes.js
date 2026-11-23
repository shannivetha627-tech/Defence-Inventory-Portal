const express = require("express");
const pool = require("../db");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();


// GET SUBMITTED REQUESTS
router.get("/pending", requireRole("SUPERVISOR"), async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                r.id AS request_id,
                r.status,
                r.requester_id,
                u.name AS requester_name,
                rl.id AS line_id,
                i.code AS item_code,
                i.name AS item_name,
                rl.requested_qty
            FROM requests r
            JOIN users u
                ON r.requester_id = u.id
            JOIN request_lines rl
                ON r.id = rl.request_id
            JOIN items i
                ON rl.item_id = i.id
            WHERE r.status = 'SUBMITTED'
            ORDER BY r.id DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error("Pending requests error:", error);

        res.status(500).json({
            message: "Failed to fetch pending requests"
        });
    }
});


// APPROVE OR REJECT REQUEST
router.post("/:id/decision", requireRole("SUPERVISOR"), async (req, res) => {
    try {
        const { id } = req.params;
        const { decision, decision_note } = req.body;

        if (!["APPROVED", "REJECTED"].includes(decision)) {
            return res.status(400).json({
                message: "Decision must be APPROVED or REJECTED"
            });
        }

        const [requests] = await pool.query(
            `SELECT id, status
             FROM requests
             WHERE id = ?`,
            [id]
        );

        if (requests.length === 0) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (requests[0].status !== "SUBMITTED") {
            return res.status(409).json({
                message: "Only submitted requests can be decided"
            });
        }

        await pool.query(
            `UPDATE requests
             SET status = ?,
                 supervisor_id = ?,
                 decision_note = ?
             WHERE id = ?`,
            [
                decision,
                req.user.userId,
                decision_note || null,
                id
            ]
        );

        res.json({
            message: `Request ${decision.toLowerCase()} successfully`,
            requestId: Number(id),
            status: decision
        });

    } catch (error) {
        console.error("Request decision error:", error);

        res.status(500).json({
            message: "Failed to process request decision"
        });
    }
});


module.exports = router;