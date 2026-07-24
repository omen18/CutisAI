// frontend/src/store/analysis.ts
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/store/analysis.ts
// Global analysis result state via Zustand
// Install: npm install zustand
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import type { AnalysisResult } from '../components/layout/ResultPanel/ResultPanel';

interface AnalysisStore {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  setResult: (result: AnalysisResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  result:    null,
  isLoading: false,
  error:     null,

  setResult:  (result)  => set({ result, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError:   (error)   => set({ error, isLoading: false }),
  clear:      ()        => set({ result: null, error: null, isLoading: false }),
}));
