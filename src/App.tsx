import React, { useState, useEffect } from 'react';
import './App.css';
import TextInput from './components/TextInput';
import VideoInput from './components/VideoInput';
import ImageInput from './components/ImageInput';
import AudioInput from './components/AudioInput';
import MaterialLibrary from './components/MaterialLibrary';
import KnowledgeGraph from './components/KnowledgeGraph';
import SmartDiagnosis from './components/SmartDiagnosis';
import DecisionTree from './components/DecisionTree';
import { analyzeText, analyzeVideo } from './api/faultAnalysis';
import DiagnosisResult from './components/DiagnosisResult';
import { 
  CircularProgress, 
  Alert, 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  IconButton, 
  Menu, 
  MenuItem, 
  AppBar,
  Toolbar,
  ButtonGroup,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  DescriptionOutlined as TextIcon,
  ImageOutlined as ImageIcon,
  VideoFileOutlined as VideoIcon,
  AudioFileOutlined as AudioIcon,
  SmartToy as DiagnosisIcon,
  LibraryBooks as MaterialIcon,
  Schema as KnowledgeIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';
import { 
  DiagnosisResult as DiagnosisResultType, 
  Statistics,
  TextAnalysisResponse,
  VideoAnalysisResponse,
  MaterialItem,
  CustomLogo
} from './types';

// 知识库文档接口
interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  relatedDocuments: string[];
}

