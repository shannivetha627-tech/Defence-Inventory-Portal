const express = require("express");
const pool = require("../db");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

async function logStockAction(connection, actorId, requestId, action, details) {
    await connection.query(
        `INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, details)
         VALUES (?, 'REQUEST', ?, ?, ?)`,
        [actorId, requestId, action, JSON.stringify(details)]
    );
}

async function notifyUser(connection, userId, requestId, type, message) {
    await connection.query(
        `INSERT INTO notifications (user_id, request_id, type, message) VALUES (?, ?, ?, ?)`,
        [userId, requestId, type, message]
    );
}

// ==========================
// RECEIVE STOCK
// ==========================

router.post("/receipts", requireRole("STOREKEEPER"), async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const {
            store_id,
            item_id,
            quantity
        } = req.body;


        // Check required fields
        if (
            !store_id ||
            !item_id ||
            quantity === undefined
        ) {
            return res.status(400).json({
                message: "Store, item and quantity are required"
            });
        }


        // Check quantity
        if (
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) <= 0
        ) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }


        await connection.beginTransaction();


        // Check whether stock balance already exists
        const [stockRows] = await connection.query(
            `SELECT id, quantity
             FROM stock_balances
             WHERE store_id = ?
             AND item_id = ?
             FOR UPDATE`,
            [store_id, item_id]
        );


        if (stockRows.length === 0) {

            // Create new stock balance
            await connection.query(
                `INSERT INTO stock_balances
                 (store_id, item_id, quantity)
                 VALUES (?, ?, ?)`,
                [store_id, item_id, Number(quantity)]
            );

        } else {

            // Increase existing stock
            await connection.query(
                `UPDATE stock_balances
                 SET quantity = quantity + ?
                 WHERE id = ?`,
                [Number(quantity), stockRows[0].id]
            );

        }


        // Record stock movement
        await connection.query(
            `INSERT INTO stock_movements
             (store_id, item_id, type, quantity, actor_id)
             VALUES (?, ?, 'RECEIPT', ?, ?)`,
            [
                store_id,
                item_id,
                Number(quantity),
                req.user.userId
            ]
        );


        await connection.commit();


        res.status(201).json({
            message: "Stock received successfully",
            quantity: Number(quantity)
        });


    } catch (error) {

        await connection.rollback();

        console.error("Stock receipt error:", error);

        res.status(500).json({
            message: "Failed to receive stock"
        });

    } finally {

        connection.release();

    }

});


// ==========================
// GET STOCK MOVEMENT HISTORY
// ==========================

