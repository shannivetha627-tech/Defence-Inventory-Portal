const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

async function loginUser(email, password) {
    const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND active = TRUE",
        [email]
    );

    if (rows.length === 0) {
        return null;
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatch) {
        return null;
    }

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        token,
        role: user.role,
        userId: user.id,
        name: user.name
    };
}

module.exports = {
    loginUser
};