function App() {
  const [activeInput, setActiveInput] = useState<'text' | 'video' | 'image' | 'audio' | 'material' | 'knowledge' | 'graph' | 'diagnosis' | 'decision-tree'>('text');
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResultType | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({
    totalFrames: 0,
    analyzedFrames: 0,
    abnormalFrames: 0,
    abnormalRatio: 0,
    duration: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'text' | 'video' | 'audio' | 'image' | 'multi-image'>('text');
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<HTMLElement | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  // 知识库和素材库状态
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  
  // 初始化知识库数据
  useEffect(() => {
    const initializeKnowledgeBase = () => {
      const baseKnowledge: KnowledgeDocument[] = [
        {
          id: 'kb_001',
          title: '电动汽车换电站机械手臂故障诊断',
          content: '机械手臂常见故障包括：1. 轴承磨损导致的异响；2. 液压系统泄漏；3. 传感器失效；4. 驱动电机过热。诊断时需检查液压油压力、电机温度、传感器信号、运行轨迹精度。',
          category: '机械故障',
          tags: ['机械手臂', '故障诊断', '轴承', '液压', '传感器'],
          createdAt: new Date().toISOString(),
          relatedDocuments: ['kb_002', 'kb_003']
        },
        {
          id: 'kb_002',
          title: '换电站电池连接器故障分析',
          content: '电池连接器故障主要表现：1. 接触电阻过大；2. 连接器松动；3. 触点腐蚀；4. 绝缘老化。检测方法：温度监测、电阻测试、外观检查、绝缘测试。',
          category: '电气故障',
          tags: ['电池连接器', '接触电阻', '腐蚀', '绝缘'],
          createdAt: new Date().toISOString(),
          relatedDocuments: ['kb_001', 'kb_004']
        },
        {
          id: 'kb_003',
          title: '换电站安全系统监控要点',
          content: '安全系统包括：1. 火灾探测系统；2. 气体泄漏监测；3. 紧急停机系统；4. 人员安全防护。关键监控参数：温度、烟雾浓度、可燃气体浓度、光幕状态。',
          category: '安全系统',
          tags: ['安全监控', '火灾探测', '气体监测', '紧急停机'],
          createdAt: new Date().toISOString(),
          relatedDocuments: ['kb_002', 'kb_005']
        },
        {
          id: 'kb_004',
          title: 'BMS电池管理系统故障处理',
          content: 'BMS故障类型：1. 电压采集异常；2. 温度传感器故障；3. 均衡控制失效；4. 通信中断。故障处理：检查传感器连接、校准电压基准、更新软件版本、检测通信线路。',
          category: '电池系统',
          tags: ['BMS', '电压采集', '温度传感器', '均衡控制'],
          createdAt: new Date().toISOString(),
          relatedDocuments: ['kb_002', 'kb_006']
        },
        {
          id: 'kb_005',
          title: '换电站预防性维护流程',
          content: '维护周期：日检、周检、月检、年检。日检：设备运行状态、安全系统、清洁度。周检：机械传动、电气连接、液压系统。月检：精度校准、软件更新、备件检查。年检：全面大修、部件更换、性能测试。',
          category: '维护保养',
          tags: ['预防性维护', '日检', '周检', '月检', '年检'],
          createdAt: new Date().toISOString(),
          relatedDocuments: ['kb_001', 'kb_003']
        },
        {
          id: 'kb_006',
          title: '换电站环境监控系统',
          content: '环境参数监控：1. 温湿度控制（20-25℃，相对湿度<70%）；2. 空气质量监测；3. 照明系统；4. 通风系统。异常处理：自动调节、报警通知、应急响应。',
          category: '系统概述',
          tags: ['环境监控', '温湿度', '空气质量', '通风系统'],
          createdAt: new Date().toISOString(),
          relatedDocuments: ['kb_003', 'kb_004']
        }
      ];

      // 检查localStorage中是否已有知识库数据
      const savedKnowledge = localStorage.getItem('knowledgeBase');
      if (savedKnowledge) {
        try {
          const parsedKnowledge = JSON.parse(savedKnowledge);
          setKnowledgeDocuments(parsedKnowledge);
        } catch (error) {
          console.error('加载知识库失败:', error);
          setKnowledgeDocuments(baseKnowledge);
          localStorage.setItem('knowledgeBase', JSON.stringify(baseKnowledge));
        }
      } else {
        setKnowledgeDocuments(baseKnowledge);
        localStorage.setItem('knowledgeBase', JSON.stringify(baseKnowledge));
      }
    };

    initializeKnowledgeBase();
  }, []);

  // Logo相关状态
  const [selectedLogo, setSelectedLogo] = useState('/logo.png');
  const [customLogos, setCustomLogos] = useState<CustomLogo[]>([]);

  // 加载保存的Logo设置
  useEffect(() => {
    const loadLogoSettings = () => {
      try {
        const savedLogo = localStorage.getItem('selectedLogo');
        if (savedLogo) {
          setSelectedLogo(savedLogo);
        }

        const savedCustomLogos = localStorage.getItem('customLogos');
        if (savedCustomLogos) {
          const parsedLogos = JSON.parse(savedCustomLogos);
          setCustomLogos(parsedLogos);
        }
      } catch (error) {
        console.error('加载Logo设置失败:', error);
      }
    };

    loadLogoSettings();
  }, []);

  // 保存Logo设置
  const saveLogoSettings = (logo: string, customLogos: CustomLogo[] = []) => {
    try {
      localStorage.setItem('selectedLogo', logo);
      localStorage.setItem('customLogos', JSON.stringify(customLogos));
    } catch (error) {
      console.error('保存Logo设置失败:', error);
    }
  };

  // 处理Logo选择
  const handleLogoSelect = (logoPath: string) => {
    setSelectedLogo(logoPath);
    saveLogoSettings(logoPath, customLogos);
  };

  // 处理自定义Logo上传
  const handleCustomLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('请选择JPG、PNG或GIF格式的图片文件');
        return;
      }

      // 验证文件大小（限制为2MB）
      if (file.size > 2 * 1024 * 1024) {
        alert('图片文件大小不能超过2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newLogo: CustomLogo = {
          id: `custom_${Date.now()}`,
          name: file.name,
          path: result,
          uploadDate: new Date().toISOString()
        };

        const updatedCustomLogos = [...customLogos, newLogo];
        setCustomLogos(updatedCustomLogos);
        setSelectedLogo(result);
        saveLogoSettings(result, updatedCustomLogos);
      };
      reader.readAsDataURL(file);
    }
  };

  // 删除自定义Logo
  const handleDeleteCustomLogo = (logoId: string) => {
    const updatedCustomLogos = customLogos.filter(logo => logo.id !== logoId);
    setCustomLogos(updatedCustomLogos);
    
    // 如果删除的是当前选中的Logo，切换到默认Logo
    const deletedLogo = customLogos.find(logo => logo.id === logoId);
    if (deletedLogo && selectedLogo === deletedLogo.path) {
      setSelectedLogo('/logo.png');
      saveLogoSettings('/logo.png', updatedCustomLogos);
    } else {
      saveLogoSettings(selectedLogo, updatedCustomLogos);
    }
  };

  // 预设Logo选项
  const presetLogos = [
    { name: '默认标识', path: '/logo.png' },
    { name: '电池图标', path: '🔋' },
    { name: '闪电图标', path: '⚡' },
    { name: '齿轮图标', path: '⚙️' },
    { name: '工具图标', path: '🔧' },
    { name: '汽车图标', path: '🚗' }
  ];

  // 诊断日志保存函数
  const saveDiagnosisLog = async (logData: {
    type: 'text' | 'image' | 'video' | 'audio' | 'multi-image';
    files?: File[];
    result: DiagnosisResultType;
  }) => {
    try {
      const logEntry = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: logData.type,
        description: generateLogDescription(logData),
        result: logData.result,
        fileCount: logData.files?.length || 0,
        fileNames: logData.files?.map(f => f.name) || [],
        severity: logData.result.severity,
        faultType: logData.result.faultType,
        confidence: logData.result.confidence
      };

      // 获取现有日志
      const existingLogs = JSON.parse(localStorage.getItem('diagnosisLogs') || '[]');
      
      // 添加新日志（最新的在前面）
      const updatedLogs = [logEntry, ...existingLogs];
      
      // 限制日志数量（保留最近100条）
      const limitedLogs = updatedLogs.slice(0, 100);
      
      // 保存到localStorage
      localStorage.setItem('diagnosisLogs', JSON.stringify(limitedLogs));
      
      console.log('诊断日志已保存:', logEntry);
    } catch (error) {
      console.error('保存诊断日志失败:', error);
    }
  };

  // 生成日志描述
  const generateLogDescription = (logData: {
    type: string;
    files?: File[];
    result: DiagnosisResultType;
  }): string => {
    const typeDisplayName = getTypeDisplayName(logData.type);
    const fileInfo = logData.files && logData.files.length > 0 
      ? `${logData.files.length}个文件` 
      : '文本输入';
    const severityText = getSeverityText(logData.result.severity);
    
    return `${typeDisplayName}诊断 - ${fileInfo} - ${severityText}`;
  };

  // 获取类型显示名称
  const getTypeDisplayName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'text': '文本',
      'image': '图片',
      'video': '视频',
      'audio': '音频',
      'multi-image': '多图片'
    };
    return typeMap[type] || type;
  };

  // 获取严重程度文本
  const getSeverityText = (severity: string): string => {
    const severityMap: { [key: string]: string } = {
      'low': '轻微',
      'medium': '中等',
      'high': '严重'
    };
    return severityMap[severity] || severity;
  };

  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 处理素材库变化
  const handleMaterialsChange = (newMaterials: MaterialItem[]) => {
    setMaterials(newMaterials);
  };

  // 处理知识库文档变化
  const handleKnowledgeDocumentsChange = (documents: KnowledgeDocument[]) => {
    setKnowledgeDocuments(documents);
    localStorage.setItem('knowledgeBase', JSON.stringify(documents));
  };

  // 显示知识图谱
  const handleShowKnowledgeGraph = (show: boolean = true) => {
    setShowKnowledgeGraph(show);
  };

  // 添加到知识库的处理函数
  const handleAddToKnowledgeBase = (document: KnowledgeDocument) => {
    const updatedDocuments = [...knowledgeDocuments, document];
    setKnowledgeDocuments(updatedDocuments);
    localStorage.setItem('knowledgeBase', JSON.stringify(updatedDocuments));
  };

  // 清理诊断结果的函数
  const clearDiagnosisResult = () => {
    setDiagnosisResult(null);
    setError(null);
    setStatistics({
      totalFrames: 0,
      analyzedFrames: 0,
      abnormalFrames: 0,
      abnormalRatio: 0,
      duration: 0
    });
  };

  // 处理文本分析
  const handleTextAnalysis = async (text: string) => {
    setLoading(true);
    setError(null);
    setAnalysisType('text');
    
    try {
      const result = await analyzeText(text);
      setDiagnosisResult(result);
      
      // 保存诊断日志
      await saveDiagnosisLog({
        type: 'text',
        result: result
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理视频分析
  const handleVideoAnalysis = async (file: File) => {
    setLoading(true);
    setError(null);
    setAnalysisType('video');
    
    try {
      const result = await analyzeVideo(file);
      setDiagnosisResult(result);
      
      // 保存诊断日志
      await saveDiagnosisLog({
        type: 'video',
        files: [file],
        result: result
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理音频分析
  const handleAudioAnalysis = async (file: File) => {
    setLoading(true);
    setError(null);
    setAnalysisType('audio');
    
    try {
      // 模拟音频分析
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: DiagnosisResultType = {
        faultType: '音频异常',
        severity: 'medium',
        confidence: 0.75,
        description: `音频文件 ${file.name} 分析完成。检测到设备运行声音异常，可能存在机械振动或电机异响问题。`,
        solutions: [
          '检查设备机械部件是否松动',
          '检查电机运行状态',
          '进行设备润滑保养',
          '联系专业技术人员进行详细检查'
        ],
        timestamp: new Date().toISOString(),
        analysisDetails: {
          audioFeatures: {
            duration: 30,
            sampleRate: 44100,
            channels: 2,
            peakFrequency: 1200,
            averageAmplitude: 0.65
          },
          detectedAnomalies: [
            { type: '高频噪声', confidence: 0.8, timeRange: '5-10s' },
            { type: '振动异响', confidence: 0.7, timeRange: '15-20s' }
          ]
        }
      };
      
      setDiagnosisResult(result);
      
      // 保存诊断日志
      await saveDiagnosisLog({
        type: 'audio',
        files: [file],
        result: result
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '音频分析失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理图片上传和分析
  const handleImageUpload = async (files: File[], analysisData?: any) => {
    setLoading(true);
    setError(null);
    setAnalysisType(files.length > 1 ? 'multi-image' : 'image');
    
    try {
      let result: DiagnosisResultType;
      
      if (analysisData) {
        // 使用ImageInput组件提供的分析数据
        result = convertImageAnalysisToResult(analysisData, files);
      } else {
        // 执行高级图片分析
        result = await performAdvancedImageAnalysis(files);
      }
      
      setDiagnosisResult(result);
      
      // 保存诊断日志
      await saveDiagnosisLog({
        type: files.length > 1 ? 'multi-image' : 'image',
        files: files,
        result: result
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片分析失败');
    } finally {
      setLoading(false);
    }
  };

  // 转换ImageInput的分析数据为DiagnosisResult格式
  const convertImageAnalysisToResult = (analysisData: any, files: File[]): DiagnosisResultType => {
    const { detectedIssues, confidence, regions } = analysisData;
    
    // 查找相关知识
    const relatedKnowledge = findMatchingKnowledge(detectedIssues);
    
    // 确定故障类型
    const faultType = determineFaultType(detectedIssues);
    
    // 生成解决方案
    const solutions = generateSolutions(detectedIssues, relatedKnowledge);
    
    // 确定严重程度
    const severity = determineSeverity(detectedIssues);
    
    // 生成描述
    const description = generateDescription(files.length, detectedIssues, relatedKnowledge);

    const commonIssues = ['腐蚀', '裂纹', '磨损', '过热', '变形', '污染'];
    
    return {
      faultType,
      severity,
      confidence,
      description,
      solutions,
      timestamp: new Date().toISOString(),
      analysisDetails: {
        imageCount: files.length,
        detectedIssues,
        regions,
        relatedKnowledge: relatedKnowledge.map(kb => ({
          id: kb.id,
          title: kb.title,
          category: kb.category
        })),
        processingTime: Date.now() - (analysisData.startTime || Date.now())
      }
    };
  };

  // 执行高级图片分析
  const performAdvancedImageAnalysis = async (files: File[]): Promise<DiagnosisResultType> => {
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const allDetectedIssues: string[] = [];
    const allRegions: any[] = [];
    
    // 分析每个图片文件
    for (const file of files) {
      const analysisResult = await analyzeImageWithKnowledge(file);
      allDetectedIssues.push(...analysisResult.detectedIssues);
      allRegions.push(...analysisResult.regions);
    }
    
    // 去重检测到的问题
    const uniqueIssues = [...new Set(allDetectedIssues)];
    
    // 计算平均置信度
    const avgConfidence = allDetectedIssues.length > 0 ? 
      allDetectedIssues.length / (files.length * 4) : 0.1; // 假设每个图片最多检测4种问题
    
    return convertImageAnalysisToResult({
      detectedIssues: uniqueIssues,
      confidence: Math.min(avgConfidence, 0.95),
      regions: allRegions
    }, files);
  };

  // 使用知识库分析图片
  const analyzeImageWithKnowledge = async (file: File): Promise<{
    detectedIssues: string[];
    confidence: number;
    regions: any[];
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const features = extractImageFeatures(imageData);
          const detectedIssues: string[] = [];
          const regions: any[] = [];
          
          // 腐蚀检测 (降低阈值提高敏感度)
          if (features.redPixelRatio > 0.05) { // 从15%降低到5%
            detectedIssues.push('腐蚀');
            regions.push({
              type: '腐蚀',
              confidence: Math.min(features.redPixelRatio * 2, 0.95),
              area: features.redPixelRatio * 100
            });
          }
          
          // 裂纹检测 (降低阈值)
          if (features.darkPixelRatio > 0.15) { // 从30%降低到15%
            detectedIssues.push('裂纹');
            regions.push({
              type: '裂纹',
              confidence: Math.min(features.darkPixelRatio * 1.5, 0.9),
              area: features.darkPixelRatio * 100
            });
          }
          
          // 磨损检测 (调整亮度阈值)
          if (features.averageBrightness < 120) { // 从90提高到120
            detectedIssues.push('磨损');
            regions.push({
              type: '磨损',
              confidence: Math.min((120 - features.averageBrightness) / 120, 0.85),
              area: 25
            });
          }
          
          // 过热检测 (新增)
          if (features.redChannelAvg > 180 && features.redChannelAvg > features.greenChannelAvg + 30) {
            detectedIssues.push('过热');
            regions.push({
              type: '过热',
              confidence: Math.min((features.redChannelAvg - 150) / 100, 0.9),
              area: 15
            });
          }
          
          // 如果没有检测到明显问题，进行更细致的分析
          if (detectedIssues.length === 0) {
            // 轻微异常检测
            if (features.contrast < 50) {
              detectedIssues.push('表面模糊');
            }
            if (features.redPixelRatio > 0.02) { // 更低的阈值
              detectedIssues.push('轻微变色');
            }
          }
          
          const confidence = detectedIssues.length > 0 ? 
            Math.min(0.6 + (detectedIssues.length * 0.1), 0.95) : 0.3;
          
          resolve({
            detectedIssues,
            confidence,
            regions
          });
        } else {
          resolve({
            detectedIssues: [],
            confidence: 0.1,
            regions: []
          });
        }
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 提取图片特征
  const extractImageFeatures = (imageData: ImageData) => {
    const data = imageData.data;
    const pixelCount = data.length / 4;
    
    let redPixels = 0;
    let darkPixels = 0;
    let totalBrightness = 0;
    let redChannelSum = 0;
    let greenChannelSum = 0;
    let blueChannelSum = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // 计算亮度
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      
      // 统计各通道
      redChannelSum += r;
      greenChannelSum += g;
      blueChannelSum += b;
      
      // 检测红色像素（腐蚀迹象）
      if (r > g + 30 && r > b + 30 && r > 100) {
        redPixels++;
      }
      
      // 检测暗色像素（裂纹迹象）
      if (brightness < 80) {
        darkPixels++;
      }
    }
    
    return {
      redPixelRatio: redPixels / pixelCount,
      darkPixelRatio: darkPixels / pixelCount,
      averageBrightness: totalBrightness / pixelCount,
      redChannelAvg: redChannelSum / pixelCount,
      greenChannelAvg: greenChannelSum / pixelCount,
      blueChannelAvg: blueChannelSum / pixelCount,
      contrast: Math.abs(redChannelSum - blueChannelSum) / pixelCount
    };
  };

  // 查找匹配的知识
  const findMatchingKnowledge = (issues: string[]): KnowledgeDocument[] => {
    return knowledgeDocuments.filter(doc => 
      issues.some(issue => 
        doc.content.includes(issue) || 
        doc.tags.some(tag => tag.includes(issue))
      )
    );
  };

  // 确定故障类型
  const determineFaultType = (issues: string[]): string => {
    if (issues.includes('腐蚀') || issues.includes('过热')) return '电气故障';
    if (issues.includes('裂纹') || issues.includes('磨损')) return '机械故障';
    if (issues.length === 0) return '设备正常';
    return '综合故障';
  };

  // 生成解决方案
  const generateSolutions = (issues: string[], knowledge: KnowledgeDocument[]): string[] => {
    const solutions: string[] = [];
    
    // 基于检测到的问题生成解决方案
    if (issues.includes('腐蚀')) {
      solutions.push('清洁腐蚀部位并进行防腐处理');
      solutions.push('检查环境湿度和通风情况');
    }
    
    if (issues.includes('裂纹')) {
      solutions.push('停止使用设备，进行结构强度检查');
      solutions.push('联系专业人员进行裂纹修复');
    }
    
    if (issues.includes('磨损')) {
      solutions.push('更换磨损部件');
      solutions.push('调整设备运行参数');
      solutions.push('增加润滑保养频次');
    }
    
    if (issues.includes('过热')) {
      solutions.push('检查散热系统');
      solutions.push('降低设备负载');
      solutions.push('检查电气连接是否良好');
    }
    
    // 基于知识库生成额外解决方案
    knowledge.forEach(doc => {
      if (doc.category === '维护保养') {
        solutions.push('参考预防性维护流程进行保养');
      }
    });
    
    // 如果没有检测到问题
    if (issues.length === 0) {
      solutions.push('设备状态良好，继续正常使用');
      solutions.push('建议定期进行预防性检查');
    }
    
    return [...new Set(solutions)]; // 去重
  };

  // 确定严重程度
  const determineSeverity = (issues: string[]): 'low' | 'medium' | 'high' => {
    if (issues.includes('裂纹') || issues.includes('过热')) return 'high';
    if (issues.includes('腐蚀') || issues.includes('磨损')) return 'medium';
    return 'low';
  };

  // 生成描述
  const generateDescription = (fileCount: number, issues: string[], knowledge: KnowledgeDocument[]): string => {
    const fileText = fileCount > 1 ? `${fileCount}张图片` : '图片';
    const issueText = issues.length > 0 ? issues.join('、') : '无明显异常';
    const knowledgeText = knowledge.length > 0 ? `，结合${knowledge.length}个相关知识文档` : '';
    
    return `${fileText}分析完成。检测到：${issueText}${knowledgeText}，已生成相应的诊断建议。`;
  };

  // 处理音频录制
  const handleAudioRecorded = async (audioFile: File) => {
    await handleAudioAnalysis(audioFile);
  };

  // 处理帧捕获
  const handleFrameCapture = (imageData: string) => {
    // 处理视频帧捕获的逻辑
  };

  // 重置所有状态
  const resetAll = () => {
    setDiagnosisResult(null);
    setError(null);
    setLoading(false);
    setStatistics({
      totalFrames: 0,
      analyzedFrames: 0,
      abnormalFrames: 0,
      abnormalRatio: 0,
      duration: 0
    });
  };

  // 处理输入类型切换时的状态清理
  const handleInputTypeChange = (newType: typeof activeInput) => {
    // 只有在切换到诊断相关功能时才清理结果
    const diagnosticTypes = ['text', 'video', 'image', 'audio'];
    const currentIsDiagnostic = diagnosticTypes.includes(activeInput);
    const newIsDiagnostic = diagnosticTypes.includes(newType);
    
    if (currentIsDiagnostic && newIsDiagnostic && activeInput !== newType) {
      clearDiagnosisResult();
    }
    
    setActiveInput(newType);
  };

  // 渲染活动组件
  const renderActiveComponent = () => {
    switch (activeInput) {
      case 'text':
        return <TextInput onAnalyze={handleTextAnalysis} />;
      case 'video':
        return (
          <VideoInput 
            onAnalyze={handleVideoAnalysis}
            onAudioRecorded={handleAudioRecorded}
            onFrameCapture={handleFrameCapture}
          />
        );
      case 'image':
        return <ImageInput onAnalyze={handleImageUpload} />;
      case 'audio':
        return <AudioInput onAnalyze={handleAudioAnalysis} />;
      case 'material':
        return (
          <MaterialLibrary 
            materials={materials}
            onMaterialsChange={handleMaterialsChange}
            onAddToKnowledgeBase={handleAddToKnowledgeBase}
          />
        );
      case 'knowledge':
        return (
          <KnowledgeGraph 
            documents={knowledgeDocuments}
            onDocumentsChange={handleKnowledgeDocumentsChange}
          />
        );
      case 'diagnosis':
        return <SmartDiagnosis />;
      case 'decision-tree':
        return <DecisionTree />;
      default:
        return <TextInput onAnalyze={handleTextAnalysis} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              <Avatar
                src={selectedLogo.startsWith('/') || selectedLogo.startsWith('data:') ? selectedLogo : undefined}
                sx={{ width: 32, height: 32 }}
                variant="rounded"
              >
                {!selectedLogo.startsWith('/') && !selectedLogo.startsWith('data:') ? selectedLogo : '🔋'}
              </Avatar>
            </Box>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              电动汽车换电站智能诊断系统
            </Typography>
            <IconButton
              color="inherit"
              onClick={(e) => setSettingsMenuAnchor(e.currentTarget)}
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              anchorEl={settingsMenuAnchor}
              open={Boolean(settingsMenuAnchor)}
              onClose={() => setSettingsMenuAnchor(null)}
            >
              <MenuItem onClick={() => {
                setSettingsMenuAnchor(null);
                setSettingsDialogOpen(true);
              }}>
                系统设置
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ mt: 3 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  🔧 智能诊断工具
                </Typography>
                <ButtonGroup variant="outlined" sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    startIcon={<TextIcon />}
                    variant={activeInput === 'text' ? 'contained' : 'outlined'}
                    onClick={() => handleInputTypeChange('text')}
                  >
                    文本诊断
                  </Button>
                  <Button
                    startIcon={<ImageIcon />}
                    variant={activeInput === 'image' ? 'contained' : 'outlined'}
                    onClick={() => handleInputTypeChange('image')}
                  >
                    图片诊断
                  </Button>
                  <Button
                    startIcon={<VideoIcon />}
                    variant={activeInput === 'video' ? 'contained' : 'outlined'}
                    onClick={() => handleInputTypeChange('video')}
                  >
                    视频诊断
                  </Button>
                  <Button
                    startIcon={<AudioIcon />}
                    variant={activeInput === 'audio' ? 'contained' : 'outlined'}
                    onClick={() => handleInputTypeChange('audio')}
                  >
                    音频诊断
                  </Button>
                  <Button
                    startIcon={<DiagnosisIcon />}
                    variant={activeInput === 'diagnosis' ? 'contained' : 'outlined'}
                    onClick={() => handleInputTypeChange('diagnosis')}
                  >
                    智能诊断
                  </Button>
                  <Button
                    startIcon={<MaterialIcon />}
                    variant={activeInput === 'material' ? 'contained' : 'outlined'}
                    onClick={() => handleInputTypeChange('material')}
                  >
                    素材库
                  </Button>
                  <Button
                    startIcon={<KnowledgeIcon />}
                    variant={activeInput === 'knowledge' ? 'contained' : 'outlined'}
                    onClick={() => handleInputTypeChange('knowledge')}
                  >
                    知识图谱
                  </Button>
                </ButtonGroup>
              </Grid>

              <Grid item xs={12} md={diagnosisResult ? 6 : 12}>
                <Paper elevation={1} sx={{ p: 2, minHeight: 400 }}>
                  {renderActiveComponent()}
                </Paper>
              </Grid>

              {diagnosisResult && (
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, minHeight: 400 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      📊 诊断结果
                    </Typography>
                    <DiagnosisResult 
                      result={diagnosisResult} 
                      statistics={statistics}
                      analysisType={analysisType}
                    />
                  </Paper>
                </Grid>
              )}

              {loading && (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                      正在分析中...
                    </Typography>
                  </Box>
                </Grid>
              )}

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>
      </Container>

      {/* 知识图谱对话框 */}
      {showKnowledgeGraph && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              width: '95%',
              height: '95%',
              backgroundColor: 'white',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <KnowledgeGraph 
              documents={knowledgeDocuments}
              onClose={() => setShowKnowledgeGraph(false)}
            />
          </Box>
        </Box>
      )}

      {/* 系统设置对话框 */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            系统设置
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* 当前Logo显示 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                当前标识
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Avatar
                  src={selectedLogo.startsWith('/') || selectedLogo.startsWith('data:') ? selectedLogo : undefined}
                  sx={{ width: 48, height: 48 }}
                  variant="rounded"
                >
                  {!selectedLogo.startsWith('/') && !selectedLogo.startsWith('data:') ? selectedLogo : '🔋'}
                </Avatar>
                <Box>
                  <Typography variant="body1">
                    {selectedLogo.startsWith('data:') ? '自定义标识' : 
                     selectedLogo.startsWith('/') ? '默认标识' : selectedLogo}
                  </Typography>
                  <Chip 
                    label={selectedLogo.startsWith('data:') ? '自定义标识' : '默认标识'} 
                    size="small" 
                                      color={selectedLogo.startsWith('data:') ? 'primary' : 'default'}
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 预设Logo选择 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                预设标识
              </Typography>
              <Grid container spacing={2}>
                {presetLogos.map((preset, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedLogo === preset.path ? '2px solid #1976d2' : '1px solid #ddd',
                        '&:hover': { boxShadow: 2 }
                      }}
                      onClick={() => handleLogoSelect(preset.path)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Avatar
                          src={preset.path.startsWith('/') || preset.path.startsWith('data:') ? preset.path : undefined}
                          sx={{ width: 40, height: 40, mx: 'auto', mb: 1 }}
                          variant="rounded"
                        >
                          {!preset.path.startsWith('/') && !preset.path.startsWith('data:') ? preset.path : '🔋'}
                        </Avatar>
                        <Typography variant="body2">{preset.name}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 自定义Logo上传 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                自定义标识
              </Typography>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleCustomLogoUpload}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mr: 2 }}
                  >
                    选择图片文件
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  支持JPG、PNG、GIF格式，文件大小不超过2MB
                </Typography>
              </Box>

              {/* 自定义Logo列表 */}
              {customLogos.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    已上传的标识
                  </Typography>
                  <Grid container spacing={2}>
                    {customLogos.map((logo) => (
                      <Grid item xs={6} sm={4} md={3} key={logo.id}>
                        <Card 
                          sx={{ 
                            border: selectedLogo === logo.path ? '2px solid #1976d2' : '1px solid #ddd',
                            position: 'relative'
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Avatar
                              src={logo.path}
                              sx={{ width: 40, height: 40, mx: 'auto', mb: 1 }}
                              variant="rounded"
                            />
                            <Typography variant="body2" noWrap>
                              {logo.name}
                            </Typography>
                          </CardContent>
                          <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                            <Button
                              size="small"
                              onClick={() => handleLogoSelect(logo.path)}
                              variant={selectedLogo === logo.path ? 'contained' : 'outlined'}
                            >
                              使用
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteCustomLogo(logo.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)} startIcon={<CloseIcon />}>
            关闭
          </Button>
          <Button 
            onClick={() => {
              setSettingsDialogOpen(false);
              // 这里可以添加保存设置的逻辑
            }} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            保存设置
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;
