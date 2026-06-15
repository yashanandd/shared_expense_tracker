import { useState, useRef, useCallback, useEffect } from 'react'
import {
  HiOutlineArrowUpOnSquareStack,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineShieldExclamation,
  HiOutlineServerStack,
  HiOutlineCheckBadge,
  HiOutlineXMark,
  HiOutlineClipboardDocumentList,
  HiOutlineListBullet,
  HiOutlineInformationCircle,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2'
import { PageHeader, Card, Button, Badge, EmptyState, LoadingSpinner } from '../components/ui'
import { AnomalyCard } from '../components/imports'
import { cn } from '../utils/cn'
import { formatDate } from '../utils/format'
import { getImportHistory, uploadImport } from '../services/service'

const FILE_ACCEPT = '.csv'
const MAX_FILE_SIZE = 10 * 1024 * 1024

const statusConfig = {
  idle: { label: 'Ready', dot: 'bg-[var(--color-text-muted)]' },
  uploading: { label: 'Uploading', dot: 'bg-[var(--color-primary)]' },
  processing: { label: 'Processing', dot: 'bg-[var(--color-warning)]' },
  complete: { label: 'Complete', dot: 'bg-[var(--color-success)]' },
  error: { label: 'Failed', dot: 'bg-[var(--color-danger)]' },
}

const historyBadgeVariant = {
  completed: 'success',
  failed: 'danger',
}

const timelineEvents = [
  { id: 1, action: 'CSV file uploaded', detail: 'expenses_march_2026.csv (2.4 MB)', time: '2 hours ago', icon: HiOutlineArrowUpOnSquareStack, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary-light)]' },
  { id: 2, action: 'Validation completed', detail: '47 rows validated — 0 structural errors', time: '2 hours ago', icon: HiOutlineCheckBadge, color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-bg)]' },
  { id: 3, action: 'Records imported', detail: '47 rows successfully added to database', time: '1 hour ago', icon: HiOutlineServerStack, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary-light)]' },
  { id: 4, action: 'Anomalies detected', detail: '2 info, 3 warnings, 1 error — review recommended', time: '1 hour ago', icon: HiOutlineExclamationTriangle, color: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning-bg)]' },
  { id: 5, action: 'Import completed', detail: 'Import process finished successfully', time: '30 min ago', icon: HiOutlineCheckCircle, color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-bg)]' },
]

const formatRules = [
  { label: 'Required columns', value: 'date, description, amount, category, paid_by' },
  { label: 'Supported split types', value: 'Equal, Percentage, Custom' },
  { label: 'Maximum file size', value: '10 MB' },
  { label: 'Accepted formats', value: '.csv only (UTF-8 encoded)' },
  { label: 'Date format', value: 'YYYY-MM-DD or MM/DD/YYYY' },
  { label: 'Amount format', value: 'Positive numbers. Use dot (.) as decimal separator' },
]

const previewAnomalies = [
  { severity: 'warning', message: '3 rows have missing category values — will be labelled "Uncategorized"' },
  { severity: 'error', message: '1 row has an invalid date format — row will be skipped' },
  { severity: 'info', message: 'Date column contains mixed formats — auto-detected as MM/DD/YYYY' },
  { severity: 'warning', message: 'Amount column has currency symbols — symbols will be stripped' },
]

const severityBadge = {
  info: { label: 'Info', class: 'bg-[var(--color-info-bg)] text-[var(--color-info)]' },
  warning: { label: 'Warning', class: 'bg-[var(--color-warning-bg)] text-[#d97706]' },
  error: { label: 'Error', class: 'bg-[var(--color-danger-bg)] text-[#dc2626]' },
}

function StatsCard({ icon: Icon, label, value, sublabel }) {
  return (
    <div className="flex min-h-[120px] flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </p>
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-light)]">
          <Icon className="h-4 w-4 text-[var(--color-primary)]" />
        </div>
      </div>
      <div className="mt-auto pt-3">
        <p className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {value}
        </p>
        {sublabel && (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{sublabel}</p>
        )}
      </div>
    </div>
  )
}

