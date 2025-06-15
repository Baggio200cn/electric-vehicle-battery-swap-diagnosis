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
    const response = await fetch(`${API_BASE_URL}/api/analyze-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        context
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Diagnosis API error:', error);
    return {
      success: false,
      error: error.message || '诊断服务异常，请稍后重试',
      code: 'FETCH_ERROR'
    };
  }
};

export const clearConversation = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/diagnosis/conversation`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Clear conversation error:', error);
    return {
      success: false,
      error: error.message || '清除对话历史失败'
    };
  }
}; 