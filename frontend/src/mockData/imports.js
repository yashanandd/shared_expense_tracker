export const mockImportHistory = [
  {
    id: 1,
    filename: 'expenses_march_2026.csv',
    date: '2026-03-15T10:30:00',
    rowsImported: 47,
    status: 'completed',
    anomalies: 2,
  },
  {
    id: 2,
    filename: 'expenses_february_2026.csv',
    date: '2026-02-10T14:00:00',
    rowsImported: 32,
    status: 'completed',
    anomalies: 0,
  },
  {
    id: 3,
    filename: 'receipts_q1_2026.csv',
    date: '2026-01-05T09:15:00',
    rowsImported: 0,
    status: 'failed',
    anomalies: 5,
  },
  {
    id: 4,
    filename: 'expenses_december_2025.csv',
    date: '2025-12-20T16:45:00',
    rowsImported: 53,
    status: 'completed',
    anomalies: 1,
  },
  {
    id: 5,
    filename: 'team_lunch_export.csv',
    date: '2025-11-28T11:20:00',
    rowsImported: 12,
    status: 'completed',
    anomalies: 0,
  },
]

export const mockAnomalies = [
  {
    severity: 'info',
    title: 'Duplicate rows detected',
    description:
      '2 duplicate entries were found and skipped automatically. No action required.',
    count: 2,
  },
  {
    severity: 'warning',
    title: 'Missing categories',
    description:
      '3 expenses were imported with an "Uncategorized" label. Consider reviewing and assigning categories.',
    count: 3,
  },
  {
    severity: 'error',
    title: 'Invalid date format',
    description:
      '1 row was skipped due to an unrecognized date format. Please check row 24 in your CSV file.',
    count: 1,
  },
]
