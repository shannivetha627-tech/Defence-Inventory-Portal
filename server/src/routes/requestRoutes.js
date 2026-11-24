const express = require("express");
const pool = require("../db");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

const DEPARTMENT_CATEGORIES = {
  "IT & Software Team": "IT & Computer Equipment",
  "Maintenance Team": "Tools & Maintenance Equipment",
  "Electrical Team": "Electrical & Power Supplies",
  "Safety Team": "Safety & Protective Equipment",
  "Administration Team": "Office & Administrative Supplies",
  "Vehicle Maintenance Team": "Vehicle Maintenance Supplies",
  "Medical Support Team": "Medical & First-Aid Supplies",
  "Facilities Team": "Facility & General Maintenance",
  "Logistics Team": "Packaging & Storage Materials",
};

async function writeAudit(connection, actorId, action, requestId, details) {
  await connection.query(
    `INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, details)
     VALUES (?, 'REQUEST', ?, ?, ?)`,
    [actorId, requestId, action, JSON.stringify(details)],
  );
}

async function notify(connection, userId, requestId, type, message) {
  await connection.query(
    `INSERT INTO notifications (user_id, request_id, type, message)
     VALUES (?, ?, ?, ?)`,
    [userId, requestId, type, message],
  );
}

router.post("/", requireRole("REQUESTER"), async (req, res) => {
  const { items, purpose, expected_return_date: expectedReturnDate } = req.body;
  if (!Array.isArray(items) || !items.length || typeof purpose !== "string" || !purpose.trim() || !expectedReturnDate) {
    return res.status(400).json({ message: "Items, purpose, and expected return date are required" });
  }
  if (items.some((item) => !item || !Number.isInteger(Number(item.requested_qty)) || Number(item.requested_qty) <= 0 || !Number.isInteger(Number(item.item_id)))) {
    return res.status(400).json({ message: "Each item must have a valid item and positive whole-number quantity" });
  }
  const parsedReturnDate = new Date(`${expectedReturnDate}T00:00:00.000Z`);
  const todayUtc = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expectedReturnDate) || Number.isNaN(parsedReturnDate.valueOf()) || parsedReturnDate.toISOString().slice(0, 10) !== expectedReturnDate || expectedReturnDate < todayUtc) {
    return res.status(400).json({ message: "Expected return date must be today or a valid future date" });
  }
  if (purpose.trim().length > 1000 || items.some((item) => Number(item.item_id) <= 0) || new Set(items.map((item) => Number(item.item_id))).size !== items.length) {
    return res.status(400).json({ message: "Purpose must be 1,000 characters or fewer and each item may appear only once" });
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      `SELECT id, employee_id, department, designation, role, active, authorized_category
       FROM users WHERE id = ?`,
      [req.user.userId],
    );
    const requester = users[0];
    if (!requester || !requester.employee_id || !requester.department || !requester.active || requester.role !== "REQUESTER") {
      return res.status(403).json({ message: "A valid active requester profile is required" });
    }
    const departmentCategory = DEPARTMENT_CATEGORIES[requester.department];
    if (!departmentCategory || requester.authorized_category !== departmentCategory) {
      return res.status(403).json({ message: "Requester department authorization is not valid" });
    }

    await connection.beginTransaction();
    for (const line of items) {
      const [catalogue] = await connection.query(
        "SELECT id, authorized_category FROM items WHERE id = ? AND active = TRUE",
        [Number(line.item_id)],
      );
      if (!catalogue.length || catalogue[0].authorized_category !== requester.authorized_category) {
        await connection.rollback();
        return res.status(403).json({ message: "One or more items are outside your authorized category" });
      }
    }

    const [created] = await connection.query(
      `INSERT INTO requests (requester_id, status, purpose, expected_return_date)
       VALUES (?, 'DRAFT', ?, ?)`,
      [requester.id, purpose.trim(), expectedReturnDate],
    );
    for (const line of items) {
      await connection.query(
        "INSERT INTO request_lines (request_id, item_id, requested_qty) VALUES (?, ?, ?)",
        [created.insertId, Number(line.item_id), Number(line.requested_qty)],
      );
    }
    await writeAudit(connection, requester.id, "REQUEST_CREATED", created.insertId, { employeeId: requester.employee_id, purpose: purpose.trim() });
    await connection.commit();
    return res.status(201).json({ message: "Request created successfully", requestId: created.insertId });
  } catch (error) {
    await connection.rollback();
    console.error("Create request error:", error);
    return res.status(500).json({ message: "Failed to create request" });
  } finally {
    connection.release();
  }
});

