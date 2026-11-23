\# Defence Support Inventory \& Maintenance Management Portal



\## 1. Project Overview



The Defence Support Inventory \& Maintenance Management Portal is a browser-based inventory and maintenance management system developed as a fictional prototype.



The system helps support stores manage generic office equipment, workshop tools, and safety supplies. It provides controlled workflows for stock management, staff requests, supervisor approval, stock issue/return, maintenance tracking, and dashboard reporting.



This prototype uses fictional stores, generic support items, and synthetic users.



\## 2. Problem Statement



Spreadsheet-based inventory processes can lead to:



\- Duplicate item records

\- Unexplained stock changes

\- Difficulty tracking stock issues and returns

\- Missed maintenance due dates

\- Limited visibility of pending requests and low-stock items

\- Weak control over user permissions



This project provides a centralized web application to improve visibility, traceability, and consistency.



\## 3. Main Features



\- Role-based login

\- User authentication

\- Item catalogue

\- Item search

\- Stock receipts

\- Stock issue

\- Stock returns

\- Stock movement history

\- Request creation

\- Request submission

\- Supervisor approval/rejection

\- Transaction-safe stock issue

\- Maintenance tickets

\- Dashboard

\- Low-stock monitoring

\- Pending request count

\- Overdue maintenance count

\- Stock report

\- CSV export

\- Input validation

\- API permission checks



\## 4. User Roles



\### Administrator



\- Manage system users

\- Manage maintenance records

\- Access administrative functions



\### Requester



\- Create inventory requests

\- Add requested items and quantities

\- Submit requests

\- View request status



\### Supervisor



\- Review submitted requests

\- Approve requests

\- Reject requests

\- Record decision notes



\### Storekeeper



\- Record stock receipts

\- Issue approved requests

\- Record stock returns

\- View stock movement history



\## 5. Request Workflow



```text

DRAFT

&#x20; |

&#x20; v

SUBMITTED

&#x20; |

&#x20; +---------> REJECTED

&#x20; |

&#x20; v

APPROVED

&#x20; |

&#x20; v

ISSUED

&#x20; |

&#x20; v

CLOSED

```



Only approved requests can be issued.



The API validates permissions and workflow states on the server.



\## 6. Inventory Workflow



\### Receipt



```text

Stock Receipt

&#x20;    |

&#x20;    v

Stock Balance Increases

&#x20;    |

&#x20;    v

Movement Recorded

```



\### Issue



```text

Approved Request

&#x20;      |

&#x20;      v

Check Available Stock

&#x20;      |

&#x20;      v

Lock Stock Row

&#x20;      |

&#x20;      v

Create ISSUE Movement

&#x20;      |

&#x20;      v

Reduce Stock Balance

&#x20;      |

&#x20;      v

Mark Request as ISSUED

```



The stock issue operation is performed inside a database transaction.



\### Return



```text

Issued Request

&#x20;     |

&#x20;     v

Check Outstanding Quantity

&#x20;     |

&#x20;     v

Create RETURN Movement

&#x20;     |

&#x20;     v

Increase Stock Balance

```



Returns greater than the outstanding issued quantity are rejected.



\## 7. Technology Stack



\### Frontend



\- React

\- Vite

\- HTML

\- CSS

\- JavaScript



\### Backend



\- Node.js

\- Express.js

\- REST API



\### Database



\- MySQL



\### Development Tools



\- Visual Studio Code

\- PowerShell

\- MySQL

\- Git/GitHub



\## 8. Project Architecture



```text

React Frontend

&#x20;     |

&#x20;     | HTTP REST API

&#x20;     v

Node.js + Express Backend

&#x20;     |

&#x20;     | SQL queries

&#x20;     v

MySQL Database

```



The browser does not connect directly to MySQL.



The backend handles authentication, authorization, validation, business rules, and database operations.



\## 9. Project Structure



```text

Defence-Inventory-Portal/

│

├── client/

│   └── src/

│

├── server/

│   └── src/

│

├── database/

│   └── schema.sql

│

├── docs/

│   ├── requirements.md

│   ├── wireframes.png

│   ├── database-relationships.png

│   └── testing evidence

│

└── README.md

```



\The database directory contains both schema.sql for creating the database structure and seed.sql for inserting the synthetic demo data.
## 10. Database



The project uses MySQL database:



```text

defence\_inventory

```



The database contains the main entities required for inventory, requests, stock movements, users, stores, and maintenance.



The database schema is available at:



```text

database/schema.sql

```



\## 11. Environment Configuration



The backend uses environment variables for database configuration and authentication secrets.



Example configuration:



