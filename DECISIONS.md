# Decision Log (DECISIONS.md)

This log documents the significant technical design decisions made while connecting the React frontend to the FastAPI/MySQL backend, outlining the options considered and the rationale for our choices.

---

### 1. Dynamic Category Mapping in Service Layer
* **Problem**: The Vite frontend expects each expense to belong to a category (e.g., `housing`, `utilities`, `food`, `travel`, `shopping`, `entertainment`, `other`) to render color-coded charts and pie graphs. However, the backend database `expenses` table contains no `category` column.
* **Options Considered**:
  1. *Database Migration*: Add a `category` column to the `expenses` table.
  2. *Runtime Categorization (Selected)*: Apply string pattern-matching in the API/Service layers. Expense titles containing keywords like "rent" match `housing`, "groceries" or "lunch" match `food`, etc.
* **Rationale**: Runtime pattern matching allows us to run the application instantly without altering the existing database tables or running migrations on the user's live MySQL instance. This keeps database interactions zero-cost and lightweight.

---

### 2. Auto-Registering Missing Users on CSV Ingestion
* **Problem**: CSV exports contain expenses referencing names (e.g. `Sam`, `Priya`) who are not yet registered users in our database, which triggers foreign key constraint violations during split insert operations.
* **Options Considered**:
  1. *Reject Row (Strict Validation)*: Return a validation error and skip importing any row containing unregistered names.
  2. *Lazy Registration (Selected)*: Automatically register the missing users with default passwords (`default123`) and email addresses (`name@example.com`), then proceed with import.
* **Rationale**: Rejections make CSV imports extremely brittle and require users to manually input and register every participant before upload. Lazy registration ensures seamless, zero-friction imports of historic records.

---

### 3. Graceful Authentication Fallback
* **Problem**: Endpoints like `GET /expenses` and `GET /groups` originally lacked current user verification, whereas the frontend pages (e.g., dashboard KPIs, list filters) depend heavily on the logged-in user context.
* **Options Considered**:
  1. *Strict Auth Guard (401 Block)*: Deny access to all endpoints unless a valid `Authorization: Bearer <token>` header is present.
  2. *Graceful Fallback (Selected)*: Check for a valid JWT token. If present, use the matching authenticated user. If not, default to the first user record in the database.
* **Rationale**: Graceful fallback allows the application to remain functional and easy to demo/test even if the user bypasses login or tests the endpoints directly, while still fully supporting secure, isolated sessions for logged-in users.

---

### 4. Client-side Currency Conversion
* **Problem**: Transactions are recorded in multiple currencies (USD, EUR, INR, GBP). Aggregating them directly by summing up raw float values produces incorrect totals on the dashboard.
* **Options Considered**:
  1. *SQL-level Conversion*: Maintain an exchange rates table in the database and convert amounts using JOIN operations inside queries.
  2. *Client-side Aggregator (Selected)*: Keep original database values unchanged, and let the frontend services parse the currency fields and convert them to the user's preferred reporting default currency dynamically.
* **Rationale**: Client-side conversion is extremely flexible. It allows the same dataset to be converted dynamically depending on the user's localized browser settings (managed on the Settings screen) without modifying historical database transaction records.

---

### 5. Column Alias Mapping in SQLAlchemy
* **Problem**: The database table column in `expense_splits` is named `amount`, but the Python SQLAlchemy model class mapped it to `share_amount`, causing database insertions to fail with `OperationalError: Unknown column 'share_amount'`.
* **Options Considered**:
  1. *Database Migration*: Alter the MySQL table schema to rename the column from `amount` to `share_amount`.
  2. *SQLAlchemy Alias Mapping (Selected)*: Add a column name mapping to the model class definition: `share_amount = Column("amount", DECIMAL(12, 2))`.
* **Rationale**: Defining a column alias maps the model property to the database column cleanly. It leaves the physical database table structure untouched (avoiding any structural alterations to the user's database) while making all insert/update statements compatible with the existing Python backend logic.

---

### 6. CSV Import Split Mapping and Weight Parser
* **Problem**: The CSV data includes splits using the non-standard type `"share"` and details specified as strings like `"Aisha 1; Rohan 2"`, but the database and backend expect a standard split type and individual numeric weights mapped to resolved user IDs.
* **Options Considered**:
  1. *Reject Non-Standard Split Types*: Return an error for `"share"` or `"weight"` rows, requiring the CSV to be manually pre-processed.
  2. *Dynamic Regex Parser & Type Mapping (Selected)*: Standardize the split type mapping (e.g. mapping `"share"`/`"weight"` to `"weighted"`) and write a regular expression-based detail parser that parses `<Name> <Weight>` patterns from CSV strings to form structural split objects.
* **Rationale**: Using a dynamic parser and automatic mapping provides a fully automated user experience. It preserves the flexibility of the CSV structure, allowing users to import standard or custom share files directly without manual data cleaning.

