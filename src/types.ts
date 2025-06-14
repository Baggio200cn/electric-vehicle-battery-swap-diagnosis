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

// 视频帧分析相关类型
export interface FrameAnalysis {
  frameNumber: number;
  timestamp: number;
  anomalyType: 'vibration' | 'noise' | 'visual' | 'normal';
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedFeatures: {
    brightness: number;
    contrast: number;
    motionIntensity: number;
    pixelAnomalies: number;
  };
}

// 图片分析相关类型
export interface ImageAnalysis {
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  description: string;
  confidence: number;
  anomalyType: 'corrosion' | 'crack' | 'loose' | 'wear' | 'leak' | 'normal' | 'other';
  severity: 'low' | 'medium' | 'high';
  solution: string;
  detailedDescription: string;
}

export interface SingleImageAnalysis {
  fileName: string;
  fileSize: number;
  analysisResults: ImageAnalysis[];
  overallDescription: string;
  primaryIssues: string[];
  recommendations: string[];
}

export interface MultiImageAnalysis {
  individualAnalyses: SingleImageAnalysis[];
  overallSummary: string;
  commonIssues: string[];
  rootCauseAnalysis: RootCauseAnalysis[];
  prioritizedSolutions: PrioritizedSolution[];
}

export interface RootCauseAnalysis {
  category: string;
  description: string;
  affectedImages: number[];
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface PrioritizedSolution {
  priority: number;
  title: string;
  description: string;
  estimatedCost: 'low' | 'medium' | 'high';
  timeToImplement: 'immediate' | 'short-term' | 'long-term';
  effectivenessScore: number;
  affectedIssues: string[];
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

// Logo相关类型
export interface CustomLogo {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
  path?: string;
}

// 简化的材料项接口
export interface MaterialItem {
  id: string;
  name?: string;
  title?: string; // 诊断日志标题
  type: 'document' | 'image' | 'video' | 'audio' | 'diagnosis' | 'text' | 'web' | 'diagnosis_log';
  size?: number | string;
  uploadDate?: Date | string;
  createdAt?: string; // 诊断日志创建时间
  tags?: string[];
  description?: string;
  diagnosisResult?: DiagnosisResult;
  url?: string;
  content?: string;
  imagePreview?: string;
  category?: string;
  autoIntegrated?: boolean;
  source?: string; // 来源标识
  autoDelete?: boolean; // 是否可自动删除
  importance?: 'low' | 'medium' | 'high'; // 重要程度
  authors?: string; // 作者信息
  fileName?: string; // 文件名
  fileSize?: number; // 文件大小
  format?: string; // 文件格式
} 