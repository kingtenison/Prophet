import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Dataset, ColumnMeta } from '@/types'

interface UploadState {
  file: File | null
  parsedData: Record<string, unknown>[]
  columns: ColumnMeta[]
  isProcessing: boolean
  error: string | null
  setFile: (file: File | null) => void
  setParsedData: (data: Record<string, unknown>[]) => void
  setColumns: (cols: ColumnMeta[]) => void
  setProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useUploadStore = create<UploadState>()(
  persist(
    (set) => ({
      file: null,
      parsedData: [],
      columns: [],
      isProcessing: false,
      error: null,
      setFile: (file) => set({ file }),
      setParsedData: (data) => set({ parsedData: data }),
      setColumns: (cols) => set({ columns: cols }),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setError: (error) => set({ error }),
      reset: () => set({
        file: null,
        parsedData: [],
        columns: [],
        isProcessing: false,
        error: null
      }),
    }),
    {
      name: 'upload-state',
      partialize: (state) => ({ file: state.file }),
    }
  )
)