router.get("/notifications", requireRole("REQUESTER", "SUPERVISOR", "STOREKEEPER", "ADMIN"), async (req, res) => {
  try {
    const [notifications] = await pool.query(
      `SELECT id, request_id, type, message, created_at, read_at
       FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
      [req.user.userId],
    );
    return res.json(notifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

router.patch("/notifications/:id/read", requireRole("REQUESTER", "SUPERVISOR", "STOREKEEPER", "ADMIN"), async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND read_at IS NULL",
      [req.params.id, req.user.userId],
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Unread notification not found" });
    return res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({ message: "Failed to update notification" });
  }
});

router.get("/", requireRole("REQUESTER", "SUPERVISOR", "STOREKEEPER"), async (req, res) => {
  try {
    let query = `SELECT r.id, r.requester_id, u.employee_id, u.name AS requester_name,
      u.department, r.status, r.purpose, r.expected_return_date, r.decision_note,
      r.supervisor_id, r.decision_at, rl.id AS line_id, rl.item_id,
      i.code AS item_code, i.name AS item_name, i.authorized_category,
      rl.requested_qty, rl.issued_qty
      FROM requests r JOIN request_lines rl ON r.id = rl.request_id
      JOIN items i ON rl.item_id = i.id JOIN users u ON r.requester_id = u.id`;
    const params = [];
    if (req.user.role === "REQUESTER") {
      query += " WHERE r.requester_id = ?";
      params.push(req.user.userId);
    }
    query += " ORDER BY r.id DESC";
    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    console.error("Fetch requests error:", error);
    return res.status(500).json({ message: "Failed to fetch requests" });
  }
});

router.post("/:id/submit", requireRole("REQUESTER"), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT r.id, r.status, r.purpose, r.expected_return_date, u.id AS requester_id,
       u.employee_id, u.department, u.designation, u.role, u.active, u.authorized_category
       FROM requests r JOIN users u ON u.id = r.requester_id
       WHERE r.id = ? AND r.requester_id = ? FOR UPDATE`,
      [req.params.id, req.user.userId],
    );
    const dossier = rows[0];
    if (!dossier) {
      await connection.rollback();
      return res.status(404).json({ message: "Request not found" });
    }
    if (dossier.status !== "DRAFT") {
      await connection.rollback();
      return res.status(409).json({ message: "Only draft requests can be submitted" });
    }
    const [lines] = await connection.query(
      `SELECT rl.requested_qty, i.authorized_category FROM request_lines rl
       JOIN items i ON i.id = rl.item_id WHERE rl.request_id = ?`,
      [dossier.id],
    );
    if (!lines.length || !dossier.purpose?.trim() || !dossier.expected_return_date) {
      await connection.rollback();
      return res.status(400).json({ message: "A request with items, purpose, and return date is required" });
    }
    const departmentValid = Boolean(DEPARTMENT_CATEGORIES[dossier.department]);
    const roleValid = dossier.role === "REQUESTER";
    const categoryAuthorized = departmentValid && dossier.authorized_category === DEPARTMENT_CATEGORIES[dossier.department]
      && lines.every((line) => line.authorized_category === dossier.authorized_category);
    const quantityValid = lines.every((line) => Number.isInteger(Number(line.requested_qty)) && Number(line.requested_qty) > 0);
    const accountActive = Boolean(dossier.active);
    const employeeExists = Boolean(dossier.employee_id);
    const verified = employeeExists && accountActive && departmentValid && roleValid && categoryAuthorized && quantityValid;
    const verificationStatus = verified ? "VERIFIED" : "FAILED";

    await connection.query(
      `INSERT INTO requester_verifications
       (request_id, requester_id, employee_exists, account_active, department_valid,
        role_valid, category_authorized, identity_status, verification_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE employee_exists = VALUES(employee_exists),
       account_active = VALUES(account_active), department_valid = VALUES(department_valid),
       role_valid = VALUES(role_valid), category_authorized = VALUES(category_authorized),
       identity_status = VALUES(identity_status), verification_status = VALUES(verification_status),
       verified_at = CURRENT_TIMESTAMP`,
      [dossier.id, dossier.requester_id, employeeExists, accountActive, departmentValid, roleValid, categoryAuthorized, verificationStatus, verificationStatus],
    );
    await writeAudit(connection, dossier.requester_id, "REQUESTER_VERIFIED", dossier.id, { employeeId: dossier.employee_id, verificationStatus });
    if (!verified) {
      await connection.commit();
      return res.status(403).json({ message: "Requester or category verification failed; request was not submitted", verificationStatus });
    }
    await connection.query("UPDATE requests SET status = 'SUBMITTED' WHERE id = ? AND status = 'DRAFT'", [dossier.id]);
    await writeAudit(connection, dossier.requester_id, "REQUEST_SUBMITTED", dossier.id, { employeeId: dossier.employee_id });
    const [supervisors] = await connection.query("SELECT id FROM users WHERE role = 'SUPERVISOR' AND active = TRUE");
    for (const supervisor of supervisors) await notify(connection, supervisor.id, dossier.id, "REQUEST_SUBMITTED", `New request #${dossier.id} is ready for review`);
    await connection.commit();
    return res.json({ message: "Request submitted successfully", requestId: Number(dossier.id), status: "SUBMITTED", verificationStatus });
  } catch (error) {
    await connection.rollback();
    console.error("Submit request error:", error);
    return res.status(500).json({ message: "Failed to submit request" });
  } finally {
    connection.release();
  }
});

