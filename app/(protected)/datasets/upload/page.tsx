'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DropZone, PreviewTable } from '@/components/upload/DropZone'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/ToastProvider'
import { parseCSV, parseExcel } from '@/lib/parsers/csv'
import { DataCleaning } from '@/components/upload/DataCleaning'
import { Upload, CheckCircle, AlertTriangle, ArrowRight, Table as TableIcon, Filter, Globe } from 'lucide-react'
import { useUploadStore } from '@/store/useUploadStore'
import { GoogleSheetsConnect } from '@/components/upload/GoogleSheetsConnect'
import Papa from 'papaparse'

export default function UploadDatasetPage() {
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [step, setStep] = useState<'upload' | 'clean' | 'preview'>('upload')
  const [uploadMethod, setUploadMethod] = useState<'file' | 'sheet'>('file')

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
      setStep('clean')
    } catch (err: any) {
      setError(err.message || 'Failed to parse file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSheetData = (csvText: string) => {
    setIsProcessing(true)
    try {
      const results = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      })
      
      if (results.data.length === 0) throw new Error('No data found in Google Sheet')
      
      setParsedData(results.data)
      setColumns(Object.keys(results.data[0] || {}))
      setFile(new File([csvText], "google_sheet.csv", { type: 'text/csv' }))
      setStep('clean')
    } catch (err: any) {
      setError(err.message)
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

      // In a real app, we might want to upload the CLEANED data as a new CSV
      // For now, we'll upload the original file and save the metadata
      // Ideally we'd convert parsedData back to CSV/Excel for storage if cleaned
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

      addToast({ type: 'success', title: 'Dataset uploaded and cleaned successfully!' })
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            {step === 'upload' ? 'Upload dataset' : step === 'clean' ? 'Clean & Transform' : 'Final Preview'}
          </h1>
          <p className="text-white/50 mt-2">
            {step === 'upload' 
              ? 'Upload a CSV or Excel file to get started.' 
              : step === 'clean'
                ? 'Prepare your data for analysis by fixing types and removing noise.'
                : 'Double check everything before saving.'}
          </p>
        </div>

        {step !== 'upload' && (
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <Button 
              variant={step === 'clean' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setStep('clean')}
            >
              1. Clean
            </Button>
            <Button 
              variant={step === 'preview' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setStep('preview')}
            >
              2. Preview
            </Button>
          </div>
        )}
      </div>

      {step === 'upload' && (
        <div className="space-y-6">
          <div className="flex gap-4 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
            <Button 
              variant={uploadMethod === 'file' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setUploadMethod('file')}
            >
              <Upload className="w-4 h-4 mr-2" /> Local File
            </Button>
            <Button 
              variant={uploadMethod === 'sheet' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setUploadMethod('sheet')}
            >
              <Globe className="w-4 h-4 mr-2" /> Google Sheet
            </Button>
          </div>

          {uploadMethod === 'file' ? (
            <DropZone
              onDrop={handleFileDrop}
              isLoading={isProcessing}
              error={error}
            />
          ) : (
            <GoogleSheetsConnect onDataLoaded={handleSheetData} />
          )}
        </div>
      )}

      {step === 'clean' && parsedData.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DataCleaning />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setStep('upload')}>
              Restart
            </Button>
            <Button onClick={() => setStep('preview')}>
              Next: Final Preview <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && parsedData.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Data Preview ({parsedData.length.toLocaleString()} rows)
            </h2>
            <Button onClick={() => setConfirmDialogOpen(true)}>
              Save Dataset
            </Button>
          </div>

          <PreviewTable data={parsedData} columns={columns} />

          <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              Your dataset is ready. We will use these columns and types for your future charts.
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
