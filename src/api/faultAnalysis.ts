import { DiagnosisResult, TextAnalysisResponse, VideoAnalysisResponse, Statistics } from '../types';

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
  // 模拟分析延迟
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    analysis: {
      faultType: '设备过热故障',
      confidence: 0.85,
      solutions: [
        '检查冷却系统是否正常运行',
        '检查设备通风口是否被堵塞',
        '检查温度传感器读数',
        '检查设备负载是否过重',
        '联系专业技术人员进行详细检查'
      ]
    },
    statistics: {
      totalFrames: 1,
      analyzedFrames: 1,
      abnormalFrames: 1,
      abnormalRatio: 1,
      duration: 0
    }
  };
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