router.get("/movements", async (req, res) => {

    try {

        const [rows] = await pool.query(`
            SELECT
                sm.id,
                s.name AS store,
                i.code AS item_code,
                i.name AS item_name,
                sm.type,
                sm.quantity,
                u.name AS actor,
                sm.created_at
            FROM stock_movements sm
            JOIN stores s
                ON sm.store_id = s.id
            JOIN items i
                ON sm.item_id = i.id
            JOIN users u
                ON sm.actor_id = u.id
            ORDER BY sm.id DESC
        `);


        res.json(rows);


    } catch (error) {

        console.error("Movement history error:", error);

        res.status(500).json({
            message: "Failed to fetch stock movements"
        });

    }

});
// GET CURRENT STOCK BALANCES
router.get("/balances", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                sb.id,
                s.name AS store,
                i.code AS item_code,
                i.name AS item_name,
                i.unit,
                sb.quantity
            FROM stock_balances sb
            JOIN stores s
                ON sb.store_id = s.id
            JOIN items i
                ON sb.item_id = i.id
            ORDER BY sb.id DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error("Stock balance error:", error);

        res.status(500).json({
            message: "Failed to fetch stock balances"
        });
    }
});
// ISSUE APPROVED REQUEST
router.post("/issue/:requestId", requireRole("STOREKEEPER"), async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { requestId } = req.params;
        const { store_id } = req.body;

        if (!Number.isInteger(Number(store_id)) || Number(store_id) <= 0) {
            return res.status(400).json({ message: "A valid store is required" });
        }

        await connection.beginTransaction();

        // 1. Check request and lock it
        const [requestRows] = await connection.query(
            `SELECT r.id, r.requester_id, r.expected_return_date, r.status,
                    r.supervisor_id, r.decision_at, u.employee_id, u.active,
                    u.role, u.department, u.authorized_category, v.verification_status
             FROM requests r
             JOIN users u ON u.id = r.requester_id
             LEFT JOIN requester_verifications v ON v.request_id = r.id
             WHERE r.id = ?
             FOR UPDATE`,
            [requestId]
        );

        if (requestRows.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (requestRows[0].status !== "APPROVED" || !requestRows[0].supervisor_id || !requestRows[0].decision_at) {
            await connection.rollback();

            return res.status(409).json({
                message: "Only supervisor-approved requests can be issued"
            });
        }

        const requester = requestRows[0];
        const categoryByDepartment = {
            "IT & Software Team": "IT & Computer Equipment",
            "Maintenance Team": "Tools & Maintenance Equipment",
            "Electrical Team": "Electrical & Power Supplies",
            "Safety Team": "Safety & Protective Equipment",
            "Administration Team": "Office & Administrative Supplies",
            "Vehicle Maintenance Team": "Vehicle Maintenance Supplies",
            "Medical Support Team": "Medical & First-Aid Supplies",
            "Facilities Team": "Facility & General Maintenance",
            "Logistics Team": "Packaging & Storage Materials"
        };
        if (!requester.active || requester.role !== "REQUESTER" || !requester.employee_id ||
            requester.verification_status !== "VERIFIED" ||
            requester.authorized_category !== categoryByDepartment[requester.department]) {
            await connection.rollback();
            return res.status(409).json({ message: "Requester identity or category verification failed" });
        }

        // 2. Get request items
        const [lines] = await connection.query(
            `SELECT
                rl.id AS request_line_id,
                rl.item_id,
                rl.requested_qty,
                rl.issued_qty,
                i.name AS item_name,
                i.authorized_category
             FROM request_lines rl
             JOIN items i
                ON rl.item_id = i.id
             WHERE rl.request_id = ?`,
            [requestId]
        );

        if (lines.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Request has no items"
            });
        }
        if (lines.some((line) => !Number.isInteger(Number(line.requested_qty)) || Number(line.requested_qty) <= 0 || Number(line.issued_qty) !== 0 || line.authorized_category !== requester.authorized_category)) {
            await connection.rollback();
            return res.status(409).json({ message: "Request line quantity, authorization, or issue status is invalid" });
        }

        // 3. Check stock for every requested item
        for (const line of lines) {
            const [stockRows] = await connection.query(
                `SELECT id, quantity
                 FROM stock_balances
                 WHERE store_id = ?
                 AND item_id = ?
                 FOR UPDATE`,
                [store_id, line.item_id]
            );

            if (stockRows.length === 0) {
                await connection.rollback();

                return res.status(409).json({
                    message: `No stock available for ${line.item_name}`
                });
            }

            const availableStock = stockRows[0].quantity;
            const requestedQuantity = line.requested_qty;

            if (availableStock < requestedQuantity) {
                await connection.rollback();

                return res.status(409).json({
                    message:
                        `Insufficient stock for ${line.item_name}. ` +
                        `Available: ${availableStock}, Requested: ${requestedQuantity}`
                });
            }
        }

        // 4. Deduct stock + create ISSUE movement
        for (const line of lines) {
            const [stockRows] = await connection.query(
                `SELECT id, quantity
                 FROM stock_balances
                 WHERE store_id = ?
                 AND item_id = ?
                 FOR UPDATE`,
                [store_id, line.item_id]
            );

            const stockId = stockRows[0].id;

            await connection.query(
                `UPDATE stock_balances
                 SET quantity = quantity - ?
                 WHERE id = ?`,
                [
                    line.requested_qty,
                    stockId
                ]
            );

            await connection.query(
                `INSERT INTO stock_movements
                 (store_id, item_id, request_line_id, type, quantity, actor_id)
                 VALUES (?, ?, ?, 'ISSUE', ?, ?)`,
                [
                    store_id,
                    line.item_id,
                    line.request_line_id,
                    line.requested_qty,
                    req.user.userId
                ]
            );

            await connection.query(
                `UPDATE request_lines
                 SET issued_qty = ?
                 WHERE id = ?`,
                [line.requested_qty, line.request_line_id]
            );

            await connection.query(
                `INSERT INTO asset_assignments
                 (request_line_id, requester_id, item_id, assigned_by, expected_return_date)
                 VALUES (?, ?, ?, ?, ?)`,
                [line.request_line_id, requestRows[0].requester_id, line.item_id, req.user.userId, requestRows[0].expected_return_date]
            );
        }

        // 5. Mark request as ISSUED
        await connection.query(
            `UPDATE requests
             SET status = 'ISSUED'
             WHERE id = ?`,
            [requestId]
        );

        await logStockAction(connection, req.user.userId, Number(requestId), "REQUEST_ISSUED", { storeId: Number(store_id), lineCount: lines.length });
        await notifyUser(connection, requester.requester_id, Number(requestId), "REQUEST_ISSUED", `Request #${requestId} was issued; return by ${requester.expected_return_date || "the agreed date"}`);

        // 6. Commit everything
        await connection.commit();

        res.json({
            message: "Request issued successfully",
            requestId: Number(requestId),
            status: "ISSUED"
        });

    } catch (error) {

        await connection.rollback();

        console.error("Stock issue error:", error);

        res.status(500).json({
            message: "Failed to issue request"
        });

    } finally {
        connection.release();
    }
});
// RETURN ISSUED ITEM
router.post("/returns", requireRole("STOREKEEPER"), async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            store_id,
            request_line_id,
            quantity,
            return_condition = "GOOD",
            condition_note = ""
        } = req.body;

        if (!Number.isInteger(Number(store_id)) || Number(store_id) <= 0 || !Number.isInteger(Number(request_line_id)) || Number(request_line_id) <= 0 || quantity === undefined) {
            return res.status(400).json({
                message: "Store, request line and quantity are required"
            });
        }

        if (
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) <= 0
        ) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }
        const normalizedConditionNote = typeof condition_note === "string" ? condition_note.trim() : "";
        if (!['GOOD', 'DAMAGED', 'MAINTENANCE'].includes(return_condition) ||
            (return_condition !== 'GOOD' && !normalizedConditionNote)) {
            return res.status(400).json({ message: "Select a valid return condition and provide a note for damaged items" });
        }

        await connection.beginTransaction();

        // 1. Check request line
        const [lineRows] = await connection.query(
            `SELECT
                rl.id,
                rl.item_id,
                rl.issued_qty,
                r.id AS request_id,
                r.requester_id,
                r.expected_return_date,
                r.status AS request_status,
                i.name AS item_name
             FROM request_lines rl
             JOIN requests r
                ON rl.request_id = r.id
             JOIN items i
                ON rl.item_id = i.id
             WHERE rl.id = ?
             FOR UPDATE`,
            [request_line_id]
        );

        if (lineRows.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Request line not found"
            });
        }

        const line = lineRows[0];

        if (line.request_status !== "ISSUED") {
            await connection.rollback();

            return res.status(409).json({
                message: "Only issued requests can have returns"
            });
        }

        // 2. Calculate already returned quantity
        const [returnRows] = await connection.query(
            `SELECT COALESCE(SUM(quantity), 0) AS returned_qty
             FROM stock_movements
             WHERE request_line_id = ?
             AND type IN ('RETURN','DAMAGED_RETURN')`,
            [request_line_id]
        );

        const alreadyReturned = Number(returnRows[0].returned_qty);
        const outstandingQuantity =
            Number(line.issued_qty) - alreadyReturned;

        // 3. Prevent excessive return and ambiguous partial damaged-asset state
        if (Number(quantity) > outstandingQuantity || (return_condition !== "GOOD" && Number(quantity) !== outstandingQuantity)) {
            await connection.rollback();

            return res.status(409).json({
                message: Number(quantity) > outstandingQuantity
                    ? `Return quantity exceeds outstanding quantity. Outstanding: ${outstandingQuantity}`
                    : `For damaged or maintenance returns, return the full outstanding quantity (${outstandingQuantity}) in one transaction.`
            });
        }

        // 4. Lock stock balance
        const [stockRows] = await connection.query(
            `SELECT id, quantity
             FROM stock_balances
             WHERE store_id = ?
             AND item_id = ?
             FOR UPDATE`,
            [store_id, line.item_id]
        );

        if (stockRows.length === 0) {
            await connection.rollback();

            return res.status(409).json({
                message: "Stock balance not found"
            });
        }

        // Damaged equipment is quarantined rather than returned to usable stock.
        if (return_condition === "GOOD") {
            await connection.query(
                `UPDATE stock_balances SET quantity = quantity + ? WHERE id = ?`,
                [Number(quantity), stockRows[0].id]
            );
        }

        const movementType = return_condition === "GOOD" ? "RETURN" : "DAMAGED_RETURN";
        await connection.query(
            `INSERT INTO stock_movements
             (store_id, item_id, request_line_id, type, quantity, actor_id, condition_note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [store_id, line.item_id, request_line_id, movementType, Number(quantity), req.user.userId, normalizedConditionNote]
        );

        const totalReturned = alreadyReturned + Number(quantity);
        if (totalReturned >= Number(line.issued_qty)) {
            const assetStatus = return_condition === "DAMAGED" ? "DAMAGED" : return_condition === "MAINTENANCE" ? "MAINTENANCE" : "RETURNED";
            await connection.query(
                `UPDATE asset_assignments SET status = ?, returned_at = CURRENT_TIMESTAMP WHERE request_line_id = ?`,
                [assetStatus, request_line_id]
            );
        }
        if (return_condition !== "GOOD") {
            const [maintenanceAssignees] = await connection.query(
                "SELECT id FROM users WHERE active = TRUE AND (department = 'Maintenance Team' OR role = 'STOREKEEPER') ORDER BY department = 'Maintenance Team' DESC, id LIMIT 1"
            );
            await connection.query(
                `INSERT INTO maintenance_tickets (item_id, asset_tag, assigned_user_id, due_date, status, description)
                 VALUES (?, NULL, ?, COALESCE(?, CURDATE()), 'OPEN', ?)`,
                [line.item_id, maintenanceAssignees[0]?.id || null, line.expected_return_date, normalizedConditionNote]
            );
        }
        await logStockAction(connection, req.user.userId, line.request_id, "ASSET_RETURN_RECORDED", {
            requestLineId: Number(request_line_id), quantity: Number(quantity), condition: return_condition,
            note: normalizedConditionNote
        });
        await notifyUser(connection, line.requester_id, line.request_id, "ASSET_RETURN_RECORDED",
            return_condition === "GOOD" ? `Item returned for request #${line.request_id}` : `Item returned as ${return_condition.toLowerCase()} for request #${line.request_id}`);
        if (return_condition !== "GOOD") {
            const [storekeepers] = await connection.query("SELECT id FROM users WHERE role = 'STOREKEEPER' AND active = TRUE");
            for (const storekeeper of storekeepers) await notifyUser(connection, storekeeper.id, line.request_id, "ASSET_MAINTENANCE", `Returned item requires attention: ${line.item_name}`);
        }
        const [outstandingLines] = await connection.query(
            `SELECT COUNT(*) AS count FROM request_lines rl
             LEFT JOIN (SELECT request_line_id, SUM(quantity) AS returned_qty FROM stock_movements WHERE type IN ('RETURN','DAMAGED_RETURN') GROUP BY request_line_id) returns_total ON returns_total.request_line_id = rl.id
             WHERE rl.request_id = ? AND rl.issued_qty > COALESCE(returns_total.returned_qty, 0)`,
            [line.request_id]
        );
        if (Number(outstandingLines[0].count) === 0) {
            await connection.query(`UPDATE requests SET status = 'CLOSED' WHERE id = (SELECT request_id FROM request_lines WHERE id = ?)`, [request_line_id]);
        }

        await connection.commit();

        res.status(201).json({
            message: "Item returned successfully",
            requestLineId: Number(request_line_id),
            quantity: Number(quantity)
        });

    } catch (error) {
        await connection.rollback();

        console.error("Stock return error:", error);

        res.status(500).json({
            message: "Failed to return item"
        });

    } finally {
        connection.release();
    }
});
module.exports = router;
