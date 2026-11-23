USE defence_inventory;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE audit_logs;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE request_lines;
TRUNCATE TABLE requests;
TRUNCATE TABLE maintenance_tickets;
TRUNCATE TABLE stock_balances;
TRUNCATE TABLE stores;
TRUNCATE TABLE items;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;


-- =========================================================
-- DEMO USERS
-- =========================================================

INSERT INTO users
(id, name, email, password_hash, role, active)
VALUES
(1, 'Admin User', 'admin@example.com',
 '$2b$10$N2IokQZeHb/Z2mdclN9VO.mb7PAesPoupT09mRjdmg6H2YnNC97Xy',
 'ADMIN', TRUE),

(2, 'Requester User', 'requester@example.com',
 '$2b$10$YlW1zrSRd/zowNkBWbLtRusMdOvJ3geezSEtBPMDuT9iGDWekj5fC',
 'REQUESTER', TRUE),

(3, 'Supervisor User', 'supervisor@example.com',
 '$2b$10$tUCdawfMn0SL114Sbyne8.O69HIKdgJtfS9Flv//oX4OEcDfUPeiq',
 'SUPERVISOR', TRUE),

(4, 'Storekeeper User', 'storekeeper@example.com',
 '$2b$10$Jf9m7Mu1XU1o44vzRloAeupi0zi7nykMLEMsueD5Jk0mrvSrPla..',
 'STOREKEEPER', TRUE);


-- =========================================================
-- FICTIONAL STORES
-- =========================================================

INSERT INTO stores
(id, name)
VALUES
(1, 'Central Store'),
(2, 'Workshop Store'),
(3, 'Office Store');


-- =========================================================
-- ITEMS
-- =========================================================

INSERT INTO items
(id, code, name, category, unit, reorder_level, storage_location, active)
VALUES
(1, 'ITM001', 'Laptop', 'Electronics', 'pcs', 11, 'Central Store - Rack A1', TRUE),
(2, 'ITM002', 'Printer', 'Electronics', 'pcs', 2, 'Central Store - Rack A2', TRUE),
(3, 'ITM003', 'Keyboard', 'Electronics', 'pcs', 8, 'Workshop Store - Shelf B1', TRUE),
(4, 'ITM004', 'Desktop Monitor', 'Electronics', 'pcs', 5, 'Central Store - Rack A3', TRUE),
(5, 'ITM005', 'Mouse', 'Electronics', 'pcs', 10, 'Central Store - Rack A4', TRUE),
(6, 'ITM006', 'Keyboard Cover', 'Accessories', 'pcs', 10, 'Central Store - Shelf A5', TRUE),
(7, 'ITM007', 'USB Cable', 'Accessories', 'pcs', 15, 'Central Store - Shelf A6', TRUE),
(8, 'ITM008', 'HDMI Cable', 'Accessories', 'pcs', 10, 'Central Store - Shelf A7', TRUE),
(9, 'ITM009', 'Power Adapter', 'Electronics', 'pcs', 5, 'Central Store - Rack A8', TRUE),
(10, 'ITM010', 'Extension Board', 'Electrical', 'pcs', 5, 'Central Store - Rack A9', TRUE),
(11, 'ITM011', 'Tool Kit', 'Workshop Tools', 'sets', 3, 'Workshop Store - Shelf B2', TRUE),
(12, 'ITM012', 'Screwdriver Set', 'Workshop Tools', 'sets', 3, 'Workshop Store - Shelf B3', TRUE),
(13, 'ITM013', 'Adjustable Wrench', 'Workshop Tools', 'pcs', 3, 'Workshop Store - Shelf B4', TRUE),
(14, 'ITM014', 'Pliers', 'Workshop Tools', 'pcs', 4, 'Workshop Store - Shelf B5', TRUE),
(15, 'ITM015', 'Safety Gloves', 'Safety Supplies', 'pairs', 10, 'Workshop Store - Safety Shelf C1', TRUE),
(16, 'ITM016', 'Safety Goggles', 'Safety Supplies', 'pcs', 5, 'Office Store - Safety Shelf C2', TRUE),
(17, 'ITM017', 'Safety Helmet', 'Safety Supplies', 'pcs', 5, 'Office Store - Safety Shelf C3', TRUE),
(18, 'ITM018', 'Protective Mask', 'Safety Supplies', 'pcs', 10, 'Office Store - Safety Shelf C4', TRUE),
(19, 'ITM019', 'First Aid Kit', 'Safety Supplies', 'kits', 2, 'Office Store - Medical Shelf C5', TRUE),
(20, 'ITM020', 'Cleaning Kit', 'Maintenance', 'sets', 3, 'Office Store - Maintenance Shelf D1', TRUE),
(21, 'ITM021', 'Printer Toner', 'Office Supplies', 'pcs', 5, 'Office Store - Shelf D2', TRUE),
(22, 'ITM022', 'Printer Paper', 'Office Supplies', 'reams', 10, 'Office Store - Shelf D3', TRUE),
(23, 'ITM023', 'Stapler', 'Office Supplies', 'pcs', 3, 'Office Store - Shelf D4', TRUE),
(24, 'ITM024', 'USB Drive', 'Storage', 'pcs', 5, 'Office Store - Storage Shelf E1', TRUE),
(25, 'ITM025', 'External Hard Drive', 'Storage', 'pcs', 2, 'Office Store - Storage Shelf E2', TRUE);


