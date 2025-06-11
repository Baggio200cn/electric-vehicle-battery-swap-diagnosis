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
  statistics?: Statistics;
}

export interface AnalysisResponse {
  analysis: DiagnosisResult;
  statistics?: Statistics;
}

export interface VideoInputProps {
  onUpload: (file: File) => Promise<void>;
}

export interface TextInputProps {
  onSubmit: (text: string) => Promise<void>;
}

export interface DiagnosisResultProps {
  result: DiagnosisResult;
  statistics: Statistics | null;
} 