import { create } from 'zustand'

interface DashboardState {
  widgets: Array<{
    id: string
    type: string
    datasetId: string
    config: Record<string, unknown>
    position: { x: number; y: number; w: number; h: number }
  }>
  title: string
  isPublic: boolean
  addWidget: (widget: DashboardState['widgets'][0]) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<DashboardState['widgets'][0]>) => void
  setTitle: (title: string) => void
  setPublic: (isPublic: boolean) => void
  reorderWidgets: (widgets: DashboardState['widgets']) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  widgets: [],
  title: 'New Dashboard',
  isPublic: false,
  addWidget: (widget) => set((state) => ({
    widgets: [...state.widgets, widget]
  })),
  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.filter(w => w.id !== id)
  })),
  updateWidget: (id, updates) => set((state) => ({
    widgets: state.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
  })),
  setTitle: (title) => set({ title }),
  setPublic: (isPublic) => set({ isPublic }),
  reorderWidgets: (widgets) => set({ widgets }),
}))
