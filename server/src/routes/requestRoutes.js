const express = require("express");
const pool = require("../db");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// CREATE REQUEST
// REQUESTER ONLY
// ==========================================
router.post("/", requireRole("REQUESTER"), async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one item is required",
      });
    }

    for (const item of items) {
      if (
        !item.item_id ||
        !Number.isInteger(Number(item.requested_qty)) ||
        Number(item.requested_qty) <= 0
      ) {
        return res.status(400).json({
          message: "Each item must have a valid quantity",
        });
      }
    }

    await connection.beginTransaction();

    const [requestResult] = await connection.query(
      `INSERT INTO requests
             (requester_id, status)
             VALUES (?, 'DRAFT')`,
      [req.user.userId],
    );

    const requestId = requestResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO request_lines
                 (request_id, item_id, requested_qty)
                 VALUES (?, ?, ?)`,
        [requestId, item.item_id, Number(item.requested_qty)],
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Request created successfully",
      requestId,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create request error:", error);

    res.status(500).json({
      message: "Failed to create request",
    });
  } finally {
    connection.release();
  }
});

// ==========================================
// GET REQUESTS
// REQUESTER + SUPERVISOR
// ==========================================
router.get("/", requireRole("REQUESTER", "SUPERVISOR", "STOREKEEPER"), async (req, res) => {
  try {
    let query = `
                SELECT
                    r.id,
                    r.requester_id,
                    u.name AS requester_name,
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
                JOIN users u
                    ON r.requester_id = u.id
            `;

    const params = [];

    if (req.user.role === "REQUESTER") {
      query += `
                    WHERE r.requester_id = ?
                `;

      params.push(req.user.userId);
    }

    query += `
                ORDER BY r.id DESC
            `;

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error("Fetch requests error:", error);

    res.status(500).json({
      message: "Failed to fetch requests",
    });
  }
});

// ==========================================
// SUBMIT REQUEST
// REQUESTER ONLY
// ==========================================
router.post("/:id/submit", requireRole("REQUESTER"), async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await pool.query(
      `SELECT id, status
             FROM requests
             WHERE id = ?
             AND requester_id = ?`,
      [id, req.user.userId],
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (requests[0].status !== "DRAFT") {
      return res.status(409).json({
        message: "Only draft requests can be submitted",
      });
    }

    const [lines] = await pool.query(
      `SELECT id
             FROM request_lines
             WHERE request_id = ?`,
      [id],
    );

    if (lines.length === 0) {
      return res.status(400).json({
        message: "Cannot submit an empty request",
      });
    }

    await pool.query(
      `UPDATE requests
             SET status = 'SUBMITTED'
             WHERE id = ?`,
      [id],
    );

    res.json({
      message: "Request submitted successfully",
      requestId: Number(id),
      status: "SUBMITTED",
    });
  } catch (error) {
    console.error("Submit request error:", error);

    res.status(500).json({
      message: "Failed to submit request",
    });
  }
});

// ==========================================
// APPROVE REQUEST
// SUPERVISOR ONLY
// ==========================================
router.post("/:id/approve", requireRole("SUPERVISOR"), async (req, res) => {
  try {
    const { id } = req.params;
    const { decision_note } = req.body;

    const [requests] = await pool.query(
      `SELECT id, status
             FROM requests
             WHERE id = ?`,
      [id],
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (requests[0].status !== "SUBMITTED") {
      return res.status(409).json({
        message: "Only submitted requests can be approved",
      });
    }

    await pool.query(
      `UPDATE requests
             SET status = 'APPROVED',
                 supervisor_id = ?,
                 decision_note = ?
             WHERE id = ?`,
      [req.user.userId, decision_note || "Approved by supervisor", id],
    );

    res.json({
      message: "Request approved successfully",
      requestId: Number(id),
      status: "APPROVED",
    });
  } catch (error) {
    console.error("Approve request error:", error);

    res.status(500).json({
      message: "Failed to approve request",
    });
  }
});

// ==========================================
// REJECT REQUEST
// SUPERVISOR ONLY
// ==========================================
router.post("/:id/reject", requireRole("SUPERVISOR"), async (req, res) => {
  try {
    const { id } = req.params;
    const { decision_note } = req.body;

    if (!decision_note || !decision_note.trim()) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const [requests] = await pool.query(
      `SELECT id, status
             FROM requests
             WHERE id = ?`,
      [id],
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (requests[0].status !== "SUBMITTED") {
      return res.status(409).json({
        message: "Only submitted requests can be rejected",
      });
    }

    await pool.query(
      `UPDATE requests
             SET status = 'REJECTED',
                 supervisor_id = ?,
                 decision_note = ?
             WHERE id = ?`,
      [req.user.userId, decision_note.trim(), id],
    );

    res.json({
      message: "Request rejected successfully",
      requestId: Number(id),
      status: "REJECTED",
    });
  } catch (error) {
    console.error("Reject request error:", error);

    res.status(500).json({
      message: "Failed to reject request",
    });
  }
});

module.exports = router;

