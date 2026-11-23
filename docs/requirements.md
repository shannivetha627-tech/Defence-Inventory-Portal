# Defence Support Inventory & Maintenance Management Portal

## 1. Project Scope

The Defence Support Inventory & Maintenance Management Portal is a
browser-based system designed to manage fictional, non-sensitive
support-store inventory and maintenance activities.

The system manages office equipment, workshop tools and safety supplies.

The portal allows staff to raise item requests, supervisors to approve
or reject requests, and storekeepers to record stock receipts, issues
and returns.

The system also provides maintenance tracking, dashboard information
and inventory/request reports.

## 2. Project Objectives

1. Maintain a searchable catalogue of support items.
2. Track stock receipts, issues and returns.
3. Allow staff to create and submit item requests.
4. Allow supervisors to approve or reject requests.
5. Provide role-based access to system functions.
6. Track maintenance tickets and due dates.
7. Display low-stock, pending-request and overdue-maintenance information.
8. Generate inventory and request reports.

## 3. User Roles

### Administrator
- Manage users.
- Manage item catalogue.
- View reports.
- Manage system information.

### Requester
- View available items.
- Create item requests.
- Submit requests.
- View request status.

### Supervisor
- View submitted requests.
- Approve requests.
- Reject requests.
- Add decision notes.

### Storekeeper
- View approved requests.
- Record stock receipts.
- Issue approved items.
- Record returned items.
- View stock movement history.

## 4. Main Modules

1. Login and Role Management
2. Item Catalogue
3. Stock Management
4. Request Management
5. Request Approval
6. Stock Issue and Return
7. Maintenance Management
8. Dashboard
9. Reports

## 5. Main Workflow

Requester creates request
        ↓
Requester submits request
        ↓
Supervisor reviews request
        ↓
   ┌────┴────┐
   ↓         ↓
Approve    Reject
   ↓         ↓
Storekeeper  Request closed
issues stock
   ↓
Stock quantity updated
   ↓
Request completed

## 6. User Stories

### Requester

- As a requester, I want to view available items so that I can request
  the required item.

- As a requester, I want to create and submit a request so that it can
  be reviewed by a supervisor.

- As a requester, I want to view my request status so that I know whether
  my request has been approved or rejected.

### Supervisor

- As a supervisor, I want to view pending requests so that I can review
  them.

- As a supervisor, I want to approve or reject requests so that items
  are issued only after authorization.

- As a supervisor, I want to add a decision note so that the decision
  is recorded.

### Storekeeper

- As a storekeeper, I want to view approved requests so that I can
  issue the requested items.

- As a storekeeper, I want to record stock receipts, issues and returns
  so that inventory remains accurate.

- As a storekeeper, I want to view stock movement history so that stock
  changes can be traced.

### Administrator

- As an administrator, I want to manage users and roles so that access
  to the system is controlled.

- As an administrator, I want to manage items so that the item catalogue
  remains updated.

- As an administrator, I want to view reports so that inventory activity
  can be monitored.

### Maintenance

- As a user, I want to create a maintenance ticket for equipment so
  that servicing can be tracked.

- As a user, I want to view maintenance due dates so that overdue
  maintenance can be identified.

## 7. Prototype Restrictions

This prototype will use only fictional and non-sensitive data.

The project will not include:

- Weapons.
- Targeting information.
- Operational deployment information.
- Real defence personnel data.
- Classified information.
- Live defence-system integrations.

The demonstration will use fictional stores, synthetic users and generic
support items such as laptops, printers, toolkits and protective gloves.

## 8. Acceptance Checklist

### Authentication
- [ ] User can log in.
- [ ] User role is identified after login.
- [ ] Unauthorized users cannot access restricted functions.

### Item Catalogue
- [ ] Administrator can add items.
- [ ] Items can be searched.
- [ ] Item information is displayed correctly.

### Requests
- [ ] Requester can create a request.
- [ ] Requester can submit a request.
- [ ] Request status is displayed.

### Approval
- [ ] Supervisor can view pending requests.
- [ ] Supervisor can approve a request.
- [ ] Supervisor can reject a request.
- [ ] Decision notes can be recorded.

### Stock
- [ ] Storekeeper can record stock receipts.
- [ ] Storekeeper can issue approved items.
- [ ] Storekeeper can record returns.
- [ ] Stock quantity is updated correctly.
- [ ] Negative stock is prevented.
- [ ] Stock movement history is maintained.

### Maintenance
- [ ] Maintenance ticket can be created.
- [ ] Maintenance due date can be recorded.
- [ ] Overdue maintenance can be identified.

### Dashboard and Reports
- [ ] Low-stock items are displayed.
- [ ] Pending requests are displayed.
- [ ] Overdue maintenance is displayed.
- [ ] Inventory/request reports can be generated.

### Security
- [ ] Role-based permissions are enforced by the backend.
- [ ] Passwords are not stored as plain text.
- [ ] Database credentials are not exposed in frontend code.

## 9. Expected Final Outcome

The final project will be a locally runnable browser-based application
consisting of a React frontend, Node.js/Express backend and MySQL database.

The application will demonstrate inventory management, request approval,
stock movement, maintenance tracking and dashboard/report functionality.