'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DropZone, PreviewTable } from '@/components/upload/DropZone'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/ToastProvider'
import { parseCSV, parseExcel } from '@/lib/parsers/csv'
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react'
import { useUploadStore } from '@/store/useUploadStore'
import { ColumnMeta } from '@/types'

export default function UploadDatasetPage() {
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const {
    file,
    setFile,
    parsedData,
    setParsedData,
    columns,
    setColumns,
    setError: setStoreError,
    reset
  } = useUploadStore()

  const handleFileDrop = async (droppedFile: File) => {
    setIsProcessing(true)
    setError(null)
    setStoreError(null)
    setFile(droppedFile)

    try {
      let result
      if (droppedFile.name.endsWith('.csv')) {
        result = await parseCSV(droppedFile)
      } else if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        result = await parseExcel(droppedFile)
      } else {
        throw new Error('Unsupported file type. Please upload CSV or Excel files.')
      }

      if (result.errors.length > 0) {
        setError(result.errors[0])
      }

      if (result.data.length === 0) {
        throw new Error('No data found in file. Check the format.')
      }

      setParsedData(result.data)
      setColumns(result.columns)
      setConfirmDialogOpen(true)
    } catch (err: any) {
      setError(err.message || 'Failed to parse file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmUpload = async () => {
    if (!file || parsedData.length === 0 || columns.length === 0) return

    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from('datasets').insert({
        user_id: user.id,
        name: file.name.replace(/\.(csv|xlsx|xls)$/i, ''),
        file_path: fileName,
        columns,
        row_count: parsedData.length,
      })

      if (dbError) throw dbError

      addToast({ type: 'success', title: 'Dataset uploaded successfully!' })
      reset()

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: err.message
      })
    } finally {
      setIsProcessing(false)
      setConfirmDialogOpen(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Upload dataset</h1>
        <p className="text-white/50 mt-2">
          Upload a CSV or Excel file. Your file will be processed entirely in your browser.
        </p>
      </div>

      <DropZone
        onDrop={handleFileDrop}
        isLoading={isProcessing}
        error={error}
      />

      {parsedData.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Preview — {file?.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/50">
                {parsedData.length.toLocaleString()} rows × {columns.length} columns
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmDialogOpen(true)}
                disabled={isProcessing}
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Confirm upload
              </Button>
            </div>
          </div>

          {columns.length > 0 && (
            <PreviewTable data={parsedData} columns={columns} />
          )}

          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              Make sure your column names are clean. They will be used as field names in charts.
            </p>
          </div>
        </div>
      )}

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        title="Confirm upload"
        description={`Upload ${file?.name}? This will store your data and make it available for chart building.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpload} loading={isProcessing}>
              Upload dataset
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 rounded-lg bg-[rgba(37,99,235,0.15)] text-[#2563EB]">
              <Upload className="w-4 h-4" />
            </div>
            <span className="font-medium text-white">{file?.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-white/50">
            <span>{columns.length} columns detected</span>
            <span>{parsedData.length.toLocaleString()} rows</span>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