router.get("/:id/requester-review", requireRole("SUPERVISOR"), async (req, res) => {
  try {
    const [requests] = await pool.query(
      `SELECT r.id, r.status, r.purpose, r.expected_return_date, r.created_at,
       r.decision_note, r.decision_at, u.id AS requester_id, u.employee_id,
       u.name AS requester_name, u.email, u.department, u.designation, u.role,
       u.active, u.authorized_category, rl.id AS line_id, rl.item_id,
       rl.requested_qty, rl.issued_qty, i.code AS item_code, i.name AS item_name,
       i.category AS catalogue_category, i.authorized_category AS item_authorized_category,
       i.reorder_level, COALESCE(sb.quantity, 0) AS available_stock,
       v.employee_exists, v.account_active, v.department_valid, v.role_valid,
       v.category_authorized, v.verification_status, v.verified_at
       FROM requests r JOIN users u ON u.id = r.requester_id
       JOIN request_lines rl ON rl.request_id = r.id JOIN items i ON i.id = rl.item_id
       LEFT JOIN requester_verifications v ON v.request_id = r.id
       LEFT JOIN (SELECT item_id, SUM(quantity) AS quantity FROM stock_balances GROUP BY item_id) sb ON sb.item_id = i.id
       WHERE r.id = ? ORDER BY rl.id`,
      [req.params.id],
    );
    if (!requests.length) return res.status(404).json({ message: "Request not found" });
    const first = requests[0];
    const [history] = await pool.query(
      `SELECT r.id, r.status, r.purpose, r.created_at, r.decision_note, r.decision_at,
       i.name AS item_name, i.authorized_category AS category, rl.requested_qty
       FROM requests r JOIN request_lines rl ON rl.request_id = r.id
       JOIN items i ON i.id = rl.item_id WHERE r.requester_id = ?
       ORDER BY r.id DESC`, [first.requester_id],
    );
    const [assets] = await pool.query(
      `SELECT aa.id, i.name AS item_name, i.authorized_category AS category,
       aa.assigned_at, aa.expected_return_date, aa.status
       FROM asset_assignments aa JOIN items i ON i.id = aa.item_id
       WHERE aa.requester_id = ? ORDER BY aa.assigned_at DESC`, [first.requester_id],
    );
    const [accountability] = await pool.query(
      `SELECT
        SUM(CASE WHEN r.status = 'ISSUED' THEN 1 ELSE 0 END) AS currently_issued,
        SUM(CASE WHEN r.status = 'ISSUED' AND rl.issued_qty > COALESCE(ret.returned_qty, 0) THEN 1 ELSE 0 END) AS outstanding_returns,
        SUM(CASE WHEN r.status = 'ISSUED' AND r.expected_return_date < CURDATE() AND rl.issued_qty > COALESCE(ret.returned_qty, 0) THEN 1 ELSE 0 END) AS late_returns,
        SUM(CASE WHEN aa.status IN ('DAMAGED','MAINTENANCE') THEN 1 ELSE 0 END) AS damaged_assets
       FROM requests r JOIN request_lines rl ON rl.request_id = r.id
       LEFT JOIN (SELECT request_line_id, SUM(quantity) AS returned_qty FROM stock_movements WHERE type IN ('RETURN','DAMAGED_RETURN') GROUP BY request_line_id) ret ON ret.request_line_id = rl.id
       LEFT JOIN asset_assignments aa ON aa.request_line_id = rl.id
       WHERE r.requester_id = ?`, [first.requester_id],
    );
    const [counts] = await pool.query(
      `SELECT COUNT(DISTINCT r.id) AS total,
       COUNT(DISTINCT CASE WHEN r.status IN ('DRAFT','SUBMITTED') THEN r.id END) AS pending,
       COUNT(DISTINCT CASE WHEN r.status = 'APPROVED' THEN r.id END) AS approved,
       COUNT(DISTINCT CASE WHEN r.status = 'REJECTED' THEN r.id END) AS rejected,
       COUNT(DISTINCT CASE WHEN r.status = 'ISSUED' THEN r.id END) AS issued,
       COUNT(DISTINCT CASE WHEN r.status = 'CLOSED' THEN r.id END) AS closed
       FROM requests r WHERE r.requester_id = ?`, [first.requester_id],
    );
    const lines = requests.map((row) => ({
      lineId: row.line_id, itemId: row.item_id, itemCode: row.item_code,
      itemName: row.item_name, category: row.item_authorized_category,
      requestedQuantity: row.requested_qty, issuedQuantity: row.issued_qty,
      availableStock: row.available_stock, minimumStock: row.reorder_level,
      lowStock: Number(row.available_stock) < Number(row.reorder_level),
      itemAuthorized: row.item_authorized_category === row.authorized_category,
    }));
    const warnings = [];
    if (assets.some((asset) => asset.status === "ACTIVE" && lines.some((line) => line.category === asset.category))) warnings.push("Requester has active equipment in this category");
    if (Number(accountability[0]?.outstanding_returns) > 0) warnings.push("Requester has an outstanding return");
    if (Number(accountability[0]?.damaged_assets) > 0) warnings.push("Previous damaged or maintenance asset recorded");
    if (lines.some((line) => line.lowStock)) warnings.push("Available stock is below the minimum level");
    return res.json({
      request: { id: first.id, status: first.status, purpose: first.purpose, expectedReturnDate: first.expected_return_date, createdAt: first.created_at, decisionNote: first.decision_note, decisionAt: first.decision_at, lines },
      requester: { id: first.requester_id, employeeId: first.employee_id, name: first.requester_name, email: first.email, department: first.department, designation: first.designation, role: first.role, active: Boolean(first.active), authorizedCategory: first.authorized_category },
      verification: { employeeExists: Boolean(first.employee_exists), accountActive: Boolean(first.account_active), departmentValid: Boolean(first.department_valid), roleValid: Boolean(first.role_valid), categoryAuthorized: Boolean(first.category_authorized), status: first.verification_status, verifiedAt: first.verified_at },
      history: { counts: counts[0], requests: history }, assets,
      accountability: accountability[0] || {}, warnings,
      validation: { requestSubmitted: first.status === "SUBMITTED", requesterVerified: first.verification_status === "VERIFIED", categoryAuthorized: lines.every((line) => line.itemAuthorized), quantityValid: lines.every((line) => Number(line.requestedQuantity) > 0), stockAvailable: lines.every((line) => Number(line.availableStock) >= Number(line.requestedQuantity)) },
    });
  } catch (error) {
    console.error("Requester review dossier error:", error);
    return res.status(500).json({ message: "Failed to load requester review dossier" });
  }
});

