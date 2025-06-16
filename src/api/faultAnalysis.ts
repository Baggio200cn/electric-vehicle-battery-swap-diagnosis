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
    // 智能选择API端点
    const getApiEndpoint = () => {
      // 如果是在GitHub Pages上，使用Vercel部署的API
      if (window.location.hostname.includes('github.io') || window.location.hostname.includes('vercel.app')) {
        return 'https://your-project-name.vercel.app/api/analyze-text';
      }
      // 本地开发环境使用localhost
      return 'http://localhost:5000/api/analyze-text';
    };

    const apiEndpoint = getApiEndpoint();
    console.log(`使用API端点: ${apiEndpoint}`);

    const response = await fetch(apiEndpoint, {
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
        confidence: data.mode === 'deepseek-api' ? 0.95 : 0.75,
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
    // 如果API调用失败，返回智能备用诊断
    return {
      analysis: {
        faultType: '离线智能诊断',
        confidence: 0.6,
        solutions: generateOfflineDiagnosis(text)
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

// 离线智能诊断函数
function generateOfflineDiagnosis(text: string): string[] {
  const lowerText = text.toLowerCase();
  
  // 电池相关故障
  if (lowerText.includes('电池') || lowerText.includes('充电') || lowerText.includes('电量')) {
    return [
      '🔋 电池系统诊断建议：',
      '1. 检查电池连接器是否松动或腐蚀',
      '2. 测量电池电压和内阻是否正常',
      '3. 检查充电桩与电池的通信状态',
      '4. 查看BMS（电池管理系统）是否有故障码',
      '5. 如果是温度异常，检查散热系统'
    ];
  }
  
  // 机械臂相关故障
  if (lowerText.includes('机械') || lowerText.includes('臂') || lowerText.includes('夹具') || lowerText.includes('移动')) {
    return [
      '🤖 机械系统诊断建议：',
      '1. 检查液压系统压力是否正常',
      '2. 查看各关节轴承是否有异常磨损',
      '3. 检查伺服电机和编码器工作状态',
      '4. 验证安全传感器功能是否正常',
      '5. 校准机械臂的位置精度'
    ];
  }
  
  // 系统通信故障
  if (lowerText.includes('通信') || lowerText.includes('网络') || lowerText.includes('连接') || lowerText.includes('信号')) {
    return [
      '📡 通信系统诊断建议：',
      '1. 检查网络连接和路由器状态',
      '2. 验证各模块间的CAN总线通信',
      '3. 检查无线通信模块信号强度',
      '4. 查看系统日志中的通信错误',
      '5. 重启通信模块并测试连接'
    ];
  }
  
  // 传感器故障
  if (lowerText.includes('传感器') || lowerText.includes('检测') || lowerText.includes('识别')) {
    return [
      '📷 传感器系统诊断建议：',
      '1. 清洁摄像头和激光传感器表面',
      '2. 检查传感器电源和信号线连接',
      '3. 校准位置和姿态传感器',
      '4. 测试传感器在不同环境下的性能',
      '5. 更新传感器驱动程序和算法'
    ];
  }
  
  // 默认通用诊断
  return [
    '🔧 通用诊断建议：',
    '1. 检查设备电源和主要连接线路',
    '2. 查看系统状态指示灯和显示屏信息',
    '3. 重启相关子系统并观察启动过程',
    '4. 查阅设备操作手册中的故障排除部分',
    '5. 记录详细的故障现象，必要时联系技术支持',
    '',
    '💡 提示：为获得更准确的诊断，请详细描述故障现象、发生时间和环境条件。'
  ];
}

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
