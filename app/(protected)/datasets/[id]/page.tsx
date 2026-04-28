'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dataset, ColumnMeta } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  Trash2,
  Edit3,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

export default function DatasetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()

  const datasetId = params.id as string

  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([])
  const [cleanedData, setCleanedData] = useState<Record<string, unknown>[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editingCol, setEditingCol] = useState<string | null>(null)
  const [tempName, setTempName] = useState('')

  const rowsPerPage = 20

  useEffect(() => {
    fetchDataset()
  }, [datasetId])

  const fetchDataset = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single()

    if (error) {
      addToast({ type: 'error', title: 'Failed to load dataset' })
      router.push('/dashboard')
      return
    }

    setDataset(data)

    // Download CSV from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('datasets')
      .download(data.file_path)

    if (downloadError) {
      addToast({ type: 'error', title: 'Failed to download file' })
      return
    }

    if (fileData) {
      const text = await fileData.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',')

      const parsedRows = lines.slice(1).filter((l: string) => l.trim()).map((line: string) => {
        const values = line.split(',')
        const row: Record<string, unknown> = {}
        headers.forEach((h: string, i: number) => {
          row[h.trim()] = values[i]?.trim()
        })
        return row
      })

      setRawData(parsedRows)
      setCleanedData(parsedRows)
    }

    setLoading(false)
  }

  const saveCleanedData = async (data: Record<string, unknown>[], cols: ColumnMeta[]) => {
    if (!dataset) return

    // Convert back to CSV
    const headers = cols.map(c => c.name).join(',')
    const rows = data.map(row =>
      cols.map(c => JSON.stringify(row[c.name] || '')).join(',')
    )
    const csv = [headers, ...rows].join('\n')

    const { error } = await supabase.storage
      .from('datasets')
      .upload(dataset.file_path, csv, { upsert: true, contentType: 'text/csv' })

    if (error) {
      addToast({ type: 'error', title: 'Failed to save changes' })
    } else {
      // Update row count
      await supabase.from('datasets').update({
        row_count: data.length,
        columns: cols
      }).eq('id', dataset.id)
    }
  }

  const handleRenameColumn = async (oldName: string) => {
    if (!tempName || tempName === oldName) {
      setEditingCol(null)
      return
    }

    const updatedData = cleanedData.map(row => {
      const newRow = { ...row }
      newRow[tempName] = newRow[oldName]
      delete newRow[oldName]
      return newRow
    })

    const updatedColumns = dataset?.columns.map(col =>
      col.name === oldName ? { ...col, name: tempName } : col
    ) || []

    setCleanedData(updatedData)
    setDataset(prev => prev ? { ...prev, columns: updatedColumns } : null)

    await saveCleanedData(updatedData, updatedColumns)
    setEditingCol(null)
    addToast({ type: 'success', title: 'Column renamed' })
  }

  const handleDropColumn = async (colName: string) => {
    if (!window.confirm(`Drop column "${colName}"? This cannot be undone.`)) return

    const updatedData = cleanedData.map(row => {
      const { [colName]: _, ...rest } = row
      return rest
    })

    const updatedColumns = dataset?.columns.filter(c => c.name !== colName) || []

    setCleanedData(updatedData)
    setDataset(prev => prev ? { ...prev, columns: updatedColumns } : null)

    await saveCleanedData(updatedData, updatedColumns)
    addToast({ type: 'success', title: 'Column dropped' })
  }

  const handleDropNullRows = async () => {
    const nullCols = dataset?.columns.map(c => c.name) || []
    const filtered = cleanedData.filter(row =>
      nullCols.every(col => row[col] !== '' && row[col] != null)
    )

    setCleanedData(filtered)
    await saveCleanedData(filtered, dataset?.columns || [])
    addToast({ type: 'success', title: `${filtered.length} rows kept` })
  }

  if (loading) return <DatasetDetailSkeleton />

  if (!dataset) return null

  const totalPages = Math.ceil(cleanedData.length / rowsPerPage)
  const pageData = cleanedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  // Null count per column
  const nullCounts = dataset.columns.reduce((acc, col) => {
    acc[col.name] = cleanedData.filter(row => row[col.name] === '' || row[col.name] == null).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-secondary-900">{dataset.name}</h1>
            <Badge variant="secondary">{dataset.row_count.toLocaleString()} rows</Badge>
          </div>
          <p className="text-secondary-500 text-sm mt-1">
            Uploaded {new Date(dataset.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleDropNullRows}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clean Nulls
          </Button>
          <Link href="/dashboard">
            <Button variant="ghost">Back</Button>
          </Link>
         </div>
       </div>

       {/* Column Overview */}
       <Card hoverable raised>
         <div className="px-6 py-4 border-b border-secondary-100">
           <h2 className="font-semibold text-secondary-900">Columns</h2>
           <p className="text-sm text-secondary-500 mt-0.5">
             Rename or drop columns. Cleaning actions apply to the stored dataset.
           </p>
         </div>
         <div className="divide-y divide-secondary-100">
          {dataset.columns.map(col => {
            const nullCount = nullCounts[col.name] || 0
            const nullPct = ((nullCount / cleanedData.length) * 100).toFixed(1)

            return (
              <div key={col.name} className="px-6 py-4 flex items-center gap-4 hover:bg-secondary-50/50">
                <div className="flex-1 min-w-0">
                  {editingCol === col.name ? (
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={() => handleRenameColumn(col.name)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameColumn(col.name)}
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium text-secondary-900">{col.name}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-secondary-500">
                    <span className="uppercase tracking-wide">{col.type}</span>
                    <span>•</span>
                     <span
                       className={parseFloat(nullPct) > 10 ? 'text-amber-600 font-medium' : ''}
                       title={`${nullCount} null values (${nullPct}%)`}
                     >
                       {nullCount} null ({nullPct}%)
                     </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCol(col.name)
                      setTempName(col.name)
                    }}
                    title="Rename column"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDropColumn(col.name)}
                    className="text-rose-600 hover:text-rose-700"
                    title="Drop column"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Data Table */}
      <Card>
        <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-secondary-900">Data Preview</h2>
            <p className="text-sm text-secondary-500 mt-0.5">
              Showing {pageData.length} of {cleanedData.length} rows
            </p>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-secondary-600">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-100">
                {dataset.columns.map(col => (
                  <th key={col.name} className="px-6 py-3 text-left font-semibold text-secondary-900">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {pageData.map((row, i) => (
                <tr key={i} className="hover:bg-secondary-50/50">
                  {dataset.columns.map(col => (
                    <td key={col.name} className="px-6 py-3 text-secondary-700 font-mono text-xs">
                      {String(row[col.name] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function DatasetDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-secondary-200 rounded-lg w-1/3" />
      <Skeleton height={200} />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton height={300} />
        <Skeleton height={300} />
      </div>
    </div>
  )
}
