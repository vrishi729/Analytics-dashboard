import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  loading,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[#23254a] bg-[#12132e] p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-[#888bb0]">{message}</p>
          </div>
          <button onClick={onCancel} className="shrink-0 text-[#5a5d8a] hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-[#23254a] px-4 py-2 text-sm text-[#888bb0] transition-all hover:border-[#3d4070] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-400 disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