function DropZone({ onFileAccepted, uploadStatus, fileName, fileError, onClearError }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)
  const isActive = uploadStatus !== 'idle'

  const validateFile = useCallback(
    (file) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        onClearError?.('Please select a CSV file (.csv)')
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        onClearError?.('File size must be under 10 MB')
        return false
      }
      return true
    },
    [onClearError],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file && validateFile(file)) {
        onFileAccepted(file)
      }
    },
    [onFileAccepted, validateFile],
  )

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file && validateFile(file)) {
        onFileAccepted(file)
      }
    },
    [onFileAccepted, validateFile],
  )

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }, [])

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onClick={() => !isActive && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed p-12 text-center transition-all duration-200',
          isDragging
            ? 'border-[var(--color-primary)] bg-[var(--color-info-bg)] shadow-sm'
            : fileError
              ? 'border-[var(--color-danger)] bg-[var(--color-danger-bg)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)]',
          isActive
            ? 'cursor-default opacity-60'
            : 'cursor-pointer',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={FILE_ACCEPT}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        {isActive && fileName ? (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-primary-light)]">
              <HiOutlineDocumentText className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {fileName}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {uploadStatus === 'uploading'
                ? 'Uploading file...'
                : uploadStatus === 'processing'
                  ? 'Processing file...'
                  : 'File ready for import'}
            </p>
          </>
        ) : (
          <>
            <div
              className={cn(
                'mb-5 flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] transition-colors duration-200',
                fileError
                  ? 'bg-[var(--color-danger-bg)]'
                  : isDragging
                    ? 'bg-[var(--color-primary-light)]'
                    : 'bg-[var(--color-surface-hover)]',
              )}
            >
              <HiOutlineArrowUpOnSquareStack
                className={cn(
                  'h-8 w-8 transition-colors duration-200',
                  fileError
                    ? 'text-[var(--color-danger)]'
                    : isDragging
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)]',
                )}
              />
            </div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              <span className="text-[var(--color-primary)] hover:underline">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
              CSV files only &middot; Max 10 MB
            </p>
          </>
        )}
      </div>
      {fileError && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--color-danger)]">
          <HiOutlineShieldExclamation className="h-3.5 w-3.5" />
          {fileError}
        </p>
      )}
    </div>
  )
}

function ProgressBar({ progress, status }) {
  const isDeterminate = status === 'uploading'
  const isError = status === 'error'
  const isComplete = status === 'complete'

  let barColor
  if (isError) {
    barColor = 'bg-[var(--color-danger)]'
  } else if (isComplete) {
    barColor = 'bg-[var(--color-success)]'
  } else {
    barColor = 'bg-[var(--color-primary)]'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-secondary)]">Progress</span>
        <span
          className={cn(
            'font-medium tabular-nums',
            isError
              ? 'text-[var(--color-danger)]'
              : isComplete
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-text)]',
          )}
        >
          {progress}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border-light)] shadow-inner">
        <div
          className={cn(
            'h-full rounded-full shadow-sm',
            barColor,
            isDeterminate
              ? 'transition-all duration-300 ease-out'
              : isComplete
                ? ''
                : 'animate-pulse',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function ProcessingDots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 animate-bounce rounded-full bg-[var(--color-warning)]"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

function StatusIndicator({ status, fileName, rowsImported }) {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        'animate-in flex items-center gap-3.5 rounded-[var(--radius-lg)] border px-4 py-3.5 shadow-sm',
        status === 'complete'
          ? 'border-[var(--color-success)]/30 bg-[var(--color-success-bg)]'
          : status === 'error'
            ? 'border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)]',
      )}
    >
      {status === 'complete' ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]/10">
          <HiOutlineCheckCircle className="h-5 w-5 text-[var(--color-success)]" />
        </div>
      ) : status === 'error' ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
          <HiOutlineXCircle className="h-5 w-5 text-[var(--color-danger)]" />
        </div>
      ) : status === 'uploading' || status === 'processing' ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning)]/10">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--color-warning)]" />
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-hover)]">
          <HiOutlineClock className="h-5 w-5 text-[var(--color-text-muted)]" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {status === 'idle' && 'No file selected'}
          {status === 'uploading' && `Uploading ${fileName ?? 'file'}...`}
          {status === 'processing' && (
            <>
              Processing file{' '}
              <span className="text-[var(--color-text-secondary)]">
                {fileName}
              </span>{' '}
              <ProcessingDots />
            </>
          )}
          {status === 'complete' &&
            `Import complete — ${rowsImported} rows imported`}
          {status === 'error' && 'Import failed — an error occurred'}
        </p>
        {status === 'complete' && rowsImported > 0 && (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {fileName}
          </p>
        )}
      </div>

      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
          status === 'complete' &&
            'bg-[var(--color-success)]/10 text-[#16a34a]',
          status === 'error' && 'bg-[var(--color-danger)]/10 text-[#dc2626]',
          status === 'uploading' &&
            'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
          status === 'processing' &&
            'bg-[var(--color-warning-bg)] text-[#d97706]',
          status === 'idle' &&
            'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]',
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
        {config.label}
      </span>
    </div>
  )
}

