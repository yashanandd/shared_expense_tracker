# Scope & Data Quality Anomaly Log

This document lists the MySQL database schema definition and provides a comprehensive log of the data anomalies encountered in the CSV import flow and how they were handled.

---

## Database Schema (MySQL)

The application consists of **8 core tables**:

1. **`users`**: User registration records.
   * `id`: `INTEGER` (PK)
   * `name`: `VARCHAR(100)`
   * `email`: `VARCHAR(100)` (Unique)
   * `password_hash`: `VARCHAR(255)`
   * `created_at`: `DATETIME` (defaults to current time)

2. **`groups`**: Expense groups.
   * `id`: `INTEGER` (PK)
   * `name`: `VARCHAR(100)`
   * `description`: `TEXT`
   * `created_by`: `INTEGER` (FK to `users.id`)
   * `created_at`: `DATETIME`

3. **`memberships`**: Maps users to groups with join/leave dates.
   * `id`: `INTEGER` (PK)
   * `group_id`: `INTEGER` (FK to `groups.id`)
   * `user_id`: `INTEGER` (FK to `users.id`)
   * `joined_at`: `DATE`
   * `left_at`: `DATE` (Nullable)

4. **`expenses`**: Transactions recorded in a group.
   * `id`: `INTEGER` (PK)
   * `group_id`: `INTEGER` (FK to `groups.id`)
   * `title`: `VARCHAR(255)`
   * `amount`: `DECIMAL(12, 2)`
   * `currency`: `VARCHAR(3)`
   * `paid_by`: `INTEGER` (FK to `users.id`)
   * `expense_date`: `DATE`
   * `split_type`: `VARCHAR(20)`

5. **`expense_splits`**: Split breakdown details per expense participant.
   * `id`: `INTEGER` (PK)
   * `expense_id`: `INTEGER` (FK to `expenses.id`)
   * `user_id`: `INTEGER` (FK to `users.id`)
   * `amount`: `DECIMAL(12, 2)`
   * `percentage`: `DECIMAL(5, 2)` (Nullable)

6. **`settlements`**: Completed balance transfers.
   * `id`: `INTEGER` (PK)
   * `group_id`: `INTEGER` (FK to `groups.id`)
   * `payer_id`: `INTEGER` (FK to `users.id`)
   * `receiver_id`: `INTEGER` (FK to `users.id`)
   * `amount`: `DECIMAL(12, 2)`
   * `settlement_date`: `DATE`
   * `notes`: `VARCHAR(255)`

7. **`import_batches`**: Ingestion records tracking imports.
   * `id`: `INTEGER` (PK)
   * `filename`: `VARCHAR(255)`
   * `imported_by`: `INTEGER` (FK to `users.id`, Nullable)
   * `status`: `ENUM('processing', 'completed', 'failed')`
   * `total_rows`: `INTEGER`
   * `imported_rows`: `INTEGER`
   * `created_at`: `DATETIME`

8. **`anomalies`**: Log of warnings and errors detected during imports.
   * `id`: `INTEGER` (PK)
   * `import_batch_id`: `INTEGER` (FK to `import_batches.id`)
   * `csv_row_number`: `INTEGER`
   * `anomaly_type`: `VARCHAR(100)`
   * `severity`: `ENUM('info', 'warning', 'error')`
   * `original_data`: `JSON`
   * `action_taken`: `VARCHAR(255)`
   * `resolved`: `BOOLEAN` (default False)
   * `created_at`: `DATETIME`

---

## CSV Data Anomaly Log & Mitigations

During CSV ingestion, the application encounters multiple data anomalies. Here is how each is handled:

### 1. Missing Users / Non-Registered Participants
* **Problem**: A CSV row references a payer or split participant (e.g. `Sam` or `Rohan`) who is not registered in the database. Adding this transaction immediately triggers foreign key constraint violations on `expenses.paid_by` or `expense_splits.user_id`.
* **Handling**: Implemented **automatic lazy-registration** in `import_service.py`. If a participant is not found in the `users` table, the app registers them on-the-fly with a default hashed password (`default123`) and an email format (`sam@example.com`).

### 2. Missing Group Memberships
* **Problem**: The transaction includes splits with registered users who are not part of the destination group, violating expense validation rules.
* **Handling**: The app automatically detects if a split participant or payer lacks group membership. If so, it dynamically joins the user to the group's `memberships` table using the transaction date as `joined_at`, then proceeds with recording the split.

### 3. Duplicate Expenses
* **Problem**: Ingesting the same CSV multiple times logs identical transactions twice, inflating balance calculations.
* **Handling**: Re-ingestion check: before processing a row, the parser queries the database for an existing expense in the same group with matching `title` and `amount`. If a duplicate is found, the row is skipped, and a `duplicate_expense` warning is logged in the `anomalies` table.

### 4. Non-Standard and Dynamic Date Formats
* **Problem**: CSV rows contain dates in varying formats (e.g. `DD/MM/YYYY`, `DD-MM-YYYY`, `YYYY-MM-DD`). Trying to parse these with a single format string throws parsing exceptions.
* **Handling**: Implemented multi-format date parser loops (`datetime.strptime`). The code tries formats sequentially and falls back gracefully to `datetime.now().date()` if all formats fail, logging a date anomaly.

### 5. Multi-Currency Fields
* **Problem**: Transactions contain varying currency values (USD, EUR, INR, GBP). Summing these directly without conversion produces incorrect aggregates on the UI.
* **Handling**: The import parser stores the original currency in `expenses.currency`. The frontend services load these currency codes and convert transaction amounts dynamically to the user's default preferred localization currency (using live conversion rates relative to USD) before generating dashboard summaries, charts, and group totals.

### 6. Empty Group Mapping
* **Problem**: The CSV does not contain a group context column, resulting in FK violations on `group_id`.
* **Handling**: The app checks if any group exists in the database. If not, it automatically creates a default group named `"Imported Expenses"` with the transaction's payer as the initial member, and uses this group as the fallback destination for all imported rows.

### 7. Weighted/Share Split Ingestion
* **Problem**: The CSV has transactions split using the `share` or `weighted` split type, where expense shares must be calculated using variable weight details (e.g. `Aisha 1; Rohan 2; Priya 1; Dev 2`), but database splits require concrete share amounts.
* **Handling**: The parser automatically maps the CSV split types `share` or `weight` to `weighted`. It then extracts each name and corresponding weight from the `split_details` column, links them to resolved user IDs, and calculates the exact share amount based on the weight ratios. If a user's weight is not specified, it falls back gracefully to a weight of `1.0`.

