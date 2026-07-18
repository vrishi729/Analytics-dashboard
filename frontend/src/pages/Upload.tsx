import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { cleanDataset, fetchColumns, uploadDataset } from '../services/analytics'
import type { ColumnInfo } from '../services/analytics'
import {
  FileUp,
  CheckCircle2,
  Loader2,
  Upload as UploadIcon,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  BarChart3,
  Settings2,
  Download,
  History,
  Trash2,
  Eye,
} from 'lucide-react'
import { api } from '../lib/api'
import ConfirmModal from '../components/ConfirmModal'
import { useDatasetStore } from '../store/dataset'

const LABEL_MAP: Record<string, string> = {
  order_date: 'Order Date',
  product_name: 'Product Name',
  category: 'Category',
  quantity_sold: 'Quantity Sold',
  unit_price: 'Unit Price',
  revenue: 'Revenue',
}

function ColumnMapper({
  columnInfo,
  mapping,
  onChange,
}: {
  columnInfo: ColumnInfo
  mapping: Record<string, string>
  onChange: (field: string, col: string) => void
}) {
  const requiredFields = columnInfo.required_fields ?? []
  const isMapped = (f: string) => !!mapping[f]
  const allRequiredMapped = requiredFields.every(isMapped)
  const firstRow: Record<string, string> = columnInfo.sample_rows?.[0] ?? {}

  const NOTES: Record<string, string> = {
    revenue: 'Revenue will be calculated automatically from Quantity × Price',
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#888bb0]">
        Map your file&apos;s columns to the expected fields. Required fields are marked with <span className="text-red-400">*</span>.
      </p>

      <div
        className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
          allRequiredMapped
            ? 'bg-green-500/10 text-green-400'
            : 'bg-yellow-500/10 text-yellow-400'
        }`}
      >
        {allRequiredMapped
          ? '🟢 All required fields mapped successfully'
          : `🔴 Missing required: ${requiredFields.filter((f) => !isMapped(f)).map((f) => LABEL_MAP[f] || f).join(', ')}`}
      </div>

      <div className="space-y-3">
        {columnInfo.canonical_fields.map((field) => {
          const isRequired = requiredFields.includes(field)
          const mappedCol = mapping[field]
          const sampleVal = mappedCol ? firstRow[mappedCol] : null
          const note = !isMapped(field) ? NOTES[field] : null
          return (
            <div key={field} className="rounded-xl bg-[#1a1b3a] px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="shrink-0 text-sm">
                  {isMapped(field) ? '✅' : isRequired ? '⚠️' : '  '}
                </span>
                <label className="w-28 shrink-0 text-sm font-medium text-[#c4c6db]">
                  {LABEL_MAP[field] || field}
                  {isRequired && <span className="ml-0.5 text-red-400">*</span>}
                </label>
                <ArrowRight size={14} className="shrink-0 text-[#5a5d8a]" />
                <select
                  value={mapping[field] || ''}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="block min-w-0 flex-1 rounded-lg border border-[#23254a] bg-[#0a0b1a] px-3 py-2 text-sm text-white transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" className="bg-[#0a0b1a]">— skip —</option>
                  {columnInfo.detected_columns.map((col) => (
                    <option key={col} value={col} className="bg-[#0a0b1a]">
                      {mapping[field] === col ? '✓ ' : ''}{col}
                    </option>
                  ))}
                </select>
              </div>
              {sampleVal != null && (
                <p className="ml-[72px] mt-1 text-xs text-[#5a5d8a]">
                  Example: <span className="font-mono text-[#888bb0]">
                    {String(sampleVal).length > 60 ? String(sampleVal).slice(0, 60) + '…' : String(sampleVal)}
                  </span>
                </p>
              )}
              {note && <p className="ml-[72px] mt-1 text-xs text-indigo-400/70">{note}</p>}
            </div>
          )
        })}
      </div>

      <details open className="text-xs text-[#5a5d8a]">
        <summary className="cursor-pointer hover:text-[#c4c6db]">Preview (first 5 rows)</summary>
        <div className="mt-2 overflow-x-auto rounded-lg bg-[#0a0b1a] p-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#888bb0]">
                {columnInfo.detected_columns.map((col) => (
                  <th key={col} className="px-2 py-1 font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {columnInfo.sample_rows.map((row, i) => (
                <tr key={i} className="text-[#c4c6db]">
                  {columnInfo.detected_columns.map((col) => (
                    <td key={col} className="px-2 py-1">{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [datasetId, setDatasetId] = useState<string | null>(null)
  const [mapping, setMapping] = useState<Record<string, string> | null>(null)
  const [showMapper, setShowMapper] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const setActiveDataset = useDatasetStore((s) => s.setActiveDataset)

  const datasetsQuery = useQuery({
    queryKey: ['datasets'],
    queryFn: () => api.get<Array<{ id: string; original_filename: string; row_count: number; file_size_bytes: number; status: string; created_at: string }>>('/datasets/'),
  })

  const upload = useMutation({
    mutationFn: (f: File) => uploadDataset(f),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      setDatasetId(data.dataset_id)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/datasets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })

  const columnsQuery = useQuery({
    queryKey: ['dataset-columns', datasetId],
    queryFn: () => fetchColumns(datasetId!),
    enabled: !!datasetId && !showMapper,
    retry: false,
  })

  const clean = useMutation({
    mutationFn: ({ id, colMap }: { id: string; colMap?: Record<string, string> }) =>
      cleanDataset(id, colMap),
  })

  useEffect(() => {
    if (columnsQuery.data && !mapping) {
      setMapping({ ...columnsQuery.data.auto_mapping })
      setShowMapper(true)
    }
  }, [columnsQuery.data, mapping])

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      alert('File must be under 10 MB')
      return
    }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const handleMappingChange = (field: string, col: string) => {
    setMapping((prev) => ({ ...prev, [field]: col }))
  }

  const handleProcess = () => {
    if (!datasetId) return
    const colMap = mapping
      ? Object.fromEntries(
          Object.entries(mapping).filter(([, v]) => v && v !== ''),
        )
      : undefined
    clean.mutate({ id: datasetId, colMap })
  }

  const reset = () => {
    setFile(null)
    setDatasetId(null)
    setMapping(null)
    setShowMapper(false)
    upload.reset()
    clean.reset()
    queryClient.removeQueries({ queryKey: ['dataset-columns', datasetId] })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white">Upload Sales Data</h1>
        <p className="mt-1 text-sm text-[#888bb0]">
          Upload a CSV or Excel file with your sales records
        </p>
      </div>

      {!datasetId && !showMapper && !upload.isSuccess && (
        <div className="animate-slide-up rounded-2xl border border-[#23254a] bg-[#12132e] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Accepted Formats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#888bb0] text-xs uppercase tracking-wider mb-1">File Types</p>
              <p className="text-[#c4c6db]">CSV (.csv), Excel (.xlsx, .xls)</p>
            </div>
            <div>
              <p className="text-[#888bb0] text-xs uppercase tracking-wider mb-1">Max Size</p>
              <p className="text-[#c4c6db]">10 MB</p>
            </div>
            <div>
              <p className="text-[#888bb0] text-xs uppercase tracking-wider mb-1">Required Columns</p>
              <p className="text-[#c4c6db]">Order Date, Product Name, Quantity Sold, Unit Price</p>
            </div>
            <div>
              <p className="text-[#888bb0] text-xs uppercase tracking-wider mb-1">Optional Columns</p>
              <p className="text-[#c4c6db]">Category, Revenue</p>
            </div>
          </div>
        </div>
      )}

      {!datasetId && !showMapper && !upload.isSuccess && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`animate-slide-up rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragging
              ? 'border-indigo-500 bg-indigo-500/5'
              : 'border-[#23254a] bg-[#12132e] hover:border-[#3d4070]'
          }`}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <FileSpreadsheet size={32} />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {file ? file.name : 'Drop your file here'}
          </h3>
          <p className="mt-1 text-sm text-[#888bb0]">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB`
              : 'or click to browse — CSV, XLSX, XLS (max 10 MB)'}
          </p>

          {!file && (
            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-400 hover:to-purple-500">
              <FileUp size={16} />
              Choose File
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {file && !datasetId && !upload.isSuccess && !showMapper && (
        <div className="animate-slide-up rounded-2xl border border-[#23254a] bg-[#12132e] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-[#5a5d8a]">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => upload.mutate(file)}
              disabled={upload.isPending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-400 hover:to-purple-500 disabled:opacity-60"
            >
              {upload.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UploadIcon size={16} />
              )}
              {upload.isPending ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {upload.isError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} />
              {upload.error instanceof Error ? upload.error.message : 'Upload failed'}
            </div>
          )}
        </div>
      )}

      {upload.isPending && (
        <div className="flex items-center justify-center rounded-2xl border border-[#23254a] bg-[#12132e] p-8">
          <Loader2 size={24} className="animate-spin text-indigo-400" />
          <span className="ml-3 text-sm text-[#888bb0]">Uploading...</span>
        </div>
      )}

      {upload.data && !upload.data.is_valid && (
        <div className="space-y-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm">
          <div className="flex items-start gap-3 text-yellow-400">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>Upload succeeded but the data has issues.</span>
          </div>
          {upload.data.health_summary && (
            <div className="ml-9 mt-2 space-y-1 text-xs">
              {Object.entries(upload.data.health_summary as Record<string, unknown>).map(([k, v]) => {
                if (k === 'is_valid' || k === 'total_rows') return null
                if (typeof v === 'number' && v === 0) return null
                if (Array.isArray(v) && v.length === 0) return null
                if (!v) return null
                return (
                  <p key={k} className="text-[#c4c6db] capitalize">
                    {k.replace(/_/g, ' ')}: <span className="text-yellow-400">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                  </p>
                )
              })}
            </div>
          )}
        </div>
      )}

      {columnsQuery.isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-[#23254a] bg-[#12132e] p-8">
          <Loader2 size={24} className="animate-spin text-indigo-400" />
          <span className="ml-3 text-sm text-[#888bb0]">Reading columns...</span>
        </div>
      )}

      {columnsQuery.isError && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-400">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>Could not read columns. Try cleaning with auto-detection.</span>
          <button
            onClick={() => handleProcess()}
            disabled={clean.isPending}
            className="ml-auto shrink-0 rounded-lg bg-yellow-500/20 px-4 py-1.5 text-xs font-semibold hover:bg-yellow-500/30"
          >
            Clean Anyway
          </button>
        </div>
      )}

      {showMapper && mapping && columnsQuery.data && !clean.isSuccess && (
        <div className="animate-slide-up rounded-2xl border border-[#23254a] bg-[#12132e] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Settings2 size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Column Mapping</p>
              <p className="text-xs text-[#888bb0]">
                {upload.data?.row_count} rows detected
              </p>
            </div>
          </div>

          <ColumnMapper
            columnInfo={columnsQuery.data}
            mapping={mapping}
            onChange={handleMappingChange}
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setMapping({ ...columnsQuery.data.auto_mapping })
              }}
              className="rounded-xl border border-[#23254a] px-4 py-2 text-sm text-[#888bb0] transition-all hover:border-[#3d4070] hover:text-white"
            >
              Reset
            </button>
            <button
              onClick={handleProcess}
              disabled={clean.isPending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-green-400 hover:to-emerald-500 disabled:opacity-60"
            >
              {clean.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {clean.isPending ? 'Processing...' : 'Process Dataset'}
            </button>
          </div>

          {clean.isError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} />
              {clean.error instanceof Error ? clean.error.message : 'Processing failed'}
            </div>
          )}
        </div>
      )}

      {clean.isSuccess && (
        <div className="animate-slide-up rounded-2xl border border-green-500/20 bg-[#12132e] p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Dataset Ready</h2>
            <p className="mt-1 text-sm text-[#888bb0]">
              {clean.data.total_cleaned_records} records processed successfully
            </p>
          </div>

          {clean.data.summary && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-[#1a1b3a] p-4 text-center">
                <p className="text-2xl font-bold text-white">{clean.data.summary.products}</p>
                <p className="mt-1 text-xs text-[#888bb0]">Products</p>
              </div>
              <div className="rounded-xl bg-[#1a1b3a] p-4 text-center">
                <p className="text-2xl font-bold text-white">{clean.data.summary.categories}</p>
                <p className="mt-1 text-xs text-[#888bb0]">Categories</p>
              </div>
              <div className="rounded-xl bg-[#1a1b3a] p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {clean.data.total_cleaned_records}
                </p>
                <p className="mt-1 text-xs text-[#888bb0]">Orders</p>
              </div>
              <div className="rounded-xl bg-[#1a1b3a] p-4 text-center">
                <p className="text-sm font-bold text-white">
                  {clean.data.summary.date_range || '\u2014'}
                </p>
                <p className="mt-1 text-xs text-[#888bb0]">Date Range</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <a
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-400 hover:to-purple-500"
            >
              <BarChart3 size={16} />
              View Dashboard
            </a>
            <button
              onClick={reset}
              className="rounded-xl border border-[#23254a] px-6 py-2.5 text-sm font-semibold text-[#888bb0] transition-all hover:border-[#3d4070] hover:text-white"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {datasetsQuery.data && datasetsQuery.data.length > 0 && (
        <div className="animate-fade-in space-y-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#888bb0]" />
            <h2 className="text-sm font-semibold text-[#888bb0] uppercase tracking-wider">Previous Datasets</h2>
          </div>
          <div className="space-y-2">
            {datasetsQuery.data.map((ds) => (
              <div
                key={ds.id}
                className="flex items-center gap-4 rounded-xl border border-[#23254a] bg-[#12132e] px-4 py-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileSpreadsheet size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{ds.original_filename}</p>
                  <p className="text-xs text-[#5a5d8a]">
                    {ds.row_count} rows &middot; {(ds.file_size_bytes / 1024).toFixed(0)} KB &middot; {new Date(ds.created_at).toLocaleDateString()} &middot; {ds.status}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setActiveDataset(ds.id)
                      navigate('/dashboard')
                    }}
                    disabled={ds.status !== 'cleaned'}
                    className="flex items-center gap-1.5 rounded-lg border border-indigo-500/20 px-3 py-1.5 text-xs text-indigo-400 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 disabled:opacity-40"
                  >
                    <Eye size={14} />
                    Load
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.download(`/datasets/${ds.id}/download`)
                        const blob = await res.blob()
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = ds.original_filename || 'export.csv'
                        a.click()
                        URL.revokeObjectURL(url)
                      } catch {
                        /* silent */
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-[#23254a] px-3 py-1.5 text-xs text-[#888bb0] transition-all hover:border-[#3d4070] hover:text-white"
                  >
                    <Download size={14} />
                    CSV
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: ds.id, name: ds.original_filename })}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Dataset"
        message={`Delete "${deleteTarget?.name}"? All sales records will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}