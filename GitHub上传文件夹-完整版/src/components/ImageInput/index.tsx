import React, { useRef, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Alert, 
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Divider,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Analytics as AnalysisIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface ImageInputProps {
  onImageUpload: (files: File[], analysisData?: MultiImageAnalysis) => Promise<void>;
}

interface ImageAnalysis {
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

interface SingleImageAnalysis {
  fileName: string;
  fileSize: number;
  analysisResults: ImageAnalysis[];
  overallDescription: string;
  primaryIssues: string[];
  recommendations: string[];
}

interface MultiImageAnalysis {
  individualAnalyses: SingleImageAnalysis[];
  overallSummary: string;
  commonIssues: string[];
  rootCauseAnalysis: RootCauseAnalysis[];
  prioritizedSolutions: PrioritizedSolution[];
}

interface RootCauseAnalysis {
  category: string;
  description: string;
  affectedImages: number[];
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

interface PrioritizedSolution {
  priority: number;
  title: string;
  description: string;
  estimatedCost: 'low' | 'medium' | 'high';
  timeToImplement: 'immediate' | 'short-term' | 'long-term';
  effectivenessScore: number;
  affectedIssues: string[];
}

// 添加文件验证结果接口
interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    size: number;
    type: string;
    dimensions?: { width: number; height: number };
    quality?: 'high' | 'medium' | 'low';
  };
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalyzingIndex, setCurrentAnalyzingIndex] = useState(-1);
  const [analysisResults, setAnalysisResults] = useState<MultiImageAnalysis | null>(null);
  const [validationResults, setValidationResults] = useState<FileValidationResult[]>([]);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error'>('success');

  // 文件验证配置
  const validationConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    minFileSize: 1024, // 1KB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'],
    maxFiles: 10,
    minDimensions: { width: 100, height: 100 },
    maxDimensions: { width: 4096, height: 4096 },
    recommendedDimensions: { width: 1920, height: 1080 }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentAnalyzingIndex(-1);
    
    try {
      const validationResults = await validateFiles(files);
      const validFiles = files.filter((_, index) => validationResults[index]?.isValid);
      
      if (validFiles.length === 0) {
        showSnackbar('没有有效的文件可以上传', 'error');
        return;
      }
      
      if (validFiles.length < files.length) {
        showSnackbar(`${files.length - validFiles.length} 个文件验证失败，仅处理有效文件`, 'warning');
      }
      
      // 继续原有的上传逻辑
      setSelectedFiles(validFiles);
      await processImages(validFiles);
      
    } catch (error) {
      console.error('文件验证失败:', error);
      showSnackbar('文件验证过程中出现错误', 'error');
    } finally {
      setIsAnalyzing(false);
      setCurrentAnalyzingIndex(-1);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    
    // 释放URL内存
    URL.revokeObjectURL(imageUrls[index]);
    
    setSelectedFiles(newFiles);
    setImageUrls(newUrls);
  };

  // 验证单个文件
  const validateFile = async (file: File): Promise<FileValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 1. 文件类型验证
    if (!validationConfig.allowedTypes.includes(file.type)) {
      errors.push(`不支持的文件格式: ${file.type}。支持的格式: JPG, PNG, WebP, BMP`);
    }

    // 2. 文件大小验证
    if (file.size > validationConfig.maxFileSize) {
      errors.push(`文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大允许: ${validationConfig.maxFileSize / 1024 / 1024}MB`);
    }
    
    if (file.size < validationConfig.minFileSize) {
      errors.push(`文件过小: ${file.size}字节。最小要求: ${validationConfig.minFileSize}字节`);
    }

    // 3. 图片尺寸和质量验证
    let dimensions: { width: number; height: number } | undefined;
    let quality: 'high' | 'medium' | 'low' = 'medium';

    try {
      const imageInfo = await getImageInfo(file);
      dimensions = imageInfo.dimensions;
      quality = imageInfo.quality;

      if (dimensions) {
        if (dimensions.width < validationConfig.minDimensions.width || 
            dimensions.height < validationConfig.minDimensions.height) {
          errors.push(`图片尺寸过小: ${dimensions.width}x${dimensions.height}。最小要求: ${validationConfig.minDimensions.width}x${validationConfig.minDimensions.height}`);
        }

        if (dimensions.width > validationConfig.maxDimensions.width || 
            dimensions.height > validationConfig.maxDimensions.height) {
          warnings.push(`图片尺寸较大: ${dimensions.width}x${dimensions.height}。建议尺寸: ${validationConfig.recommendedDimensions.width}x${validationConfig.recommendedDimensions.height}`);
        }

        // 检查宽高比
        const aspectRatio = dimensions.width / dimensions.height;
        if (aspectRatio < 0.5 || aspectRatio > 3) {
          warnings.push(`图片宽高比异常: ${aspectRatio.toFixed(2)}。建议使用标准比例的图片以获得更好的分析效果`);
        }
      }

      if (quality === 'low') {
        warnings.push('图片质量较低，可能影响分析准确性。建议使用高质量图片');
      }
    } catch (error) {
      errors.push('无法读取图片信息，请确保文件未损坏');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        size: file.size,
        type: file.type,
        dimensions,
        quality
      }
    };
  };

  // 获取图片信息
  const getImageInfo = (file: File): Promise<{ dimensions: { width: number; height: number }; quality: 'high' | 'medium' | 'low' }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        // 简单的质量评估（基于文件大小和尺寸）
        const pixelCount = img.width * img.height;
        const bytesPerPixel = file.size / pixelCount;
        
        let quality: 'high' | 'medium' | 'low' = 'medium';
        if (bytesPerPixel > 3) quality = 'high';
        else if (bytesPerPixel < 1) quality = 'low';
        
        resolve({
          dimensions: { width: img.width, height: img.height },
          quality
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('无法加载图片'));
      };
      
      img.src = url;
    });
  };

  // 批量验证文件
  const validateFiles = async (files: File[]): Promise<FileValidationResult[]> => {
    if (files.length > validationConfig.maxFiles) {
      showSnackbar(`最多只能上传 ${validationConfig.maxFiles} 个文件`, 'error');
      return [];
    }

    const results = await Promise.all(files.map(validateFile));
    setValidationResults(results);
    
    const hasErrors = results.some(r => !r.isValid);
    const hasWarnings = results.some(r => r.warnings.length > 0);
    
    if (hasErrors || hasWarnings) {
      setShowValidationDialog(true);
      return results;
    }
    
    showSnackbar('所有文件验证通过！', 'success');
    return results;
  };

  // 显示提示消息
  const showSnackbar = (message: string, severity: 'success' | 'warning' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 处理图片文件
  const processImages = async (files: File[]) => {
    setError(null);
    
    // 创建图片预览URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setImageUrls(urls);
    
    // 清除之前的分析结果
    setAnalysisResults(null);
    setAnalysisProgress(0);
    setCurrentAnalyzingIndex(-1);
  };

  // 详细的图片分析算法
  const analyzeImageRegion = (imageData: ImageData, x: number, y: number, width: number, height: number): ImageAnalysis => {
    const pixels = imageData.data;
    
    // 计算各种指标
    let totalBrightness = 0;
    let redPixels = 0;
    let darkPixels = 0;
    let edgePixels = 0;
    let metallic = 0;
    let textureVariation = 0;
    
    const regionPixelCount = width * height;
    
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        const pixelIndex = (row * imageData.width + col) * 4;
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];
        const brightness = (r + g + b) / 3;
        
        totalBrightness += brightness;
        
        // 检测锈蚀（红棕色）
        if (r > g + 20 && r > b + 20 && r > 100) redPixels++;
        
        // 检测暗区域
        if (brightness < 60) darkPixels++;
        
        // 金属表面检测
        if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && brightness > 120) metallic++;
        
        // 纹理变化检测
        if (col < x + width - 1 && row < y + height - 1) {
          const nextPixelIndex = (row * imageData.width + (col + 1)) * 4;
          const nextBrightness = (pixels[nextPixelIndex] + pixels[nextPixelIndex + 1] + pixels[nextPixelIndex + 2]) / 3;
          if (Math.abs(brightness - nextBrightness) > 30) textureVariation++;
        }
      }
    }
    
    const avgBrightness = totalBrightness / regionPixelCount;
    const redRatio = redPixels / regionPixelCount;
    const darkRatio = darkPixels / regionPixelCount;
    const metallicRatio = metallic / regionPixelCount;
    const textureRatio = textureVariation / regionPixelCount;
    
    // 智能问题识别
    let anomalyType: ImageAnalysis['anomalyType'] = 'normal';
    let description = '该区域设备状态正常';
    let detailedDescription = '通过像素分析，该区域表面光滑，颜色均匀，无明显异常特征。';
    let confidence = 0.8;
    let severity: ImageAnalysis['severity'] = 'low';
    let solution = '继续定期监控设备状态，保持正常维护周期';
    
    // 腐蚀检测 - 降低阈值，提高检测敏感度
    if (redRatio > 0.05 || (redRatio > 0.03 && darkRatio > 0.1)) {
      anomalyType = 'corrosion';
      description = '检测到腐蚀或锈蚀现象';
      detailedDescription = `该区域出现${Math.round(redRatio * 100)}%的红棕色像素，表明存在氧化锈蚀。锈蚀程度${redRatio > 0.15 ? '严重' : redRatio > 0.08 ? '中等' : '轻微'}，可能是由于长期暴露在潮湿环境中导致的金属氧化反应。`;
      confidence = Math.min(0.95, 0.65 + redRatio * 3);
      severity = redRatio > 0.15 ? 'high' : redRatio > 0.08 ? 'medium' : 'low';
      solution = redRatio > 0.15 ? 
        '立即停机检修，彻底清除锈蚀，重新涂抹防锈涂层，检查防水密封' :
        '安排近期维护，清理表面锈蚀，加强防腐保护措施';
    }
    // 裂纹检测 - 降低阈值
    else if (darkRatio > 0.15 && textureRatio > 0.08) {
      anomalyType = 'crack';
      description = '发现疑似裂纹或结构损伤';
      detailedDescription = `检测到${Math.round(darkRatio * 100)}%的深色线性区域，纹理变化率达${Math.round(textureRatio * 100)}%，高度怀疑存在裂纹。这种损伤模式通常由应力集中、疲劳载荷或材料老化引起。`;
      confidence = Math.min(0.92, 0.55 + darkRatio + textureRatio);
      severity = darkRatio > 0.25 ? 'high' : 'medium';
      solution = '立即停止使用，进行无损检测确认裂纹范围，制定修复或更换计划';
    }
    // 松动检测 - 降低阈值
    else if (textureRatio > 0.12 && metallicRatio < 0.5) {
      anomalyType = 'loose';
      description = '检测到连接部位可能存在松动';
      detailedDescription = `表面纹理变化异常，金属反光特征减弱，表明连接件可能出现位移或松动。纹理不规律性达${Math.round(textureRatio * 100)}%，需要检查紧固状态。`;
      confidence = 0.7 + textureRatio;
      severity = textureRatio > 0.2 ? 'high' : 'medium';
      solution = '检查所有紧固件，使用扭矩扳手重新紧固到标准扭矩值';
    }
    // 磨损检测 - 调整阈值
    else if (avgBrightness < 120 && metallicRatio > 0.3) {
      anomalyType = 'wear';
      description = '表面出现磨损痕迹';
      detailedDescription = `表面亮度降低至${Math.round(avgBrightness)}，但金属特征仍然明显，表明存在磨损但未达到严重程度。这通常是正常使用过程中的渐进性磨损。`;
      confidence = 0.65 + (120 - avgBrightness) / 100;
      severity = avgBrightness < 80 ? 'high' : avgBrightness < 100 ? 'medium' : 'low';
      solution = '监控磨损发展趋势，考虑增加润滑或调整操作参数以减缓磨损';
    }
    // 泄漏检测 - 调整阈值
    else if (avgBrightness > 180 && redRatio < 0.08) {
      anomalyType = 'leak';
      description = '检测到异常光亮区域，可能存在液体泄漏';
      detailedDescription = `区域异常明亮（亮度${Math.round(avgBrightness)}），可能存在液体反光现象，需要检查是否有油液或其他流体泄漏。`;
      confidence = 0.6 + (avgBrightness - 180) / 100;
      severity = avgBrightness > 220 ? 'high' : 'medium';
      solution = '仔细检查密封件和管路连接，查找泄漏源点并及时修复';
    }
    // 过热检测 - 新增检测类型
    else if (redRatio > 0.08 && avgBrightness > 150) {
      anomalyType = 'other';
      description = '检测到设备过热现象';
      detailedDescription = `区域呈现红色高温特征，平均亮度${Math.round(avgBrightness)}，红色像素比例${Math.round(redRatio * 100)}%，表明设备可能存在过热问题。`;
      confidence = 0.75;
      severity = redRatio > 0.15 ? 'high' : 'medium';
      solution = '立即检查冷却系统，监控设备温度，必要时停机降温';
    }
    
    return {
      region: { x, y, width, height },
      description,
      detailedDescription,
      confidence,
      anomalyType,
      severity,
      solution
    };
  };

  // 检测图片内容是否与设备故障相关
  const checkImageRelevance = (imageData: ImageData): { isRelevant: boolean; reason: string; confidence: number } => {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const totalPixels = width * height;
    
    // 分析颜色分布和特征
    let metallic = 0;
    let industrial = 0;
    let organic = 0;
    let cartoon = 0;
    let human = 0;
    let bright = 0;
    let saturated = 0;
    let vividColors = 0;
    let skinTone = 0;
    let unnatural = 0;
    
    // 采样分析（每10个像素采样一次以提高性能）
    for (let i = 0; i < pixels.length; i += 40) { // 每10个像素采样
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);
      
      // 金属/工业特征检测
      if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && brightness > 80 && brightness < 200) {
        metallic++;
      }
      
      // 工业设备特征（灰色、黑色、白色为主）
      if (saturation < 30 && (brightness < 80 || brightness > 180)) {
        industrial++;
      }
      
      // 有机/自然特征（绿色、棕色）
      if ((g > r + 20 && g > b + 20) || (r > 120 && g > 80 && b < 100)) {
        organic++;
      }
      
      // 卡通特征检测 - 更严格的检测
      if (saturation > 60 && brightness > 100) {
        cartoon++;
        if (saturation > 100) {
          vividColors++;
        }
      }
      
      // 非自然色彩检测（过于鲜艳的颜色）
      if (saturation > 120 || (brightness > 200 && saturation > 50)) {
        unnatural++;
      }
      
      // 人物特征（肤色检测）- 更精确的肤色检测
      if (r > 95 && g > 40 && b > 20 && r > b && r > g && r - g > 15 && r - b > 25) {
        human++;
        skinTone++;
      }
      
      // 明亮度检测
      if (brightness > 150) {
        bright++;
      }
      
      // 高饱和度检测
      if (saturation > 80) {
        saturated++;
      }
    }
    
    const sampleCount = Math.floor(totalPixels / 10);
    const metallicRatio = metallic / sampleCount;
    const industrialRatio = industrial / sampleCount;
    const organicRatio = organic / sampleCount;
    const cartoonRatio = cartoon / sampleCount;
    const humanRatio = human / sampleCount;
    const brightRatio = bright / sampleCount;
    const saturatedRatio = saturated / sampleCount;
    const vividRatio = vividColors / sampleCount;
    const unnaturalRatio = unnatural / sampleCount;
    const skinToneRatio = skinTone / sampleCount;
    
    // 判断是否为设备相关图片
    let isRelevant = true;
    let reason = '';
    let confidence = 0.8;
    
    // 卡通/动画图片检测 - 降低阈值，提高敏感度
    if ((cartoonRatio > 0.2 && saturatedRatio > 0.3) || 
        (vividRatio > 0.15 && brightRatio > 0.5) ||
        (unnaturalRatio > 0.25 && metallicRatio < 0.1)) {
      isRelevant = false;
      reason = '检测到卡通或动画图片，请上传真实的设备照片';
      confidence = 0.9;
    }
    // 人物照片检测 - 更精确
    else if ((humanRatio > 0.1 && skinToneRatio > 0.08) || 
             (skinToneRatio > 0.12 && organicRatio > 0.15)) {
      isRelevant = false;
      reason = '检测到人物照片，请上传设备或机械相关的图片';
      confidence = 0.85;
    }
    // 自然风景检测
    else if (organicRatio > 0.4 && industrialRatio < 0.1 && metallicRatio < 0.05) {
      isRelevant = false;
      reason = '检测到自然风景图片，请上传工业设备相关的图片';
      confidence = 0.8;
    }
    // 过于明亮/艺术图片 - 更严格
    else if ((brightRatio > 0.7 && saturatedRatio > 0.4 && metallicRatio < 0.1) ||
             (unnaturalRatio > 0.3 && industrialRatio < 0.15)) {
      isRelevant = false;
      reason = '图片过于明亮或艺术化，请上传清晰的设备实拍照片';
      confidence = 0.75;
    }
    // 工业设备相关性检测
    else if (metallicRatio > 0.15 || industrialRatio > 0.25) {
      isRelevant = true;
      reason = '检测到工业设备特征，适合进行故障分析';
      confidence = 0.8 + Math.min(0.15, metallicRatio + industrialRatio * 0.5);
    }
    // 边界情况 - 更严格的判断
    else if (metallicRatio < 0.05 && industrialRatio < 0.1 && organicRatio < 0.2 && 
             (cartoonRatio > 0.1 || saturatedRatio > 0.2 || unnaturalRatio > 0.15)) {
      isRelevant = false;
      reason = '无法识别设备特征，请确保图片包含机械设备或工业组件';
      confidence = 0.7;
    }
    
    return { isRelevant, reason, confidence };
  };

  // 分析单张图片
  const analyzeSingleImage = async (file: File, index: number): Promise<SingleImageAnalysis> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 首先检查图片内容相关性
        const relevanceCheck = checkImageRelevance(imageData);
        
        if (!relevanceCheck.isRelevant) {
          // 如果图片不相关，返回警告信息而不是故障分析
          resolve({
            fileName: file.name,
            fileSize: file.size,
            analysisResults: [{
              region: { x: 0, y: 0, width: canvas.width, height: canvas.height },
              description: '图片内容不相关',
              confidence: relevanceCheck.confidence,
              anomalyType: 'other',
              severity: 'low',
              solution: '请上传包含设备或机械组件的图片',
              detailedDescription: relevanceCheck.reason
            }],
            overallDescription: `图片"${file.name}"不适合进行设备故障分析：${relevanceCheck.reason}`,
            primaryIssues: ['图片内容不相关'],
            recommendations: [
              '请上传清晰的设备实拍照片',
              '确保图片包含机械设备、电气组件或工业设施',
              '避免上传人物、风景、卡通或艺术图片',
              '建议使用良好光照条件下拍摄的设备照片'
            ]
          });
          return;
        }
        
        // 如果图片相关，继续进行正常的故障分析
        // 4x4网格分析
        const gridSize = 4;
        const cellWidth = Math.floor(canvas.width / gridSize);
        const cellHeight = Math.floor(canvas.height / gridSize);
        
        const analyses: ImageAnalysis[] = [];
        const issues: string[] = [];
        
        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            const x = col * cellWidth;
            const y = row * cellHeight;
            
            const analysis = analyzeImageRegion(imageData, x, y, cellWidth, cellHeight);
            analyses.push(analysis);
            
            if (analysis.anomalyType !== 'normal') {
              issues.push(`区域${row * gridSize + col + 1}: ${analysis.description}`);
            }
          }
        }
        
        // 生成整体描述
        const anomalies = analyses.filter(a => a.anomalyType !== 'normal');
        const highSeverity = anomalies.filter(a => a.severity === 'high');
        const mediumSeverity = anomalies.filter(a => a.severity === 'medium');
        
        let overallDescription = '';
        if (highSeverity.length > 0) {
          overallDescription = `图片${index + 1}显示严重问题：发现${highSeverity.length}个高风险区域，主要涉及${highSeverity.map(a => a.anomalyType).join('、')}问题。需要立即处理。`;
        } else if (mediumSeverity.length > 0) {
          overallDescription = `图片${index + 1}显示中等风险：发现${mediumSeverity.length}个需要关注的区域，建议安排维护检查。`;
        } else if (anomalies.length > 0) {
          overallDescription = `图片${index + 1}显示轻微异常：发现${anomalies.length}个低风险点，建议加强监控。`;
        } else {
          overallDescription = `图片${index + 1}状态良好：所有检测区域均未发现明显异常，设备状态正常。`;
        }
        
        // 生成建议
        const recommendations = Array.from(new Set(anomalies.map(a => a.solution)));
        
        resolve({
          fileName: file.name,
          fileSize: file.size,
          analysisResults: analyses,
          overallDescription,
          primaryIssues: issues,
          recommendations
        });
      };
      
      img.onerror = () => {
        reject(new Error('无法加载图片'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 多图片综合分析
  const performMultiImageAnalysis = async (): Promise<MultiImageAnalysis> => {
    const individualAnalyses: SingleImageAnalysis[] = [];
    
    // 逐个分析图片
    for (let i = 0; i < selectedFiles.length; i++) {
      setCurrentAnalyzingIndex(i);
      setAnalysisProgress((i / selectedFiles.length) * 80); // 80%用于单图分析
      
      const analysis = await analyzeSingleImage(selectedFiles[i], i);
      individualAnalyses.push(analysis);
      
      // 模拟分析延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setAnalysisProgress(85);
    
    // 检查是否有不相关的图片
    const irrelevantImages = individualAnalyses.filter(a => 
      a.primaryIssues.includes('图片内容不相关')
    );
    
    // 如果所有图片都不相关
    if (irrelevantImages.length === individualAnalyses.length) {
      setAnalysisProgress(100);
      return {
        individualAnalyses,
        overallSummary: `检测到${individualAnalyses.length}张图片均不适合进行设备故障分析。请上传包含工业设备、机械组件或电气设施的真实照片。`,
        commonIssues: ['所有图片内容均不相关'],
        rootCauseAnalysis: [],
        prioritizedSolutions: [
          {
            priority: 1,
            title: '重新上传相关图片',
            description: '请上传清晰的设备实拍照片，确保图片包含需要诊断的机械设备或工业组件',
            estimatedCost: 'low',
            timeToImplement: 'immediate',
            effectivenessScore: 10,
            affectedIssues: ['图片内容不相关']
          }
        ]
      };
    }
    
    // 如果部分图片不相关，给出警告但继续分析相关图片
    const relevantAnalyses = individualAnalyses.filter(a => 
      !a.primaryIssues.includes('图片内容不相关')
    );
    
    // 只对相关图片进行故障分析
    const allAnomalies = relevantAnalyses.flatMap(a => 
      a.analysisResults.filter(r => r.anomalyType !== 'normal' && r.anomalyType !== 'other')
    );
    const issueTypes = [...new Set(allAnomalies.map(a => a.anomalyType))];
    
    const rootCauses: RootCauseAnalysis[] = [];
    
    // 腐蚀问题根源分析
    const corrosionIssues = allAnomalies.filter(a => a.anomalyType === 'corrosion');
    if (corrosionIssues.length > 0) {
      const affectedImages = [...new Set(relevantAnalyses
        .map((analysis, index) => analysis.analysisResults.some(r => r.anomalyType === 'corrosion') ? index : -1)
        .filter(i => i !== -1))];
      
      rootCauses.push({
        category: '环境腐蚀',
        description: '设备长期暴露在潮湿或化学腐蚀环境中，防护涂层失效导致金属氧化。可能原因包括：防护等级不足、密封失效、环境控制不当。',
        affectedImages,
        severity: corrosionIssues.some(i => i.severity === 'high') ? 'high' : 'medium',
        confidence: 0.85
      });
    }
    
    // 机械损伤根源分析
    const mechanicalIssues = allAnomalies.filter(a => ['crack', 'wear', 'loose'].includes(a.anomalyType));
    if (mechanicalIssues.length > 0) {
      const affectedImages = [...new Set(relevantAnalyses
        .map((analysis, index) => analysis.analysisResults.some(r => ['crack', 'wear', 'loose'].includes(r.anomalyType)) ? index : -1)
        .filter(i => i !== -1))];
      
      rootCauses.push({
        category: '机械应力',
        description: '设备承受超出设计范围的机械应力，或维护不当导致的渐进性损伤。可能原因：载荷超标、振动过大、润滑不足、安装精度问题。',
        affectedImages,
        severity: mechanicalIssues.some(i => i.severity === 'high') ? 'high' : 'medium',
        confidence: 0.78
      });
    }
    
    setAnalysisProgress(90);
    
    // 优先级解决方案
    const prioritizedSolutions: PrioritizedSolution[] = [];
    
    // 如果有不相关图片，首先建议重新上传
    if (irrelevantImages.length > 0) {
      prioritizedSolutions.push({
        priority: 1,
        title: '重新上传相关图片',
        description: `检测到${irrelevantImages.length}张图片不适合故障分析，建议重新上传包含设备组件的清晰照片`,
        estimatedCost: 'low',
        timeToImplement: 'immediate',
        effectivenessScore: 9,
        affectedIssues: ['图片内容不相关']
      });
    }
    
    // 如果有相关图片且发现故障，添加设备维护建议
    if (allAnomalies.length > 0) {
      prioritizedSolutions.push({
        priority: irrelevantImages.length > 0 ? 2 : 1,
        title: '立即安全检查',
        description: '对换电站进行全面安全检查，确保设备运行正常',
        estimatedCost: 'medium',
        timeToImplement: 'immediate',
        effectivenessScore: 9,
        affectedIssues: ['电气安全', '设备故障']
      });
      
      prioritizedSolutions.push({
        priority: irrelevantImages.length > 0 ? 3 : 2,
        title: '设备维护',
        description: '定期维护电气设备，预防潜在故障',
        estimatedCost: 'low',
        timeToImplement: 'short-term',
        effectivenessScore: 8,
        affectedIssues: ['设备老化', '性能下降']
      });
    } else if (relevantAnalyses.length > 0) {
      // 相关图片但无故障
      prioritizedSolutions.push({
        priority: irrelevantImages.length > 0 ? 2 : 1,
        title: '继续监控',
        description: '设备状态良好，建议继续定期监控和维护',
        estimatedCost: 'low',
        timeToImplement: 'short-term',
        effectivenessScore: 7,
        affectedIssues: ['预防性维护']
      });
    }
    
    setAnalysisProgress(95);
    
    // 生成总结
    const totalImages = selectedFiles.length;
    const relevantImageCount = relevantAnalyses.length;
    const irrelevantImageCount = irrelevantImages.length;
    const totalAnomalies = allAnomalies.length;
    const highRiskImages = relevantAnalyses.filter(a => a.analysisResults.some(r => r.severity === 'high')).length;
    
    let overallSummary = '';
    if (irrelevantImageCount > 0 && relevantImageCount > 0) {
      overallSummary = `综合分析结果：共检测${totalImages}张图片，其中${relevantImageCount}张适合故障分析，${irrelevantImageCount}张图片内容不相关。在相关图片中发现${totalAnomalies}个异常点。${highRiskImages > 0 ? `其中${highRiskImages}张图片存在高风险问题，需要立即关注。` : ''}建议重新上传更多相关的设备照片以获得更准确的诊断结果。`;
    } else if (relevantImageCount > 0) {
      overallSummary = `综合分析结果：共检测${totalImages}张图片，发现${totalAnomalies}个异常点。${highRiskImages > 0 ? `其中${highRiskImages}张图片存在高风险问题，需要立即关注。` : ''}主要问题类型包括：${issueTypes.join('、')}。建议按照优先级顺序实施解决方案，确保设备安全可靠运行。`;
    }
    
    const commonIssues = [];
    if (irrelevantImageCount > 0) {
      commonIssues.push(`${irrelevantImageCount}张图片内容不相关`);
    }
    issueTypes.forEach(type => {
      const count = allAnomalies.filter(a => a.anomalyType === type).length;
      if (count > 0) {
        commonIssues.push(`${type}问题出现${count}次`);
      }
    });
    
    setAnalysisProgress(100);
    
    return {
      individualAnalyses,
      overallSummary,
      commonIssues,
      rootCauseAnalysis: rootCauses,
      prioritizedSolutions
    };
  };

  const startImageAnalysis = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentAnalyzingIndex(-1);
    
    try {
      const results = await performMultiImageAnalysis();
      setAnalysisResults(results);
      
      // 调用父组件回调
      await onImageUpload(selectedFiles, results);
      
    } catch (err) {
      setError('图片分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
      setCurrentAnalyzingIndex(-1);
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'error';
      case 2: return 'warning';
      case 3: return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            📷 多图片智能诊断
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            支持上传多张相关图片，AI将进行逐一分析并提供综合诊断报告
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />

          {selectedFiles.length === 0 ? (
            <Box sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center', 
              mb: 3,
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                点击上传图片文件（支持多选）
              </Typography>
              <Typography variant="body2" color="text.secondary">
                支持 JPG, PNG, GIF 等常见图片格式，可同时选择多张相关图片
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* 图片预览网格 */}
              <Typography variant="h6" gutterBottom>
                已选择 {selectedFiles.length} 张图片
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {selectedFiles.map((file, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined" sx={{ 
                      position: 'relative',
                      border: currentAnalyzingIndex === index ? '2px solid #1976d2' : '1px solid #e0e0e0'
                    }}>
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={imageUrls[index]}
                          alt={`预览 ${index + 1}`}
                          style={{ 
                            width: '100%', 
                            height: 200, 
                            objectFit: 'cover',
                            borderRadius: '4px 4px 0 0'
                          }}
                        />
                        {currentAnalyzingIndex === index && (
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(25, 118, 210, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Paper sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.9)' }}>
                              <Typography variant="caption" color="primary">
                                正在分析...
                              </Typography>
                            </Paper>
                          </Box>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="caption" noWrap>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                
                {/* 添加更多图片按钮 */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: 280,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'grey.50' }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        添加更多图片
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                onClick={startImageAnalysis}
                disabled={isAnalyzing}
                fullWidth
                size="large"
                startIcon={<AnalysisIcon />}
                sx={{ mb: 3 }}
              >
                {isAnalyzing ? `分析中... (${analysisProgress.toFixed(0)}%)` : `开始智能分析 (${selectedFiles.length}张图片)`}
              </Button>
              
              {isAnalyzing && (
                <Box sx={{ mb: 3 }}>
                  <LinearProgress variant="determinate" value={analysisProgress} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {currentAnalyzingIndex >= 0 ? 
                      `正在分析第 ${currentAnalyzingIndex + 1} 张图片...` :
                      '准备开始分析...'
                    }
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </CardContent>
      </Card>

      {/* 分析结果展示 */}
      {analysisResults && (
        <Box sx={{ mt: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary.main">
                🔍 综合分析报告
              </Typography>
              
              {/* 总体概述 */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  总体概述
                </Typography>
                <Typography variant="body1">
                  {analysisResults.overallSummary}
                </Typography>
              </Paper>

              {/* 单图分析结果 */}
              <Typography variant="h6" gutterBottom>
                逐图详细分析
              </Typography>
              {analysisResults.individualAnalyses.map((analysis, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ImageIcon />
                      <Typography variant="subtitle1">
                        图片 {index + 1}: {analysis.fileName}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${analysis.analysisResults.filter(r => r.anomalyType !== 'normal').length} 个异常`}
                        color={analysis.analysisResults.some(r => r.severity === 'high') ? 'error' : 
                               analysis.analysisResults.some(r => r.severity === 'medium') ? 'warning' : 'success'}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {analysis.overallDescription}
                    </Typography>
                    
                    {analysis.primaryIssues.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          发现的主要问题：
                        </Typography>
                        <List dense>
                          {analysis.primaryIssues.map((issue, issueIndex) => (
                            <ListItem key={issueIndex}>
                              <ListItemText primary={issue} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {analysis.recommendations.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          建议措施：
                        </Typography>
                        <List dense>
                          {analysis.recommendations.map((rec, recIndex) => (
                            <ListItem key={recIndex}>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}

              <Divider sx={{ my: 3 }} />

              {/* 问题根源分析 */}
              {analysisResults.rootCauseAnalysis.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    问题根源分析
                  </Typography>
                  {analysisResults.rootCauseAnalysis.map((rootCause, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {rootCause.category}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={`${(rootCause.confidence * 100).toFixed(0)}% 可信度`}
                          color={getSeverityColor(rootCause.severity) as any}
                        />
                        <Chip 
                          size="small" 
                          label={`影响 ${rootCause.affectedImages.length} 张图片`}
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2">
                        {rootCause.description}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* 优先级解决方案 */}
              <Typography variant="h6" gutterBottom>
                优先级解决方案
              </Typography>
              {analysisResults.prioritizedSolutions.map((solution, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip 
                      label={`优先级 ${solution.priority}`}
                      color={getPriorityColor(solution.priority) as any}
                      variant="filled"
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {solution.title}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`有效性 ${(solution.effectivenessScore * 100).toFixed(0)}%`}
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {solution.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip size="small" label={`成本: ${solution.estimatedCost}`} />
                    <Chip size="small" label={`时间: ${solution.timeToImplement}`} />
                    <Chip size="small" label={`解决 ${solution.affectedIssues.length} 个问题`} />
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 文件验证对话框 */}
      <Dialog 
        open={showValidationDialog} 
        onClose={() => setShowValidationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          文件验证结果
        </DialogTitle>
        <DialogContent>
          {validationResults.map((result, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {result.isValid ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                  <Typography variant="subtitle1">
                    文件 {index + 1}: {result.fileInfo.type}
                  </Typography>
                  <Chip 
                    label={result.isValid ? '有效' : '无效'} 
                    color={result.isValid ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  大小: {(result.fileInfo.size / 1024).toFixed(1)}KB
                  {result.fileInfo.dimensions && (
                    ` | 尺寸: ${result.fileInfo.dimensions.width}x${result.fileInfo.dimensions.height}`
                  )}
                  {result.fileInfo.quality && (
                    ` | 质量: ${result.fileInfo.quality === 'high' ? '高' : result.fileInfo.quality === 'medium' ? '中' : '低'}`
                  )}
                </Typography>

                {result.errors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>错误：</strong>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {result.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </Typography>
                  </Alert>
                )}

                {result.warnings.length > 0 && (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>警告：</strong>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {result.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowValidationDialog(false)}>
            确定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageInput; 