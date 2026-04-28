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
        'bg-white',
        isDragActive || dragActive
          ? 'border-primary-500 bg-primary-50/30 scale-[1.01]'
          : error
            ? 'border-rose-400 bg-rose-50/30'
            : 'border-secondary-300 hover:border-primary-400 hover:bg-primary-50/20'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center text-center">
        {/* File Icon or Upload Icon */}
        <div
          className={cn(
            'p-4 rounded-full transition-all duration-300 mb-4',
            isDragActive
              ? 'bg-primary-100 text-primary-600 scale-110'
              : 'bg-secondary-100 text-secondary-500'
          )}
        >
          {isDragActive ? (
            <FileSpreadsheet className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>

        <p className="text-base font-medium text-secondary-900 mb-1">
          {isDragActive ? 'Drop your file here' : 'Drag & drop your data file'}
        </p>
        <p className="text-sm text-secondary-500 mb-4">
          Supports CSV, XLS, XLSX (max {formatFileSize(maxSize)})
        </p>

        {error && (
          <div className="flex items-center gap-2 text-rose-600 text-sm mb-3 bg-rose-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="line-clamp-2">{error}</span>
          </div>
        )}

        <button
          type="button"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
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
    <div className="border border-secondary-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary-50 border-b border-secondary-100">
              {columns.map(col => (
                <th
                  key={col.name}
                  className="px-4 py-3 text-left font-semibold text-secondary-900"
                >
                  {col.name}
                  <span className="ml-1.5 text-xs font-normal text-secondary-400 uppercase">
                    {col.type === 'number' ? '#' : col.type === 'date' ? '📅' : 'A'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {displayData.map((row, i) => (
              <tr key={i} className="hover:bg-secondary-50/50 transition-colors">
                {columns.map(col => (
                  <td key={col.name} className="px-4 py-2.5 text-secondary-700 font-mono text-xs">
                    {String(row[col.name] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > maxRows && (
        <div className="px-4 py-3 bg-secondary-50 border-t border-secondary-100 text-xs text-secondary-500 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-accent-teal" />
          Showing first {maxRows} rows of {data.length.toLocaleString()}
        </div>
      )}
    </div>
  )
}
