import { FiAlertTriangle, FiX } from 'react-icons/fi'

export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel }) {
  if (!open) return null

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-600/20',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20',
    },
  }

  const style = variantStyles[variant] || variantStyles.danger

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.icon}`}>
            <FiAlertTriangle size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">{title || 'Konfirmasi'}</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{message || 'Apakah Anda yakin?'}</p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <FiX size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all text-sm"
          >
            {cancelLabel || 'Batal'}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-white font-medium rounded-xl transition-all text-sm shadow-md ${style.button}`}
          >
            {confirmLabel || 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}