```text

DB\_HOST=localhost

DB\_USER=root

DB\_PASSWORD=your\_mysql\_password

DB\_NAME=defence\_inventory

DB\_PORT=3306

JWT\_SECRET=your\_secret

```



Do not commit the real `.env` file to Git.



Use `.env.example` for sharing configuration structure without exposing secrets.



\## 12. Installation



\### Step 1 — Install Node.js



Install Node.js and verify:



```powershell

node -v

npm -v

```



\### Step 2 — Install MySQL



Ensure the MySQL server is running.



Verify that MySQL is available and that the database server is running on the configured port.



\### Step 3 — Create the Database



Open MySQL and run:



```sql

SOURCE database/schema.sql;
SOURCE database/seed.sql;

```



This creates the `defence\_inventory` database and its tables.



\### Step 4 — Configure Backend



Go to the server directory:



```powershell

cd ".\\server"

```



Create a `.env` file using the required database settings.



\### Step 5 — Install Backend Dependencies



```powershell

npm install

```



\### Step 6 — Start Backend



```powershell

npm start

```



The API runs on:



```text

http://localhost:3000

```



Health check:



```text

http://localhost:3000

```



\### Step 7 — Install Frontend Dependencies



Open another PowerShell window and run:



```powershell

cd "C:\\Users\\Nivetha\\OneDrive\\Documents\\Desktop\\Defence-Inventory-Portal\\client"

npm install

```



\### Step 8 — Start Frontend



```powershell

npm run dev

```



The React application runs on the Vite development server, normally:



```text

http://localhost:5173

```



\## 13. Demo Accounts



The prototype contains four synthetic demo roles:



| Role | Email |

|---|---|

| Administrator | admin@example.com |

| Requester | requester@example.com |

| Supervisor | supervisor@example.com |

| Storekeeper | storekeeper@example.com |



Passwords are intentionally not documented in the project README.



\## 14. API Overview



\### Authentication



```text

POST /api/auth/login

POST /api/auth/logout

GET  /api/auth/me

```



\### Items



```text

GET    /api/items

POST   /api/items

PUT    /api/items/:id

DELETE /api/items/:id

```



\### Requests



```text

GET  /api/requests

POST /api/requests

POST /api/requests/:id/submit

```



\### Supervisor



```text

GET  /api/supervisor/pending

POST /api/supervisor/:id/decision

```



\### Stock



```text

POST /api/stock/receipts

POST /api/stock/returns

POST /api/stock/issue/:requestId

```



\### Maintenance



```text

GET   /api/maintenance

POST  /api/maintenance

PATCH /api/maintenance/:id

```



\### Dashboard



```text

GET /api/dashboard

```



\### Reports



```text

GET /api/reports/stock

GET /api/reports/stock.csv

```



\## 15. Stock Safety Rules



The backend enforces important inventory rules:



\- Quantity must be greater than zero.

\- Negative stock is not allowed.

\- Duplicate fulfilment is prevented.

\- Only approved requests can be issued.

\- Requester users cannot approve requests.

\- Requester users cannot issue stock.

\- Return quantity cannot exceed outstanding issued quantity.

\- Concurrent stock issues are protected using database transactions and row locking.



\## 16. Testing Completed



The project was tested for:



\- Invalid login

\- Missing authentication

\- Role-based permissions

\- Invalid quantities

\- Successful stock issue

\- Insufficient stock

\- Concurrent stock issues

\- Duplicate issue attempts

\- Invalid return quantity

\- Dashboard data

\- CSV report generation



Example stock test:



```text

Opening stock: 20

Issue quantity: 4

Final stock: 16

```



An attempted issue greater than available stock is rejected without creating an issue movement.



\## 17. Documentation



Project documentation is stored in the `docs` directory.



Current documentation includes:



\- Requirements

\- UI wireframes

\- Database relationship diagram

\- Day 3 setup evidence

\- Testing evidence



\## 18. Project Scope and Limitations



This is a fictional prototype for learning and demonstration purposes.



It uses:



\- Fictional stores

\- Generic support items

\- Synthetic users

\- Local development infrastructure



It does not contain:



\- Real personnel data

\- Classified information

\- Weapons

\- Targeting systems

\- Operational deployment information

\- Live defence integrations



\## 19. Future Improvements



Possible future improvements include:



\- Advanced user administration

\- More detailed audit logging

\- Improved report filtering

\- Pagination for large datasets

\- Automated database backups

\- Production deployment

\- Automated test suites

\- Improved notification system

\- More advanced maintenance scheduling



\## 20. Developer



Developed as a full-stack internship project using React, Node.js, Express, and MySQL.



