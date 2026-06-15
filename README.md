# SplitEase: Shared Expense Manager

**Live Application**: [https://shared-expense-tracker-xi.vercel.app/](https://shared-expense-tracker-xi.vercel.app/)

SplitEase is a modern, responsive web application for managing shared expenses within groups. It allows users to register, create groups, split expenses (equally, exactly, percentage-based, or weighted), compute optimal debt settlement paths, and import transactions from CSV files with detailed anomaly logging.

## Tech Stack
* **Frontend**: React (Vite, HSL-tailored custom vanilla CSS theme, Recharts widgets, React Router)
* **Backend**: FastAPI (Python 3, SQLAlchemy ORM)
* **Database**: MySQL (PyMySQL driver)
* **AI Tool Used**: **Antigravity** (Google DeepMind team working on Advanced Agentic Coding)

---

## Setup & Running Instructions

### 1. Database Configuration
Ensure a MySQL server is running and create a database called `shared_expense_db`.
Configure the database credentials in the backend environment file:
Create `c:\Users\hiii\Desktop\Shared_Expense\backend\.env` with the following content:
```env
DATABASE_URL=mysql+pymysql://root:ash123@localhost/shared_expense_db
```
*(Adjust the username `root` and password `ash123` to match your local MySQL configuration).*

### 2. Running the Backend Server
Navigate to the `backend` folder and run the FastAPI server:
```bash
pip install -r requirements.txt # (If dependencies are not yet installed)
uvicorn app.main:app --reload
```
The server will start on `http://localhost:8000`. Database tables will be automatically created on startup.

### 3. Running the Frontend Development Server
Navigate to the `frontend` folder and run the Vite dev server:
```bash
npm install # (If dependencies are not yet installed)
npm run dev
```
The application will open on `http://localhost:5174` (or fallback port `5173`).

---

## Key Features & Testing Flows
1. **JWT User Session & Auth**: Register a new user or log in. Sessions are fully persisted using JWT tokens in `localStorage`.
2. **Interactive Dashboard**: View KPIs, monthly spending trends, category distribution pie charts, and recent transaction history.
3. **Groups & CRUD Management**: Create groups, add/remove group members, and log splits.
4. **Optimal Settlement suggestions**: The app automatically computes the minimum transaction suggestions (using a net debt simplification algorithm) to settle all group balances.
5. **CSV Batch Import with Dynamic Reports**: Upload a CSV file on the Imports screen. Any row issues (missing users, duplicate expenses, date formats) are caught, resolved automatically or logged as anomalies, and presented as a dynamic report.
