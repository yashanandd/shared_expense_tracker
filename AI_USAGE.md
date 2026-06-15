# AI Collaboration & Assistance Log

This log documents the collaboration with AI developer assistance tools during the development of SplitEase. AI tools were utilized for code autocompletion, query framing, API integration consultation, and logic generation, with the developer retaining full responsibility for reviewing, debugging, and correcting the generated code.

---

## AI Collaboration Tools Used
* **Antigravity** (Autonomous code editing and refactoring assistant)
* **VS Code Copilot** (Inline code autocompletion and snippet generation)
* **ChatGPT** (Architectural consultation, schema review, and debugging assistant)

---

## Areas of AI Assistance
* **API Integration**: Consultation on connecting local FastAPI endpoints to the Vite React client, including mapping JWT state guards in the React context.
* **CORS Debugging**: Setting up FastAPI CORSMiddleware configurations for Vite's local dev ports.
* **Data Parsing**: Implementing multi-format date parsers and dynamic user registration on the CSV import flow.
* **Currency Formatting**: Structuring dynamic Intl formatting and exchange rate translation calculations.

---

## Interaction Concepts (Consultation Topics)
Rather than executing long, generative prompts, the AI tools were consulted on specific technical concepts and API references to guide developer-led implementation:
* **FastAPI Configuration**: Conceptual guidance on setting up `CORSMiddleware` parameters for dev environment security.
* **SQLAlchemy Mapping**: Technical reference on aligning model attributes with pre-existing database column names using alias definitions.
* **React State Management**: Strategies for updating context state safely across nested routes and handling stale state.
* **Data Ingestion Patterns**: Designing robust error-handling and data cleaning approaches for handling malformed CSV inputs.

---

## Cases of AI Code Corrections & Refactorings

During development, the autocomplete and snippet generation suggestions from the AI tools required manual corrections to resolve syntax errors, import omissions, database schema mismatches, and validation errors.

### Case 1: React Hook Ordering Violation in `Analytics.jsx`
* **Assistance Output**: An autocomplete snippet generated a `useMemo` hook to compute category aggregates but placed the hook declaration *after* early conditional returns:
  ```javascript
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} />
  
  // React Hook Violation (placed after conditional returns)
  const categoryData = useMemo(() => { ... }, [data])
  ```
* **Correction**: React hooks must be called at the very top level of functional components. The hook was hoisted to the top level (before any conditional returns) and optional chaining (`data?.expenses`) was added to safely handle the loading state.

---

### Case 2: ReferenceError due to Missing Icon Imports
* **Assistance Output**: The copilot tool suggested rendering trend arrows using `HiOutlineChevronUp` and `HiOutlineChevronDown` in `Analytics.jsx` but did not generate the corresponding React import statements.
* **Correction**: Caught via a `ReferenceError` page crash in the browser console. Resolved by importing the icons from `react-icons/hi2` at the top of the file.

---

### Case 3: MySQL JSON Schema Validation Error on Single-Quoted Strings
* **Assistance Output**: An AI snippet logged raw CSV dict values directly using `str(row)` into the database `anomalies` table.
* **Correction**: The target database column is a MySQL `JSON` column, which strictly enforces double-quoted JSON formats. Python's `str(dict)` produces single quotes, causing a backend `500 (Internal Server Error)`. The parser was modified to pass the dictionary directly (allowing SQLAlchemy to handle JSON serialization automatically) and dates were formatted using `.isoformat()`.

---

### Case 4: SQLAlchemy Model Attribute vs Database Schema Mismatch
* **Assistance Output**: The generated model defined the split value column in the `ExpenseSplit` class as `share_amount = Column(DECIMAL(12, 2))`.
* **Correction**: The physical MySQL database table column was named `amount`, which threw `OperationalError: Unknown column 'share_amount'`. Resolved by adding a column alias mapping directly to the SQLAlchemy model class:
  ```python
  share_amount = Column("amount", DECIMAL(12, 2), nullable=False)
  ```
  This aligned the SQLAlchemy queries with the existing database table structure without requiring a migration.
