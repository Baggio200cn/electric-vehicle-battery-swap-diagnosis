import { DiagnosisResult, TextAnalysisResponse, VideoAnalysisResponse } from '../types';

interface AudioAnalysisResponse {
  text: string;
  analysis: DiagnosisResult;
}

interface FrameAnalysisResponse {
  analysis: DiagnosisResult;
  details: {
    abnormalRegions: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      area: number;
    }>;
    edgeCount: number;
  };
}

export const analyzeAudio = async (audioBlob: Blob): Promise<DiagnosisResult> => {
  const formData = new FormData();
  formData.append('audio', audioBlob);

  try {
    const response = await fetch('http://localhost:5000/api/analyze/audio', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '音频分析失败');
    }

    const data: AudioAnalysisResponse = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('音频分析错误:', error);
    throw error;
  }
};

export const analyzeText = async (text: string): Promise<TextAnalysisResponse> => {
  try {
    // 调用DeepSeek API
    const response = await fetch('http://localhost:5000/api/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '文本分析失败');
    }

    const data = await response.json();
    
    // 将DeepSeek API响应转换为前端期望的格式
    return {
      analysis: {
        faultType: '智能诊断结果',
        confidence: 0.95,
        solutions: [
          data.analysis || '请提供更详细的问题描述以获得更准确的诊断建议'
        ]
      },
      statistics: {
        totalFrames: 1,
        analyzedFrames: 1,
        abnormalFrames: data.success ? 0 : 1,
        abnormalRatio: data.success ? 0 : 1,
        duration: 0
      }
    };
  } catch (error) {
    console.error('文本分析错误:', error);
    // 如果API调用失败，返回错误信息
    return {
      analysis: {
        faultType: '诊断服务异常',
        confidence: 0.0,
        solutions: [
          '诊断服务暂时不可用，请稍后重试',
          '请检查网络连接',
          '如问题持续，请联系技术支持'
        ]
      },
      statistics: {
        totalFrames: 1,
        analyzedFrames: 0,
        abnormalFrames: 1,
        abnormalRatio: 1,
        duration: 0
      }
    };
  }
};

export const analyzeVideoFrame = async (frame: ImageData): Promise<FrameAnalysisResponse> => {
  // 将ImageData转换为Blob
  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建canvas上下文');
  }
  
  ctx.putImageData(frame, 0, 0);
  
  // 将canvas转换为blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else throw new Error('无法创建Blob');
    }, 'image/jpeg');
  });

  const formData = new FormData();
  formData.append('frame', blob);

  try {
    const response = await fetch('http://localhost:5000/api/analyze/frame', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '视频帧分析失败');
    }

    return await response.json();
  } catch (error) {
    console.error('视频帧分析错误:', error);
    throw error;
  }
};

export const analyzeVideo = async (file: File): Promise<VideoAnalysisResponse> => {
  // 模拟视频分析延迟
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    analysis: {
      faultType: '机械振动异常',
      confidence: 0.92,
      solutions: [
        '检查设备轴承对齐情况',
        '检查转子平衡状态',
        '监测振动水平是否超标',
        '检查设备固定螺栓是否松动',
        '建议进行专业的振动分析检测'
      ]
    },
    statistics: {
      totalFrames: 100,
      analyzedFrames: 100,
      abnormalFrames: 15,
      abnormalRatio: 0.15,
      duration: 10
    }
  };
}; 