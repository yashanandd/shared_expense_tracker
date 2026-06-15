# Deployment Guide for Render (DEPLOY_RENDER.md)

This guide walks you through deploying the **SplitEase** application on [Render](https://render.com/), including the database, the FastAPI backend, and the React frontend.

---

## Architecture Overview

```mermaid
graph TD
    Client[React Frontend - Render Static Site]
    API[FastAPI Backend - Render Web Service]
    DB[(MySQL Database - Cloud Hosted)]
    
    Client -->|API Requests / VITE_API_URL| API
    API -->|SQL Queries / DATABASE_URL| DB
```

---

## Step 1: Deploy a MySQL Database

Render does not offer a free native managed MySQL service. You have two recommended options:

### Option A: Free/Managed Cloud MySQL (Clever Cloud - Recommended)
1. Sign up for a free account at [Clever Cloud](https://www.clever-cloud.com/).
2. Click **Create** > **an add-on** > select **MySQL**.
3. Choose the **Shared / Dev (Free 10MB)** plan.
4. Retrieve your connection details:
   - Host
   - Database Name
   - User
   - Password
   - Port
5. Construct your SQLAlchemy database URL:
   ```env
   DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:<port>/<database_name>
   ```

### Option B: Self-Hosted MySQL on Render (via Docker)
1. On your Render Dashboard, click **New +** > **Web Service**.
2. Select **Deploy an image** and enter: `mysql:8.0`
3. Set **Name** to `splitease-db`.
4. Under **Advanced**, add a **Persistent Disk** mounted at `/var/lib/mysql` (Size: 1GB is sufficient for testing).
5. Add the following **Environment Variables**:
   - `MYSQL_ROOT_PASSWORD`: a strong password (e.g. `splitease_root_secure_123`)
   - `MYSQL_DATABASE`: `shared_expense_db`
6. Your backend connection URL will be:
   ```env
   DATABASE_URL=mysql+pymysql://root:splitease_root_secure_123@splitease-db:3306/shared_expense_db
   ```

---

## Step 2: Deploy the FastAPI Backend

1. On Render, click **New +** > **Web Service**.
2. Connect your GitHub repository: `https://github.com/yashanandd/shared_expense_tracker`.
3. Configure the following settings:
   - **Name**: `splitease-backend`
   - **Environment / Runtime**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your PyMySQL URL from **Step 1** (e.g., `mysql+pymysql://...`).
   - `ALLOWED_ORIGINS`: The URL of your frontend static site (you will update this in **Step 3**, e.g., `https://splitease.onrender.com`).
5. Click **Deploy Web Service**. Render will automatically run the startup script, create the MySQL tables, and spin up your backend at:
   `https://splitease-backend.onrender.com`

---

## Step 3: Deploy the React Frontend

1. On Render, click **New +** > **Static Site**.
2. Connect the same GitHub repository: `https://github.com/yashanandd/shared_expense_tracker`.
3. Configure the following settings:
   - **Name**: `splitease` (This will create `https://splitease.onrender.com`)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: The URL of your deployed backend service from **Step 2** (e.g., `https://splitease-backend.onrender.com`).
5. Under **Redirects/Rewrites** (Required to support React Router single-page application URLs on browser reloads):
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite` (Status: `200`)
6. Click **Create Static Site**.

---

## Step 4: Finalize CORS Setup

1. Copy your frontend's static site URL (e.g., `https://splitease.onrender.com`).
2. Go to your **FastAPI Backend Service** dashboard in Render.
3. Under **Environment Variables**, update `ALLOWED_ORIGINS` to include your production frontend URL:
   ```env
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://splitease.onrender.com
   ```
4. Render will automatically redeploy the backend with the updated environment variables.

Your SplitEase application is now fully deployed and live!
