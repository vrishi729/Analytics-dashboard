import { create } from 'zustand'

interface DatasetState {
  activeDatasetId: string | null
  setActiveDataset: (id: string | null) => void
}

export const useDatasetStore = create<DatasetState>((set) => ({
  activeDatasetId: null,
  setActiveDataset: (id) => set({ activeDatasetId: id }),
}))
