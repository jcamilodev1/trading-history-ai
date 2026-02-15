export interface AIAnalysisData {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

export interface AIAnalysisResult {
  data?: AIAnalysisData;
  isError?: boolean;
  errorMessage?: string;
}

export interface AIAnalystState {
  analysis: AIAnalysisData | null;
  isLoading: boolean;
  error: string | null;
}
