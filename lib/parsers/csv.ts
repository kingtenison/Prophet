import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParseResult<T> {
  data: T[]
  columns: { name: string; type: 'text' | 'number' | 'date' }[]
  errors: string[]
}

export async function parseCSV<T extends Record<string, unknown>>(
  file: File,
  maxRows = 50000
): Promise<ParseResult<T>> {
  return new Promise((resolve) => {
    const errors: string[] = []
    const rows: T[] = []
    const columnTypes: Map<string, Set<unknown>> = new Map()

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      chunkSize: 1024 * 1024, // 1MB chunks
      complete: async (results) => {
        if (results.errors.length > 0) {
          errors.push(...results.errors.map(e => e.message))
        }

        const rawData = results.data as Record<string, unknown>[]

        // Truncate to maxRows
        const truncated = rawData.slice(0, maxRows)

        // Infer column types from truncated data (fast sample)
        for (const row of truncated.slice(0, 1000)) {
          for (const [key, val] of Object.entries(row)) {
            if (val === '' || val === null || val === undefined) continue
            if (!columnTypes.has(key)) columnTypes.set(key, new Set())
            columnTypes.get(key)!.add(typeof val)
          }
        }

        const columns = inferColumnMeta(columnTypes)

        resolve({ data: truncated as T[], columns, errors })
      },
      error: (err) => {
        errors.push(err.message)
        resolve({ data: [], columns: [], errors })
      },
    })
  })
}

export async function parseExcel<T extends Record<string, unknown>>(
  file: File,
  maxRows = 50000
): Promise<ParseResult<T>> {
  const errors: string[] = []
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    rawNumbers: true,
  })

  if (rawData.length > maxRows) {
    errors.push(`File truncated to ${maxRows} rows.`)
  }

  const truncated = rawData.slice(0, maxRows) as T[]

  // Infer column types
  const columnTypes: Map<string, Set<unknown>> = new Map()
  for (const row of truncated.slice(0, 1000)) {
    for (const [key, val] of Object.entries(row)) {
      if (val === '' || val === null || val === undefined) continue
      if (!columnTypes.has(key)) columnTypes.set(key, new Set())
      columnTypes.get(key)!.add(typeof val)
    }
  }

  const columns = inferColumnMeta(columnTypes)

  return { data: truncated, columns, errors }
}

function inferColumnMeta(columnTypes: Map<string, Set<unknown>>) {
  const meta: { name: string; type: 'text' | 'number' | 'date' }[] = []

  for (const [name, types] of columnTypes) {
    const typeArray = Array.from(types)

    // Prioritize number, then date, then text
    if (typeArray.includes('number')) {
      meta.push({ name, type: 'number' })
    } else if (types.has('date') || types.has('string')) {
      // Heuristic: if string looks like a date, mark as date
      const sampleVals = typeArray.filter(t => typeof t === 'string').slice(0, 5)
      const looksLikeDate = sampleVals.some(v => {
        const str = String(v)
        return /\d{4}-\d{2}-\d{2}/.test(str) || /^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)
      })
      meta.push({ name, type: looksLikeDate ? 'date' : 'text' })
    } else {
      meta.push({ name, type: 'text' })
    }
  }

  return meta
}

export function inferColumnType(values: unknown[]): 'number' | 'text' | 'date' {
  const nonEmpty = values.filter(v => v !== '' && v != null)
  if (nonEmpty.length === 0) return 'text'

  const sample = nonEmpty.slice(0, 20)

  // Check if mostly numbers
  const numberCount = sample.filter(v => typeof v === 'number').length
  if (numberCount / sample.length > 0.8) return 'number'

  const textVals = sample.map(String)
  const datePattern = /^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{4}$/
  const dateCount = textVals.filter(v => datePattern.test(v) || !isNaN(Date.parse(v))).length
  if (dateCount / sample.length > 0.5) return 'date'

  return 'text'
}
