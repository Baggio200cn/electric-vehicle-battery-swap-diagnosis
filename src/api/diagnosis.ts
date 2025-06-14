import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export interface DiagnosisResponse {
  success: boolean;
  analysis?: string;
  error?: string;
  code?: string;
  timestamp?: string;
}

export const analyzeText = async (text: string, context?: string): Promise<DiagnosisResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/analyze-text`, {
      text,
      context
    });
    return response.data;
  } catch (error: any) {
    console.error('Diagnosis API error:', error);
    return {
      success: false,
      error: error.response?.data?.error || '诊断服务异常，请稍后重试',
      code: error.response?.data?.code || 'UNKNOWN_ERROR'
    };
  }
};

export const clearConversation = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/diagnosis/conversation`);
    return response.data;
  } catch (error: any) {
    console.error('Clear conversation error:', error);
    return {
      success: false,
      error: error.response?.data?.error || '清除对话历史失败'
    };
  }
}; 