import type { DiagnosisResult, Statistics } from '../types';
import axios from 'axios';

export const analyzeVideo = async (file: File): Promise<DiagnosisResult> => {
  const formData = new FormData();
  formData.append('video', file);

  try {
    const response = await axios.post('http://localhost:5000/analyze/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('视频分析失败');
  }
};

export const analyzeText = async (text: string): Promise<DiagnosisResult> => {
  try {
    const response = await axios.post('http://localhost:5000/analyze/text', { text });
    return response.data;
  } catch (error) {
    throw new Error('文本分析失败');
  }
};

export const analyzeVideoFrame = async (frame: ImageData): Promise<DiagnosisResult> => {
  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建canvas上下文');
  }
  
  ctx.putImageData(frame, 0, 0);
  
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else throw new Error('无法创建Blob');
    }, 'image/jpeg');
  });

  const formData = new FormData();
  formData.append('frame', blob);

  try {
    const response = await axios.post('http://localhost:5000/analyze/frame', formData);
    return response.data;
  } catch (error) {
    throw new Error('视频帧分析失败');
  }
}; 