-- =========================================================
-- STOCK BALANCES
-- =========================================================

INSERT INTO stock_balances
(store_id, item_id, quantity)
VALUES
(1, 1, 25),
(1, 2, 5),
(1, 4, 12),
(1, 5, 25),
(1, 6, 16),
(1, 7, 20),
(1, 8, 10),
(1, 9, 7),
(1, 10, 20),
(1, 24, 15),
(1, 25, 20),

(2, 3, 21),
(2, 11, 6),
(2, 12, 5),
(2, 13, 4),
(2, 14, 7),
(2, 15, 5),

(3, 16, 9),
(3, 17, 8),
(3, 18, 20),
(3, 19, 4),
(3, 20, 8),
(3, 21, 11),
(3, 22, 20),
(3, 23, 4);


-- =========================================================
-- STOCK MOVEMENTS
-- =========================================================

INSERT INTO stock_movements
(id, store_id, item_id, request_line_id, type, quantity, actor_id)
VALUES

-- Receipts
(1, 1, 1, NULL, 'RECEIPT', 30, 4),
(2, 1, 2, NULL, 'RECEIPT', 8, 4),
(3, 1, 4, NULL, 'RECEIPT', 15, 4),
(4, 1, 5, NULL, 'RECEIPT', 30, 4),
(5, 1, 6, NULL, 'RECEIPT', 20, 4),
(6, 1, 7, NULL, 'RECEIPT', 25, 4),
(7, 1, 8, NULL, 'RECEIPT', 15, 4),
(8, 1, 9, NULL, 'RECEIPT', 10, 4),
(9, 1, 10, NULL, 'RECEIPT', 25, 4),
(10, 1, 24, NULL, 'RECEIPT', 20, 4),

(11, 2, 3, NULL, 'RECEIPT', 26, 4),
(12, 2, 11, NULL, 'RECEIPT', 8, 4),
(13, 2, 12, NULL, 'RECEIPT', 7, 4),
(14, 2, 13, NULL, 'RECEIPT', 6, 4),
(15, 2, 14, NULL, 'RECEIPT', 10, 4),
(16, 2, 15, NULL, 'RECEIPT', 8, 4),

(17, 3, 16, NULL, 'RECEIPT', 12, 4),
(18, 3, 17, NULL, 'RECEIPT', 10, 4),
(19, 3, 18, NULL, 'RECEIPT', 25, 4),
(20, 3, 19, NULL, 'RECEIPT', 5, 4),

-- Issues
(21, 1, 1, NULL, 'ISSUE', 5, 4),
(22, 1, 4, NULL, 'ISSUE', 3, 4),
(23, 1, 5, NULL, 'ISSUE', 5, 4),
(24, 1, 6, NULL, 'ISSUE', 4, 4),
(25, 1, 7, NULL, 'ISSUE', 5, 4),
(26, 1, 8, NULL, 'ISSUE', 5, 4),
(27, 1, 9, NULL, 'ISSUE', 3, 4),
(28, 1, 10, NULL, 'ISSUE', 5, 4),

(29, 2, 3, NULL, 'ISSUE', 5, 4),
(30, 2, 11, NULL, 'ISSUE', 2, 4),
(31, 2, 12, NULL, 'ISSUE', 2, 4),
(32, 2, 13, NULL, 'ISSUE', 2, 4),
(33, 2, 14, NULL, 'ISSUE', 3, 4),
(34, 2, 15, NULL, 'ISSUE', 3, 4),

(35, 3, 16, NULL, 'ISSUE', 3, 4),
(36, 3, 17, NULL, 'ISSUE', 2, 4),

-- Returns
(37, 1, 1, NULL, 'RETURN', 2, 4),
(38, 1, 4, NULL, 'RETURN', 1, 4),
(39, 2, 3, NULL, 'RETURN', 2, 4),
(40, 3, 18, NULL, 'RETURN', 5, 4);


-- =========================================================
-- REQUESTS
-- =========================================================

