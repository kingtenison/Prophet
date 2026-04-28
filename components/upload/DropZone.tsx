'use client'

import { useCallback, useState, useEffect } from 'react'
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
        'relative border-2 border-dashed rounded-xl p-4 md:p-6 lg:p-8 transition-all duration-300 cursor-pointer touch-manipulation',
        'bg-[#111]',
        isDragActive || dragActive
          ? 'border-[#2563EB] bg-[rgba(37,99,235,0.08)] scale-[1.01]'
          : error
            ? 'border-rose-500 bg-rose-500/10'
            : 'border-white/10 hover:border-[#2563EB]/60 hover:bg-[rgba(37,99,235,0.04)]'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'p-3 md:p-4 rounded-xl transition-all duration-300 mb-3 md:mb-4 tap-target-touch',
            isDragActive
              ? 'bg-[rgba(37,99,235,0.15)] text-[#2563EB] scale-110'
              : 'bg-white/5 text-white/40'
          )}
        >
          {isDragActive ? (
            <FileSpreadsheet className="w-7 h-7 md:w-8 md:h-8" />
          ) : (
            <Upload className="w-7 h-7 md:w-8 md:h-8" />
          )}
        </div>

        <p className="text-base md:text-lg font-medium text-white mb-1 md:mb-2">
          {isDragActive ? 'Drop your file here' : 'Drag & drop your data file'}
        </p>
        <p className="text-sm md:text-base text-white/40 mb-3 md:mb-4 max-w-xs sm:max-w-md">
          Supports CSV, XLS, XLSX (max {formatFileSize(maxSize)})
        </p>

        {error && (
          <div className="flex items-center gap-2 text-rose-400 text-sm md:text-base mb-3 bg-rose-500/10 px-3 md:px-4 py-2 rounded-lg w-full max-w-md">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            <span className="line-clamp-2">{error}</span>
          </div>
        )}

        <button
          type="button"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#60A5FA] to-[#2563EB] text-white font-medium rounded-xl hover:from-[#93C5FD] hover:to-[#1D4ED8] transition-all disabled:opacity-50 shadow-lg shadow-[rgba(37,99,235,0.25)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] tap-target-touch min-h-[44px] text-sm md:text-[15px] w-full max-w-xs md:w-auto"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Browse Files
            </>
          )}
        </button>

        {isMobile && (
          <p className="text-xs text-white/40 mt-3">
            Tap to browse or drag files here
          </p>
        )}
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
    <div className="border border-white/10 rounded-xl overflow-hidden scroll-touch scroll-touch-no-scrollbar">
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-sm sm:text-[0.875rem]">
          <thead>
            <tr className="bg-[#111] border-b border-white/5">
              {columns.map(col => (
                <th
                  key={col.name}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-semibold text-[#2563EB] uppercase tracking-wider text-[0.65rem] sm:text-xs whitespace-nowrap"
                >
                  {col.name}
                  <span className="ml-1.5 text-white/30 uppercase">
                    {col.type === 'number' ? '#' : col.type === 'date' ? '📅' : 'A'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayData.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                {columns.map(col => (
                  <td key={col.name} className="px-3 sm:px-4 py-2 sm:py-2.5 text-white/60 font-mono text-[0.7rem] sm:text-xs whitespace-nowrap">
                    {String(row[col.name] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > maxRows && (
        <div className="px-4 sm:px-6 py-3 bg-[#111] border-t border-white/5 text-xs text-white/40 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
          <span className="whitespace-nowrap">Showing first {maxRows} rows</span>
          <span className="text-white/30">of {data.length.toLocaleString()} total</span>
        </div>
      )}
    </div>
  )
}