export default function Imports() {
  const [uploadStatus, setUploadStatus] = useState('idle')
  const [selectedFile, setSelectedFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [rowsImported, setRowsImported] = useState(0)
  const [anomalies, setAnomalies] = useState([])
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState(null)
  const [fileError, setFileError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const res = await getImportHistory()
      setHistory(res.data.items)
    } catch (err) {
      setHistoryError(err.message || 'Failed to load import history')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const simulateUpload = useCallback((file) => {
    setSelectedFile(file)
    setFileError(null)
    setAnomalies([])
    setRowsImported(0)
    setProgress(0)
    setUploadStatus('uploading')

    let currentProgress = 0
    timerRef.current = setInterval(() => {
      currentProgress += Math.random() * 10 + 2
      if (currentProgress >= 100) {
        clearInterval(timerRef.current)
        setProgress(100)
        setUploadStatus('processing')

        uploadImport(file)
          .then((res) => {
            setRowsImported(res.data.rowsImported)
            setAnomalies(res.data.anomalies)
            setUploadStatus('complete')
            setHistory((prev) => [
              {
                id: Date.now(),
                filename: file.name,
                date: new Date().toISOString(),
                rowsImported: res.data.rowsImported,
                status: 'completed',
                anomalies: res.data.anomalyCount,
              },
              ...prev,
            ])
          })
          .catch((err) => {
            console.error('Import error:', err)
            setUploadStatus('error')
            setFileError(err.response?.data?.detail || err.message || 'Import failed')
            setHistory((prev) => [
              {
                id: Date.now(),
                filename: file.name,
                date: new Date().toISOString(),
                rowsImported: 0,
                status: 'failed',
                anomalies: 0,
              },
              ...prev,
            ])
          })
      } else {
        setProgress(Math.min(Math.round(currentProgress), 99))
      }
    }, 250)
  }, [])

  const handleFileAccepted = useCallback(
    (file) => {
      if (
        uploadStatus === 'idle' ||
        uploadStatus === 'complete' ||
        uploadStatus === 'error'
      ) {
        simulateUpload(file)
      }
    },
    [uploadStatus, simulateUpload],
  )

  const handleFileError = useCallback((msg) => {
    setFileError(msg)
  }, [])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setUploadStatus('idle')
    setSelectedFile(null)
    setFileError(null)
    setProgress(0)
    setRowsImported(0)
    setAnomalies([])
  }, [])

  const totalImports = history.length
  const successfulImports = history.filter((h) => h.status === 'completed').length
  const failedImports = history.filter((h) => h.status === 'failed').length
  const totalRecords = history.reduce((sum, h) => sum + (h.rowsImported || 0), 0)

  const statsCards = [
    { icon: HiOutlineServerStack, label: 'Total Imports', value: totalImports, sublabel: 'All time' },
    { icon: HiOutlineCheckBadge, label: 'Successful', value: successfulImports, sublabel: `${totalImports ? Math.round((successfulImports / totalImports) * 100) : 0}% success rate` },
    { icon: HiOutlineXMark, label: 'Failed', value: failedImports, sublabel: failedImports > 0 ? `${Math.round((failedImports / totalImports) * 100)}% of imports` : 'No failures' },
    { icon: HiOutlineClipboardDocumentList, label: 'Records Processed', value: totalRecords.toLocaleString(), sublabel: 'Across all imports' },
  ]

  const showProgress = uploadStatus !== 'idle'
  const showActions =
    uploadStatus === 'complete' || uploadStatus === 'error'
  const anomalyCount = anomalies.reduce((sum, a) => sum + (a.count ?? 0), 0)

  return (
    <div className="space-y-8">
      <PageHeader
        title="CSV Import"
        description="Import expenses from CSV files"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <DropZone
              onFileAccepted={handleFileAccepted}
              uploadStatus={uploadStatus}
              fileName={selectedFile?.name}
              fileError={fileError}
              onClearError={handleFileError}
            />

            {showProgress && (
              <div className="mt-6 space-y-5 border-t border-[var(--color-border)] pt-6">
                <ProgressBar progress={progress} status={uploadStatus} />
                <StatusIndicator
                  status={uploadStatus}
                  fileName={selectedFile?.name}
                  rowsImported={rowsImported}
                />

                {anomalies.length > 0 && (
                  <div className="animate-in space-y-3">
                    <div className="flex items-center gap-2.5 pt-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-warning)]/10">
                        <HiOutlineExclamationTriangle className="h-4 w-4 text-[var(--color-warning)]" />
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--color-text)]">
                        Import Issues
                      </h3>
                      <span className="rounded-full bg-[var(--color-warning)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-warning)]">
                        {anomalyCount} {anomalyCount === 1 ? 'issue' : 'issues'}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        &middot; {anomalies.length}{' '}
                        {anomalies.length === 1 ? 'type' : 'types'}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {anomalies.map((anomaly, idx) => (
                        <AnomalyCard
                          key={idx}
                          severity={anomaly.severity}
                          title={anomaly.title}
                          description={anomaly.description}
                          count={anomaly.count}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {showActions && (
                  <div className="flex items-center gap-3 pt-1">
                    <Button variant="primary" size="sm" onClick={handleReset}>
                      Import another file
                    </Button>
                    {uploadStatus === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => simulateUpload(selectedFile)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-[var(--color-text)]">
                Import History
              </h2>
              {history.length > 0 && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  {history.length}{' '}
                  {history.length === 1 ? 'import' : 'imports'}
                </span>
              )}
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : historyError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">{historyError}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={loadHistory}>
                  Retry
                </Button>
              </div>
            ) : history.length > 0 ? (
              <div className="mt-4 -mr-6 -ml-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      <th className="px-4 pb-2.5 font-medium">File</th>
                      <th className="px-4 pb-2.5 font-medium">Date</th>
                      <th className="px-4 pb-2.5 font-medium text-right">
                        Rows
                      </th>
                      <th className="px-4 pb-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr
                        key={item.id}
                        className="group border-b border-[var(--color-border-light)] transition-colors last:border-0 hover:bg-[var(--color-surface-hover)]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] transition-colors group-hover:bg-white">
                              <HiOutlineDocumentText className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                            </div>
                            <div className="min-w-0 max-w-[140px]">
                              <p
                                className="truncate text-sm font-medium text-[var(--color-text)]"
                                title={item.filename}
                              >
                                {item.filename}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm tabular-nums text-[var(--color-text-secondary)]">
                          {item.rowsImported > 0 ? item.rowsImported : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={historyBadgeVariant[item.status]}
                              dot
                            >
                              {item.status}
                            </Badge>
                            {item.anomalies > 0 && (
                              <span className="rounded-full bg-[var(--color-warning)]/10 px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-warning)]">
                                {item.anomalies}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={HiOutlineClock}
                title="No imports yet"
                description="Import your first CSV file to see the history here."
              />
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {historyLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
                <div className="h-3 w-20 rounded bg-[var(--color-border-light)]" />
                <div className="mt-3 h-7 w-16 rounded bg-[var(--color-border-light)]" />
              </div>
            ))
          : statsCards.map((card) => (
              <StatsCard key={card.label} {...card} />
            ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center gap-2.5 pb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                <HiOutlineListBullet className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-base font-semibold text-[var(--color-text)]">
                Recent Import Activity
              </h2>
            </div>
            <div className="relative">
              <div className="absolute left-[17px] top-2 h-[calc(100%-16px)] w-0.5 bg-[var(--color-border)]" />
              <div className="space-y-0">
                {timelineEvents.map((event, idx) => (
                  <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className={cn('relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', event.bg)}>
                      <event.icon className={cn('h-4 w-4', event.color)} />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {event.action}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {event.detail}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                        {event.time}
                      </p>
                    </div>
                    {idx < timelineEvents.length - 1 && (
                      <div className="absolute left-[17px] top-9 h-[calc(100%+0px)] w-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <div className="flex items-center gap-2.5 pb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                <HiOutlineInformationCircle className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-base font-semibold text-[var(--color-text)]">
                Import Guidelines
              </h2>
            </div>
            <div className="space-y-3">
              {formatRules.map((rule) => (
                <div key={rule.label} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-3">
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {rule.label}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-text)]">
                    {rule.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2.5 pb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-warning)]/10">
            <HiOutlineChartBarSquare className="h-4 w-4 text-[var(--color-warning)]" />
          </div>
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            Import Anomalies Preview
          </h2>
          <span className="rounded-full bg-[var(--color-warning)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-warning)]">
            {previewAnomalies.length} issues
          </span>
        </div>
        <div className="-mr-6 -ml-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-6 pb-2.5 font-medium w-24">Severity</th>
                <th className="px-6 pb-2.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {previewAnomalies.map((item, idx) => {
                const badge = severityBadge[item.severity]
                return (
                  <tr
                    key={idx}
                    className="border-b border-[var(--color-border-light)] transition-colors last:border-0 hover:bg-[var(--color-surface-hover)]"
                  >
                    <td className="px-6 py-3.5">
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', badge.class)}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-[var(--color-text-secondary)]">
                      {item.message}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
