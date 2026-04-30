import { create } from 'zustand'
import { ColumnMeta, ColumnType } from '@/types'

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
  
  // Cleaning actions
  removeDuplicates: () => void
  handleMissingValues: (strategy: 'drop' | 'fill-zero' | 'fill-mean') => void
  renameColumn: (oldName: string, newName: string) => void
  filterRows: (column: string, operator: string, value: any) => void
  changeDataType: (column: string, newType: ColumnType) => void
  smartClean: () => void
  
  reset: () => void
}

export const useUploadStore = create<UploadState>((set) => ({
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

  removeDuplicates: () => set((state) => {
    const seen = new Set()
    const uniqueData = state.parsedData.filter((row) => {
      const stringified = JSON.stringify(row)
      if (seen.has(stringified)) return false
      seen.add(stringified)
      return true
    })
    return { parsedData: uniqueData }
  }),

  handleMissingValues: (strategy) => set((state) => {
    let cleanedData = [...state.parsedData]
    if (strategy === 'drop') {
      cleanedData = cleanedData.filter((row) => 
        Object.values(row).every(v => v !== null && v !== undefined && v !== '')
      )
    } else if (strategy === 'fill-zero') {
      cleanedData = cleanedData.map(row => {
        const newRow = { ...row }
        Object.keys(newRow).forEach(key => {
          if (newRow[key] === null || newRow[key] === undefined || newRow[key] === '') {
            const col = state.columns.find(c => c.name === key)
            newRow[key] = col?.type === 'number' ? 0 : ''
          }
        })
        return newRow
      })
    } else if (strategy === 'fill-mean') {
      state.columns.forEach(col => {
        if (col.type === 'number') {
          const values = state.parsedData.map(r => Number(r[col.name])).filter(v => !isNaN(v))
          const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1)
          cleanedData = cleanedData.map(row => ({
            ...row,
            [col.name]: (row[col.name] === null || row[col.name] === undefined || row[col.name] === '') ? mean : row[col.name]
          }))
        }
      })
    }
    return { parsedData: cleanedData }
  }),

  renameColumn: (oldName, newName) => set((state) => {
    const newColumns = state.columns.map(col => 
      col.name === oldName ? { ...col, name: newName } : col
    )
    const newData = state.parsedData.map(row => {
      const newRow = { ...row }
      newRow[newName] = newRow[oldName]
      delete newRow[oldName]
      return newRow
    })
    return { columns: newColumns, parsedData: newData }
  }),

  filterRows: (column, operator, value) => set((state) => {
    const newData = state.parsedData.filter(row => {
      const val = row[column]
      if (operator === 'equals') return val == value
      if (operator === 'contains') return String(val).includes(String(value))
      if (operator === 'gt') return Number(val) > Number(value)
      if (operator === 'lt') return Number(val) < Number(value)
      return true
    })
    return { parsedData: newData }
  }),

  changeDataType: (column, newType) => set((state) => {
    const newColumns = state.columns.map(col => 
      col.name === column ? { ...col, type: newType } : col
    )
    const newData = state.parsedData.map(row => {
      const newRow = { ...row }
      const val = newRow[column]
      if (newType === 'number') {
        const n = Number(val)
        newRow[column] = isNaN(n) ? 0 : n
      }
      else if (newType === 'date') {
        const d = new Date(String(val))
        newRow[column] = isNaN(d.getTime()) ? null : d.toISOString()
      }
      else if (newType === 'text') {
        newRow[column] = String(val ?? '')
      }
      else if (newType === 'boolean') {
        newRow[column] = Boolean(val)
      }
      return newRow
    })
    return { columns: newColumns, parsedData: newData }
  }),

  smartClean: () => set((state) => {
    const newData = state.parsedData.map(row => {
      const newRow = { ...row }
      Object.keys(newRow).forEach(key => {
        if (typeof newRow[key] === 'string') {
          newRow[key] = (newRow[key] as string).trim()
        }
      })
      return newRow
    })
    return { parsedData: newData }
  }),

  reset: () => set({
    file: null,
    parsedData: [],
    columns: [],
    isProcessing: false,
    error: null
  }),
}))


