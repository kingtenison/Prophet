import { AggregationType } from '@/types'

type DataRow = Record<string, unknown>

function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val)
}

function groupBy<T extends DataRow>(data: T[], key: string): Map<unknown, T[]> {
  const groups = new Map<unknown, T[]>()
  for (const row of data) {
    const groupKey = row[key]
    const existing = groups.get(groupKey) || []
    existing.push(row)
    groups.set(groupKey, existing)
  }
  return groups
}

function aggregateValues(rows: DataRow[], valueKey: string, type: AggregationType): number {
  const values = rows
    .map(r => r[valueKey])
    .filter(isNumber)

  if (values.length === 0) return 0

  switch (type) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length
    case 'count':
      return values.length
    case 'min':
      return Math.min(...values)
    case 'max':
      return Math.max(...values)
    default:
      return 0
  }
}

export function aggregateData(
  data: DataRow[],
  xCol: string,
  yCol: string,
  aggregation: AggregationType = 'sum',
  groupCol?: string
): { name: string; value: number; group?: string }[] {
  const result: { name: string; value: number; group?: string }[] = []

  if (groupCol) {
    // Multi-series: group by xCol, then aggregate within each group
    const xGroups = groupBy(data, xCol)
    const allGroups = Array.from(xGroups.keys()).sort((a, b) => {
      if (a === null) return 1
      if (b === null) return -1
      return String(a).localeCompare(String(b))
    })

    const uniqueGroups = Array.from(new Set(data.map(d => d[groupCol])))

    for (const xKey of allGroups) {
      const xRows = xGroups.get(xKey) || []
      for (const grp of uniqueGroups) {
        const grpRows = xRows.filter(r => r[groupCol] === grp)
        const value = aggregateValues(grpRows, yCol, aggregation)
        result.push({
          name: xKey === null ? 'Null' : String(xKey),
          value,
          group: grp === null ? 'Null' : String(grp)
        })
      }
    }
  } else {
    // Simple: group by xCol only
    const groups = groupBy(data, xCol)
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
      if (a === null) return 1
      if (b === null) return -1
      return String(a).localeCompare(String(b))
    })

    for (const key of sortedKeys) {
      const rows = groups.get(key) || []
      const value = aggregateValues(rows, yCol, aggregation)
      result.push({
        name: key === null ? 'Null' : String(key),
        value,
      })
    }
  }

  return result
}

export function buildPredicate(
  filters: { column: string; operator: string; value: unknown }[]
): (row: DataRow) => boolean {
  if (!filters || filters.length === 0) return () => true

  return (row) => {
    return filters.every(f => {
      const rowVal = row[f.column]
      const condVal = f.value

      switch (f.operator) {
        case 'equals':
          return rowVal === condVal
        case 'contains':
          return String(rowVal).toLowerCase().includes(String(condVal).toLowerCase())
        case 'gt':
          return isNumber(rowVal) && typeof condVal === 'number' && rowVal > condVal
        case 'lt':
          return isNumber(rowVal) && typeof condVal === 'number' && rowVal < condVal
        case 'between':
          return isNumber(rowVal) &&
            Array.isArray(condVal) &&
            condVal.length === 2 &&
            rowVal >= condVal[0] &&
            rowVal <= condVal[1]
        default:
          return true
      }
    })
  }
}
