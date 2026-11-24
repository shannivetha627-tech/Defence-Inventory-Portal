USE defence_inventory;

ALTER TABLE users
  ADD COLUMN employee_id VARCHAR(32) NULL,
  ADD COLUMN department VARCHAR(100) NULL,
  ADD COLUMN designation VARCHAR(100) NULL,
  ADD COLUMN authorized_category VARCHAR(100) NULL;

UPDATE users
SET employee_id = CASE role
      WHEN 'ADMIN' THEN CONCAT('ADM-', LPAD(id, 3, '0'))
      WHEN 'REQUESTER' THEN CONCAT('REQ-', LPAD(id - 1, 3, '0'))
      WHEN 'SUPERVISOR' THEN CONCAT('SUP-', LPAD(id - 2, 3, '0'))
      ELSE CONCAT('STO-', LPAD(id - 3, 3, '0'))
    END,
    department = CASE role
      WHEN 'ADMIN' THEN 'Administration Team'
      WHEN 'REQUESTER' THEN 'IT & Software Team'
      WHEN 'SUPERVISOR' THEN 'Administration Team'
      ELSE 'Logistics Team'
    END,
    designation = CASE role
      WHEN 'ADMIN' THEN 'System Administrator'
      WHEN 'REQUESTER' THEN 'Technical Staff'
      WHEN 'SUPERVISOR' THEN 'Supervising Officer'
      ELSE 'Storekeeper'
    END,
    authorized_category = CASE role
      WHEN 'REQUESTER' THEN 'IT & Computer Equipment'
      ELSE NULL
    END
WHERE employee_id IS NULL;

ALTER TABLE users
  MODIFY employee_id VARCHAR(32) NOT NULL,
  ADD UNIQUE KEY uq_users_employee_id (employee_id);

ALTER TABLE items ADD COLUMN authorized_category VARCHAR(100) NULL;
UPDATE items
SET authorized_category = CASE
  WHEN category IN ('Electronics', 'Accessories', 'Storage') THEN 'IT & Computer Equipment'
  WHEN category = 'Workshop Tools' THEN 'Tools & Maintenance Equipment'
  WHEN category = 'Electrical' THEN 'Electrical & Power Supplies'
  WHEN category = 'Safety Supplies' THEN 'Safety & Protective Equipment'
  WHEN category = 'Office Supplies' THEN 'Office & Administrative Supplies'
  WHEN category = 'Maintenance' THEN 'Facility & General Maintenance'
  ELSE 'UNASSIGNED'
END;
ALTER TABLE items MODIFY authorized_category VARCHAR(100) NOT NULL;

ALTER TABLE requests
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN purpose TEXT NULL,
  ADD COLUMN expected_return_date DATE NULL,
  ADD COLUMN decision_at DATETIME NULL,
  ADD COLUMN clarification_message TEXT NULL,
  ADD COLUMN clarification_at DATETIME NULL;

CREATE TABLE requester_verifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  requester_id INT NOT NULL,
  employee_exists BOOLEAN NOT NULL,
  account_active BOOLEAN NOT NULL,
  department_valid BOOLEAN NOT NULL,
  role_valid BOOLEAN NOT NULL,
  category_authorized BOOLEAN NOT NULL,
  identity_status ENUM('VERIFIED','FAILED','PENDING') NOT NULL,
  verification_status ENUM('VERIFIED','FAILED','PENDING') NOT NULL,
  verified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_request FOREIGN KEY (request_id) REFERENCES requests(id),
  CONSTRAINT fk_verification_user FOREIGN KEY (requester_id) REFERENCES users(id),
  UNIQUE KEY uq_verification_request (request_id)
);

CREATE TABLE asset_assignments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_line_id INT NOT NULL,
  requester_id INT NOT NULL,
  item_id INT NOT NULL,
  assigned_by INT NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expected_return_date DATE NULL,
  status ENUM('ACTIVE','RETURNED','DAMAGED','MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
  returned_at DATETIME NULL,
  CONSTRAINT fk_asset_request_line FOREIGN KEY (request_line_id) REFERENCES request_lines(id),
  CONSTRAINT fk_asset_requester FOREIGN KEY (requester_id) REFERENCES users(id),
  CONSTRAINT fk_asset_item FOREIGN KEY (item_id) REFERENCES items(id),
  CONSTRAINT fk_asset_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id),
  UNIQUE KEY uq_asset_request_line (request_line_id)
);

CREATE TABLE notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_id INT NULL,
  type VARCHAR(60) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_notification_request FOREIGN KEY (request_id) REFERENCES requests(id),
  KEY ix_notifications_user_created (user_id, created_at)
);

ALTER TABLE stock_movements
  MODIFY COLUMN type ENUM('RECEIPT','ISSUE','RETURN','DAMAGED_RETURN') NOT NULL;

ALTER TABLE maintenance_tickets
  ADD COLUMN description TEXT NULL;

ALTER TABLE stock_movements
  ADD COLUMN condition_note TEXT NULL;

ALTER TABLE audit_logs
  ADD COLUMN details JSON NULL;

CREATE INDEX ix_requests_requester_status ON requests(requester_id, status);
CREATE INDEX ix_request_lines_item ON request_lines(item_id);
CREATE INDEX ix_stock_movements_item_type ON stock_movements(item_id, type);
