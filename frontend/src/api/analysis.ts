// frontend/src/api/analysis.ts
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/api/analysis.ts
// Calls POST /api/analyse with multipart/form-data
// Returns the raw API response shape — mapped to AnalysisResult in pages
// ─────────────────────────────────────────────────────────────────────────────

import apiClient from './client';

export interface AnalyseApiResponse {
  label: 'malignant' | 'benign';
  confidence: number;   // 0–100 (e.g. 87.43) — backend returns percentage
  mask_base64: string | null;
  recommendation: string;
  inference_time_ms: number;
  // dsc / iou are NOT returned by inference — training metrics only
}

export const postAnalyse = async (file: File): Promise<AnalyseApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<AnalyseApiResponse>('/api/analyse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};

export const getHealth = async (): Promise<{ status: string }> => {
  const { data } = await apiClient.get<{ status: string }>('/api/health');
  return data;
};
