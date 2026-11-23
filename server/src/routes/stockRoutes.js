const express = require("express");
const pool = require("../db");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================
// RECEIVE STOCK
// ==========================

router.post("/receipts", async (req, res) => {

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

        if (!store_id) {
            return res.status(400).json({
                message: "Store is required"
            });
        }

        await connection.beginTransaction();

        // 1. Check request and lock it
        const [requestRows] = await connection.query(
            `SELECT id, status
             FROM requests
             WHERE id = ?
             FOR UPDATE`,
            [requestId]
        );

        if (requestRows.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Request not found"
            });
        }

        if (requestRows[0].status !== "APPROVED") {
            await connection.rollback();

            return res.status(409).json({
                message: "Only approved requests can be issued"
            });
        }

        // 2. Get request items
        const [lines] = await connection.query(
            `SELECT
                rl.id AS request_line_id,
                rl.item_id,
                rl.requested_qty,
                rl.issued_qty,
                i.name AS item_name
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
                [
                    line.requested_qty,
                    line.request_line_id
                ]
            );
        }

        // 5. Mark request as ISSUED
        await connection.query(
            `UPDATE requests
             SET status = 'ISSUED'
             WHERE id = ?`,
            [requestId]
        );

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
            quantity
        } = req.body;

        if (!store_id || !request_line_id || quantity === undefined) {
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

        await connection.beginTransaction();

        // 1. Check request line
        const [lineRows] = await connection.query(
            `SELECT
                rl.id,
                rl.item_id,
                rl.issued_qty,
                r.status,
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

        if (line.status !== "ISSUED") {
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
             AND type = 'RETURN'`,
            [request_line_id]
        );

        const alreadyReturned = Number(returnRows[0].returned_qty);
        const outstandingQuantity =
            Number(line.issued_qty) - alreadyReturned;

        // 3. Prevent excessive return
        if (Number(quantity) > outstandingQuantity) {
            await connection.rollback();

            return res.status(409).json({
                message:
                    `Return quantity exceeds outstanding quantity. ` +
                    `Outstanding: ${outstandingQuantity}`
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

        // 5. Increase stock
        await connection.query(
            `UPDATE stock_balances
             SET quantity = quantity + ?
             WHERE id = ?`,
            [
                Number(quantity),
                stockRows[0].id
            ]
        );

        // 6. Create RETURN ledger entry
        await connection.query(
            `INSERT INTO stock_movements
             (store_id, item_id, request_line_id, type, quantity, actor_id)
             VALUES (?, ?, ?, 'RETURN', ?, ?)`,
            [
                store_id,
                line.item_id,
                request_line_id,
                Number(quantity),
                req.user.userId
            ]
        );

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