async function decideRequest(req, res, decision) {
  const note = typeof req.body.decision_note === "string" ? req.body.decision_note.trim() : "";
  if (!note && decision === "REJECTED") return res.status(400).json({ message: "Rejection reason is required" });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT r.id, r.status, r.requester_id, u.employee_id, u.active, u.role,
       u.department, u.authorized_category, v.verification_status
       FROM requests r JOIN users u ON u.id = r.requester_id
       LEFT JOIN requester_verifications v ON v.request_id = r.id
       WHERE r.id = ? FOR UPDATE`, [req.params.id],
    );
    const request = rows[0];
    if (!request) { await connection.rollback(); return res.status(404).json({ message: "Request not found" }); }
    if (request.status !== "SUBMITTED") { await connection.rollback(); return res.status(409).json({ message: "Only submitted requests can be decided" }); }
    if (!request.active || request.role !== "REQUESTER" || !request.employee_id || !DEPARTMENT_CATEGORIES[request.department] || request.authorized_category !== DEPARTMENT_CATEGORIES[request.department] || request.verification_status !== "VERIFIED") {
      await connection.rollback();
      return res.status(409).json({ message: "Requester verification is not valid; this request cannot be decided" });
    }
    const [lines] = await connection.query(
      `SELECT rl.item_id, rl.requested_qty, i.authorized_category, COALESCE(sb.quantity, 0) AS available_stock
       FROM request_lines rl JOIN items i ON i.id = rl.item_id
       LEFT JOIN (SELECT item_id, SUM(quantity) AS quantity FROM stock_balances GROUP BY item_id) sb ON sb.item_id = i.id
       WHERE rl.request_id = ?`, [request.id],
    );
    if (!lines.length || lines.some((line) => Number(line.requested_qty) <= 0 || line.authorized_category !== request.authorized_category)) {
      await connection.rollback();
      return res.status(409).json({ message: "Request items or quantities failed validation" });
    }
    if (decision === "APPROVED" && lines.some((line) => Number(line.available_stock) < Number(line.requested_qty))) {
      await connection.rollback();
      return res.status(409).json({ message: "Insufficient stock for one or more requested items; refresh the dossier before approving" });
    }
    const [result] = await connection.query(
      `UPDATE requests SET status = ?, supervisor_id = ?, decision_note = ?, decision_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'SUBMITTED'`,
      [decision, req.user.userId, note || "Approved by supervisor", request.id],
    );
    if (!result.affectedRows) { await connection.rollback(); return res.status(409).json({ message: "Request status changed; reload and try again" }); }
    await writeAudit(connection, req.user.userId, decision === "APPROVED" ? "REQUEST_APPROVED" : "REQUEST_REJECTED", request.id, { employeeId: request.employee_id, decision, note });
    await notify(connection, request.requester_id, request.id, decision === "APPROVED" ? "REQUEST_APPROVED" : "REQUEST_REJECTED", decision === "APPROVED" ? `Request #${request.id} was approved` : `Request #${request.id} was rejected: ${note}`);
    if (decision === "APPROVED") {
      const [storekeepers] = await connection.query("SELECT id FROM users WHERE role = 'STOREKEEPER' AND active = TRUE");
      for (const storekeeper of storekeepers) await notify(connection, storekeeper.id, request.id, "REQUEST_READY_FOR_ISSUE", `Approved request #${request.id} is ready for issue`);
    }
    await connection.commit();
    return res.json({ message: `Request ${decision.toLowerCase()} successfully`, requestId: Number(request.id), status: decision });
  } catch (error) {
    await connection.rollback();
    console.error("Request decision error:", error);
    return res.status(500).json({ message: "Failed to process request decision" });
  } finally { connection.release(); }
}

