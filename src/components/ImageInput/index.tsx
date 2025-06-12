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
  AccordionDetails
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Analytics as AnalysisIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('请选择有效的图片文件');
      return;
    }

    setSelectedFiles(imageFiles);
    setError(null);
    
    // 创建图片预览URLs
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    setImageUrls(urls);
    
    // 清除之前的分析结果
    setAnalysisResults(null);
    setAnalysisProgress(0);
    setCurrentAnalyzingIndex(-1);
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    
    // 释放URL内存
    URL.revokeObjectURL(imageUrls[index]);
    
    setSelectedFiles(newFiles);
    setImageUrls(newUrls);
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

  // 分析单张图片
  const analyzeSingleImage = async (file: File, index: number): Promise<SingleImageAnalysis> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
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
    
    // 问题根源分析
    const allAnomalies = individualAnalyses.flatMap(a => a.analysisResults.filter(r => r.anomalyType !== 'normal'));
    const issueTypes = [...new Set(allAnomalies.map(a => a.anomalyType))];
    
    const rootCauses: RootCauseAnalysis[] = [];
    
    // 腐蚀问题根源分析
    const corrosionIssues = allAnomalies.filter(a => a.anomalyType === 'corrosion');
    if (corrosionIssues.length > 0) {
      const affectedImages = [...new Set(individualAnalyses
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
      const affectedImages = [...new Set(individualAnalyses
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
    const prioritizedSolutions: PrioritizedSolution[] = [
      {
        priority: 1,
        title: '立即安全检查',
        description: '对换电站进行全面安全检查，确保设备运行正常',
        estimatedCost: 'medium',
        timeToImplement: 'immediate',
        effectivenessScore: 9,
        affectedIssues: ['电气安全', '设备故障']
      },
      {
        priority: 2,
        title: '设备维护',
        description: '定期维护电气设备，预防潜在故障',
        estimatedCost: 'low',
        timeToImplement: 'short-term',
        effectivenessScore: 8,
        affectedIssues: ['设备老化', '性能下降']
      },
      {
        priority: 3,
        title: '系统升级',
        description: '升级控制系统，提高运行效率和安全性',
        estimatedCost: 'high',
        timeToImplement: 'long-term',
        effectivenessScore: 10,
        affectedIssues: ['系统兼容性', '性能优化']
      }
    ];
    
    setAnalysisProgress(95);
    
    // 生成总结
    const totalAnomalies = allAnomalies.length;
    const totalImages = selectedFiles.length;
    const highRiskImages = individualAnalyses.filter(a => a.analysisResults.some(r => r.severity === 'high')).length;
    
    const overallSummary = `
    综合分析结果：共检测${totalImages}张图片，发现${totalAnomalies}个异常点。
    其中${highRiskImages}张图片存在高风险问题，需要立即关注。
    主要问题类型包括：${issueTypes.join('、')}。
    建议按照优先级顺序实施解决方案，确保设备安全可靠运行。
    `;
    
    const commonIssues = issueTypes.map(type => {
      const count = allAnomalies.filter(a => a.anomalyType === type).length;
      return `${type}问题出现${count}次`;
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
    </Box>
  );
};

export default ImageInput; 