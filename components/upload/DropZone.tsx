'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onDrop: (file: File) => void
  isLoading?: boolean
  error?: string | null
  acceptedFileTypes?: string[]
  maxSize?: number
}

export function DropZone({
  onDrop,
  isLoading = false,
  error = null,
  acceptedFileTypes = ['.csv', '.xlsx', '.xls'],
  maxSize = 5 * 1024 * 1024,
}: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        onDrop(acceptedFiles[0])
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxSize,
    multiple: false,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  return (
      <div
        {...getRootProps()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer',
          'bg-[#111318]',
          isDragActive || dragActive
            ? 'border-primary-500 bg-primary-500/10 scale-[1.01]'
            : error
              ? 'border-rose-500 bg-rose-500/10'
              : 'border-white/[0.08] hover:border-primary-500 hover:bg-primary-500/5'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          {/* File Icon or Upload Icon */}
          <div
            className={cn(
              'p-4 rounded-full transition-all duration-300 mb-4',
              isDragActive
                ? 'bg-primary-500/20 text-primary-500 scale-110'
                : 'bg-white/[0.04] text-[#4b5162]'
            )}
          >
            {isDragActive ? (
              <FileSpreadsheet className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <p className="text-base font-medium text-[#f0f2f8] mb-1">
            {isDragActive ? 'Drop your file here' : 'Drag & drop your data file'}
          </p>
          <p className="text-sm text-[#8b91a7] mb-4">
            Supports CSV, XLS, XLSX (max {formatFileSize(maxSize)})
          </p>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-sm mb-3 bg-rose-500/10 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="line-clamp-2">{error}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc] text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_4px_24px_rgba(79,142,247,0.25)]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Browse Files
              </>
            )}
          </button>
        </div>
      </div>
  )
}

interface PreviewTableProps {
  data: Record<string, unknown>[]
  columns: Array<{ name: string; type: string }>
  maxRows?: number
}

export function PreviewTable({ data, columns, maxRows = 50 }: PreviewTableProps) {
  if (!data.length || !columns.length) return null

  const displayData = data.slice(0, maxRows)

  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#16191f] border-b border-white/[0.07]">
              {columns.map(col => (
                <th
                  key={col.name}
                  className="px-4 py-3 text-left font-semibold text-[#f0f2f8]"
                >
                  {col.name}
                  <span className="ml-1.5 text-xs font-normal text-[#4b5162] uppercase">
                    {col.type === 'number' ? '#' : col.type === 'date' ? '📅' : 'A'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {displayData.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                {columns.map(col => (
                  <td key={col.name} className="px-4 py-2.5 text-[#d1d5db] font-mono text-xs">
                    {String(row[col.name] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > maxRows && (
        <div className="px-4 py-3 bg-[#0d0f14] border-t border-white/[0.07] text-xs text-[#8b91a7] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#34d399]" />
          Showing first {maxRows} rows of {data.length.toLocaleString()}
        </div>
      )}
    </div>
  )
}
