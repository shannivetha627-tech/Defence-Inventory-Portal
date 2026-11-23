CREATE DATABASE defence_inventory;

USE defence_inventory;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'REQUESTER', 'SUPERVISOR', 'STOREKEEPER') NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    reorder_level INT NOT NULL DEFAULT 0,
    storage_location VARCHAR(100) NULL,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE stock_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,

    UNIQUE(store_id, item_id),

    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (item_id) REFERENCES items(id),

    CHECK (quantity >= 0)
);

CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    status ENUM(
        'DRAFT',
        'SUBMITTED',
        'APPROVED',
        'REJECTED',
        'ISSUED',
        'CLOSED'
    ) DEFAULT 'DRAFT',
    supervisor_id INT NULL,
    decision_note TEXT,

    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (supervisor_id) REFERENCES users(id)
);

CREATE TABLE request_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    item_id INT NOT NULL,
    requested_qty INT NOT NULL,
    issued_qty INT NOT NULL DEFAULT 0,

    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (item_id) REFERENCES items(id),

    CHECK (requested_qty > 0),
    CHECK (issued_qty >= 0),
    CHECK (issued_qty <= requested_qty)
);

CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    item_id INT NOT NULL,
    request_line_id INT NULL,
    type ENUM('RECEIPT', 'ISSUE', 'RETURN') NOT NULL,
    quantity INT NOT NULL,
    actor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (request_line_id) REFERENCES request_lines(id),
    FOREIGN KEY (actor_id) REFERENCES users(id),

    CHECK (quantity > 0)
);

CREATE TABLE maintenance_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    asset_tag VARCHAR(100),
    assigned_user_id INT NULL,
    due_date DATE NOT NULL,
    status ENUM(
        'OPEN',
        'IN_PROGRESS',
        'RESOLVED'
    ) DEFAULT 'OPEN',
    resolution TEXT,

    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_id INT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (actor_id) REFERENCES users(id)
);