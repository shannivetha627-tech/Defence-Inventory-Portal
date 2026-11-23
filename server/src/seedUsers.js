const bcrypt = require("bcryptjs");
const pool = require("./db");

async function createUsers() {
    const users = [
        {
            name: "Admin User",
            email: "admin@example.com",
            password: "admin123",
            role: "ADMIN"
        },
        {
            name: "Requester User",
            email: "requester@example.com",
            password: "requester123",
            role: "REQUESTER"
        },
        {
            name: "Supervisor User",
            email: "supervisor@example.com",
            password: "supervisor123",
            role: "SUPERVISOR"
        },
        {
            name: "Storekeeper User",
            email: "storekeeper@example.com",
            password: "storekeeper123",
            role: "STOREKEEPER"
        }
    ];

    try {
        for (const user of users) {
            const passwordHash = await bcrypt.hash(user.password, 10);

            await pool.query(
                `INSERT INTO users
                (name, email, password_hash, role)
                VALUES (?, ?, ?, ?)`,
                [
                    user.name,
                    user.email,
                    passwordHash,
                    user.role
                ]
            );
        }

        console.log("4 demo users created successfully.");
    } catch (error) {
        console.error("Error creating users:", error);
    } finally {
        await pool.end();
    }
}

createUsers();