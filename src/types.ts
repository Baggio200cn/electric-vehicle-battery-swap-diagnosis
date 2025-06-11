export interface Statistics {
  totalFrames: number;
  analyzedFrames: number;
  abnormalFrames: number;
  abnormalRatio: number;
  duration: number;
}

export interface DiagnosisResult {
  faultType: string;
  confidence: number;
  solutions: string[];
  description?: string;
  recommendations?: string[];
  severity?: 'low' | 'medium' | 'high';
}

export interface DiagnosisResultProps {
  result: DiagnosisResult;
  statistics?: Statistics;
}

export interface TextAnalysisResponse {
  analysis: DiagnosisResult;
  statistics?: Statistics;
}

export interface VideoAnalysisResponse {
  analysis: DiagnosisResult;
  statistics: Statistics;
}

export interface AnalysisResponse {
  analysis: DiagnosisResult;
  statistics?: Statistics;
} 