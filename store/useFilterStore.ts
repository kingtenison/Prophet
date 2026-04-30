import { create } from 'zustand'

interface FilterState {
  selectedSegment: string | null
  setSelectedSegment: (segment: string | null) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedSegment: null,
  setSelectedSegment: (segment) => set({ selectedSegment: segment }),
  clearFilters: () => set({ selectedSegment: null }),
}))