router.post("/:id/approve", requireRole("SUPERVISOR"), (req, res) => decideRequest(req, res, "APPROVED"));
router.post("/:id/reject", requireRole("SUPERVISOR"), (req, res) => decideRequest(req, res, "REJECTED"));
router.post("/:id/clarification", requireRole("SUPERVISOR"), async (req, res) => {
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ message: "Clarification message is required" });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query("SELECT id, requester_id, status FROM requests WHERE id = ? FOR UPDATE", [req.params.id]);
    if (!rows.length) { await connection.rollback(); return res.status(404).json({ message: "Request not found" }); }
    if (rows[0].status !== "SUBMITTED") { await connection.rollback(); return res.status(409).json({ message: "Only submitted requests can be clarified" }); }
    await connection.query("UPDATE requests SET clarification_message = ?, clarification_at = CURRENT_TIMESTAMP WHERE id = ?", [message, rows[0].id]);
    await writeAudit(connection, req.user.userId, "REQUEST_CLARIFICATION_REQUESTED", rows[0].id, { message });
    await notify(connection, rows[0].requester_id, rows[0].id, "CLARIFICATION_REQUESTED", `Clarification requested for request #${rows[0].id}: ${message}`);
    await connection.commit();
    return res.json({ message: "Clarification requested", requestId: Number(rows[0].id) });
  } catch (error) {
    await connection.rollback();
    console.error("Request clarification error:", error);
    return res.status(500).json({ message: "Failed to request clarification" });
  } finally { connection.release(); }
});

module.exports = router;
