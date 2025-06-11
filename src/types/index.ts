export interface Statistics {
  totalFrames: number;
  analyzedFrames: number;
  abnormalFrames: number;
  abnormalRatio: number;
  duration: number;
}

export interface AnalysisResponse {
  analysis: string;
  statistics?: Statistics;
}

export interface VideoInputProps {
  onVideoUpload: (file: File) => Promise<void>;
  onFrameCapture?: () => void;
}

export interface DiagnosisResultProps {
  result: string;
  statistics?: Statistics;
} 