INSERT INTO requests
(id, requester_id, status, supervisor_id, decision_note)
VALUES
(1, 2, 'DRAFT', NULL, NULL),
(2, 2, 'SUBMITTED', NULL, NULL),
(3, 2, 'SUBMITTED', NULL, NULL),
(4, 2, 'APPROVED', 3, 'Approved for office equipment'),
(5, 2, 'APPROVED', 3, 'Approved for workshop use'),
(6, 2, 'REJECTED', 3, 'Rejected during supervisor review'),
(7, 2, 'REJECTED', 3, 'Rejected due to insufficient requirement justification'),
(8, 2, 'ISSUED', 3, 'Issued from Central Store'),
(9, 2, 'CLOSED', 3, 'Request completed successfully'),
(10, 2, 'DRAFT', NULL, NULL),
(11, 2, 'SUBMITTED', NULL, NULL),
(12, 2, 'APPROVED', 3, 'Approved for safety supplies'),
(13, 2, 'ISSUED', 3, 'Issued from Workshop Store'),
(14, 2, 'CLOSED', 3, 'Request completed and closed'),
(15, 2, 'SUBMITTED', NULL, NULL);


-- =========================================================
-- REQUEST LINES
-- =========================================================

INSERT INTO request_lines
(id, request_id, item_id, requested_qty, issued_qty)
VALUES
(1, 1, 7, 2, 0),
(2, 2, 8, 3, 0),
(3, 3, 9, 4, 0),
(4, 4, 10, 5, 0),
(5, 5, 11, 2, 0),
(6, 6, 12, 2, 0),
(7, 7, 14, 2, 0),
(8, 8, 25, 4, 4),
(9, 9, 16, 2, 2),
(10, 10, 18, 3, 0),
(11, 11, 19, 1, 0),
(12, 12, 15, 2, 0),
(13, 13, 13, 2, 2),
(14, 14, 17, 1, 1),
(15, 15, 21, 2, 0);


-- =========================================================
-- MAINTENANCE TICKETS
-- =========================================================

INSERT INTO maintenance_tickets
(id, item_id, asset_tag, assigned_user_id, due_date, status, resolution)
VALUES
(1, 1, 'LAP-001', 4, '2026-12-05', 'OPEN', NULL),
(2, 1, 'LAP-002', 4, '2026-11-10', 'OPEN', NULL),
(3, 2, 'PRN-001', 4, '2026-11-15', 'IN_PROGRESS', NULL),
(4, 4, 'MON-001', 4, '2026-12-12', 'OPEN', NULL),
(5, 4, 'MON-002', 4, '2026-10-30', 'OPEN', NULL),
(6, 11, 'TOOL-001', 4, '2026-12-20', 'OPEN', NULL),
(7, 12, 'SD-001', 4, '2026-11-25', 'IN_PROGRESS', NULL),
(8, 16, 'GOG-001', 4, '2026-12-15', 'OPEN', NULL),
(9, 20, 'CLN-001', 4, '2026-11-05', 'RESOLVED', 'Cleaning and inspection completed.'),
(10, 21, 'TON-001', 4, '2026-12-18', 'OPEN', NULL);


-- =========================================================
-- AUDIT LOGS
-- =========================================================

INSERT INTO audit_logs
(id, actor_id, entity_type, entity_id, action)
VALUES
(1, 1, 'USER', 1, 'LOGIN'),
(2, 2, 'REQUEST', 2, 'REQUEST_SUBMITTED'),
(3, 3, 'REQUEST', 4, 'REQUEST_APPROVED'),
(4, 4, 'STOCK_MOVEMENT', 21, 'STOCK_ISSUED'),
(5, 4, 'STOCK_MOVEMENT', 37, 'STOCK_RETURNED'),
(6, 3, 'REQUEST', 6, 'REQUEST_REJECTED'),
(7, 4, 'MAINTENANCE', 3, 'MAINTENANCE_STARTED'),
(8, 4, 'MAINTENANCE', 9, 'MAINTENANCE_RESOLVED');


-- =========================================================
-- RESET AUTO_INCREMENT VALUES
-- =========================================================

ALTER TABLE users AUTO_INCREMENT = 5;
ALTER TABLE stores AUTO_INCREMENT = 4;
ALTER TABLE items AUTO_INCREMENT = 26;
ALTER TABLE stock_balances AUTO_INCREMENT = 26;
ALTER TABLE stock_movements AUTO_INCREMENT = 41;
ALTER TABLE requests AUTO_INCREMENT = 16;
ALTER TABLE request_lines AUTO_INCREMENT = 16;
ALTER TABLE maintenance_tickets AUTO_INCREMENT = 11;
ALTER TABLE audit_logs AUTO_INCREMENT = 9;
