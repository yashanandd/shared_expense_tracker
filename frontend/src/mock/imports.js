export const mockImportHistory = [
  { id: 1, filename: 'expenses_january.csv', date: '2025-02-01', rowsImported: 42, status: 'completed', anomalies: 2 },
  { id: 2, filename: 'travel_expenses.csv', date: '2025-01-28', rowsImported: 18, status: 'completed', anomalies: 0 },
  { id: 3, filename: 'office_lunch_feb.csv', date: '2025-01-25', rowsImported: 31, status: 'failed', anomalies: 5 },
  { id: 4, filename: 'utilities_bills.csv', date: '2025-01-20', rowsImported: 24, status: 'completed', anomalies: 1 },
  { id: 5, filename: 'groceries_march.csv', date: '2025-01-15', rowsImported: 56, status: 'completed', anomalies: 3 },
]

export const mockAnomalies = [
  { severity: 'warning', title: 'Missing Category', description: '3 rows do not have a category assigned. They will be labelled as "Uncategorized".', count: 3 },
  { severity: 'error', title: 'Invalid Date Format', description: '1 row contains a date that could not be parsed. This row will be skipped during import.', count: 1 },
  { severity: 'info', title: 'Mixed Date Formats', description: 'Date column contains both YYYY-MM-DD and MM/DD/YYYY formats. Auto-detected as MM/DD/YYYY.', count: 5 },
]
