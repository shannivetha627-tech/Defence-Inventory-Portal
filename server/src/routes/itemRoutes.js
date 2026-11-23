const express = require("express");
const pool = require("../db");

const router = express.Router();


// ===============================
// GET ALL ITEMS / SEARCH ITEMS
// ===============================

router.get("/", async (req, res) => {
    try {
        const { search } = req.query;

        let query = `
            SELECT * FROM items
            WHERE active = TRUE
        `;

        let values = [];

        // Search by code, name or category
        if (search) {
            query += `
                AND (
                    code LIKE ?
                    OR name LIKE ?
                    OR category LIKE ?
                )
            `;

            const searchValue = `%${search}%`;

            values = [
                searchValue,
                searchValue,
                searchValue
            ];
        }

        query += " ORDER BY id DESC";

        const [rows] = await pool.query(query, values);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch items"
        });
    }
});


// ===============================
// CREATE ITEM
// ===============================

router.post("/", async (req, res) => {
    try {
        const {
            code,
            name,
            category,
            unit,
            reorder_level
        } = req.body;

        // Validation
        if (
            !code ||
            !name ||
            !category ||
            !unit ||
            reorder_level === undefined
        ) {
            return res.status(400).json({
                message: "All item fields are required"
            });
        }

        // Insert item
        const [result] = await pool.query(
            `INSERT INTO items
            (code, name, category, unit, reorder_level)
            VALUES (?, ?, ?, ?, ?)`,
            [
                code,
                name,
                category,
                unit,
                reorder_level
            ]
        );

        res.status(201).json({
            message: "Item created successfully",
            itemId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create item"
        });
    }
});


// ===============================
// UPDATE ITEM
// ===============================

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            code,
            name,
            category,
            unit,
            reorder_level
        } = req.body;

        // Validation
        if (
            !code ||
            !name ||
            !category ||
            !unit ||
            reorder_level === undefined
        ) {
            return res.status(400).json({
                message: "All item fields are required"
            });
        }

        // Update item
        const [result] = await pool.query(
            `UPDATE items
             SET code = ?,
                 name = ?,
                 category = ?,
                 unit = ?,
                 reorder_level = ?
             WHERE id = ?`,
            [
                code,
                name,
                category,
                unit,
                reorder_level,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json({
            message: "Item updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update item"
        });
    }
});


// ===============================
// DEACTIVATE ITEM
// ===============================

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            `UPDATE items
             SET active = FALSE
             WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.json({
            message: "Item deactivated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to deactivate item"
        });
    }
});


module.exports = router;