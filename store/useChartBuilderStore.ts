import { create } from 'zustand'

interface ChartBuilderState {
  selectedDatasetId: string | null
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'table'
  xColumn: string
  yColumn: string
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max'
  groupColumn: string
  filters: Array<{ id: string; column: string; operator: string; value: string }>
  title: string
  color: string
  setDataset: (id: string | null) => void
  setChartType: (type: 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'table') => void
  setXColumn: (col: string) => void
  setYColumn: (col: string) => void
  setAggregation: (agg: 'sum' | 'avg' | 'count' | 'min' | 'max') => void
  setGroupColumn: (col: string) => void
  addFilter: () => void
  removeFilter: (id: string) => void
  updateFilter: (id: string, updates: Partial<{ column: string; operator: string; value: string }>) => void
  setTitle: (title: string) => void
  setColor: (color: string) => void
  reset: () => void
}

const initialState = {
  selectedDatasetId: null as string | null,
  chartType: 'bar' as const,
  xColumn: '',
  yColumn: '',
  aggregation: 'sum' as const,
  groupColumn: '',
  filters: [] as Array<{ id: string; column: string; operator: string; value: string }>,
  title: '',
  color: '#0ea5e9',
}

export const useChartBuilderStore = create<ChartBuilderState>((set) => ({
  ...initialState,
  setDataset: (id) => set({ selectedDatasetId: id }),
  setChartType: (type) => set({ chartType: type }),
  setXColumn: (col) => set({ xColumn: col }),
  setYColumn: (col) => set({ yColumn: col }),
  setAggregation: (agg) => set({ aggregation: agg }),
  setGroupColumn: (col) => set({ groupColumn: col }),
  addFilter: () => set((state) => ({
    filters: [...state.filters, { id: Date.now().toString(), column: '', operator: 'equals', value: '' }]
  })),
  removeFilter: (id) => set((state) => ({
    filters: state.filters.filter(f => f.id !== id)
  })),
  updateFilter: (id, updates) => set((state) => ({
    filters: state.filters.map(f => f.id === id ? { ...f, ...updates } : f)
  })),
  setTitle: (title) => set({ title }),
  setColor: (color) => set({ color }),
  reset: () => set(initialState),
}))
