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
        const savedCustomLogos = localStorage.getItem('customLogos');
        
        if (savedLogo) {
          setSelectedLogo(savedLogo);
          console.log('已加载保存的Logo设置:', savedLogo);
        }
        
        if (savedCustomLogos) {
          const parsedCustomLogos = JSON.parse(savedCustomLogos);
          setCustomLogos(parsedCustomLogos);
          console.log('已加载自定义Logo列表:', parsedCustomLogos.length);
        }
      } catch (error) {
        console.error('加载Logo设置失败:', error);
      }
    };

    loadLogoSettings();
  }, []);

  // 保存Logo设置到localStorage
  const saveLogoSettings = (logo: string, customLogos: CustomLogo[] = []) => {
    try {
      localStorage.setItem('selectedLogo', logo);
      localStorage.setItem('customLogos', JSON.stringify(customLogos));
      console.log('Logo设置已保存:', logo);
    } catch (error) {
      console.error('保存Logo设置失败:', error);
    }
  };

  const handleLogoSelect = (logoPath: string) => {
    setSelectedLogo(logoPath);
    saveLogoSettings(logoPath, customLogos);
    console.log('Logo已切换:', logoPath);
  };

  const handleCustomLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newLogo: CustomLogo = {
          id: `custom_${Date.now()}`,
          name: file.name,
          url: result,
          uploadDate: new Date().toISOString()
        };
        
        const updatedCustomLogos = [...customLogos, newLogo];
        setCustomLogos(updatedCustomLogos);
        setSelectedLogo(result);
        saveLogoSettings(result, updatedCustomLogos);
        
        console.log('自定义Logo已上传并设置:', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteCustomLogo = (logoId: string) => {
    const logoToDelete = customLogos.find(logo => logo.id === logoId);
    if (logoToDelete) {
      const updatedCustomLogos = customLogos.filter(logo => logo.id !== logoId);
      setCustomLogos(updatedCustomLogos);
      
      // 如果删除的是当前选中的Logo，切换到默认Logo
      if (selectedLogo === logoToDelete.url) {
        setSelectedLogo('/logo.png');
        saveLogoSettings('/logo.png', updatedCustomLogos);
      } else {
        saveLogoSettings(selectedLogo, updatedCustomLogos);
      }
      
      console.log('自定义Logo已删除:', logoToDelete.name);
    }
  };

  // 保存材料库状态
  const handleMaterialsChange = (newMaterials: MaterialItem[]) => {
    setMaterials(newMaterials);
    try {
      localStorage.setItem('materialsLibrary', JSON.stringify(newMaterials));
      console.log('材料库已保存到本地存储');
    } catch (error) {
      console.error('保存材料库失败:', error);
    }
  };

  // 保存知识库状态
  const handleKnowledgeDocumentsChange = (documents: KnowledgeDocument[]) => {
    setKnowledgeDocuments(documents);
    try {
      localStorage.setItem('knowledgeBase', JSON.stringify(documents));
      console.log('知识库已保存到本地存储');
    } catch (error) {
      console.error('保存知识库失败:', error);
    }
  };

  // 加载材料库数据
  useEffect(() => {
    const loadMaterials = () => {
      try {
        const savedMaterials = localStorage.getItem('materialsLibrary');
        if (savedMaterials) {
          const parsedMaterials = JSON.parse(savedMaterials);
          setMaterials(parsedMaterials);
          console.log('已加载材料库数据:', parsedMaterials.length, '个项目');
        }
      } catch (error) {
        console.error('加载材料库失败:', error);
      }
    };

    loadMaterials();
  }, []);

  // 自动保存诊断日志到素材库
  const saveDiagnosisLog = async (logData: {
    type: 'text' | 'image' | 'video' | 'audio' | 'multi-image';
    files?: File[];
    result: DiagnosisResultType;
  }) => {
    try {
      const timestamp = new Date();
      const logId = `diagnosis_${Date.now()}`;
      
      // 创建素材库条目
      const materialItem: MaterialItem = {
        id: logId,
        name: `${getTypeDisplayName(logData.type)}诊断报告 - ${formatDate(timestamp)}`,
        type: 'diagnosis',
        size: JSON.stringify(logData.result).length,
        uploadDate: timestamp,
        tags: [
          '诊断日志', 
          logData.type, 
          logData.result.severity || 'medium'
        ],
        description: generateLogDescription(logData),
        diagnosisResult: logData.result
      };

      // 更新素材库
      const updatedMaterials = [materialItem, ...materials];
      setMaterials(updatedMaterials);
      
      // 保存到localStorage
      localStorage.setItem('materials', JSON.stringify(updatedMaterials));
      
      console.log('✅ 诊断日志已自动保存到素材库');
      
    } catch (error) {
      console.error('❌ 保存诊断日志失败:', error);
    }
  };

  // 生成日志描述
  const generateLogDescription = (logData: {
    type: string;
    files?: File[];
    result: DiagnosisResultType;
  }): string => {
    const typeText = getTypeDisplayName(logData.type);
    const severityText = getSeverityText(logData.result.severity || 'medium');
    const fileName = logData.files ? logData.files[0].name : '文本输入';
    
    let description = `${typeText}诊断 - ${fileName} - ${severityText}`;
    
    if (logData.result.solutions && logData.result.solutions.length > 0) {
      description += `\n解决方案: ${logData.result.solutions.join(', ')}`;
    }
    
    if (logData.result.description) {
      description += `\n分析描述: ${logData.result.description}`;
    }
    
    return description;
  };

  // 获取类型显示名称
  const getTypeDisplayName = (type: string): string => {
    const typeMap: Record<string, string> = {
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
    const severityMap: Record<string, string> = {
      'low': '轻微',
      'medium': '中等',
      'high': '严重'
    };
    return severityMap[severity] || severity;
  };

  // 格式化日期
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // 这些函数已在上面重新定义，删除重复声明



  // 添加文档到知识库
  const handleAddToKnowledgeBase = (document: KnowledgeDocument) => {
    const existingDoc = knowledgeDocuments.find(doc => doc.title === document.title);
    if (existingDoc) {
      console.warn('文档已存在于知识库中:', document.title);
      return;
    }
    
    const updatedDocuments = [...knowledgeDocuments, document];
    handleKnowledgeDocumentsChange(updatedDocuments);
    console.log('文档已添加到知识库:', document.title);
  };

  const handleTextAnalysis = async (text: string) => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    setAnalysisType('text');
    
    try {
      const response = await analyzeText(text);
      setDiagnosisResult(response.analysis);
      if (response.statistics) {
        setStatistics(response.statistics);
      }
      
      // 自动保存诊断日志
      await saveDiagnosisLog({
        type: 'text',
        result: response.analysis
      });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : '分析失败');
      console.error('文本分析错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoAnalysis = async (file: File) => {
    setLoading(true);
    setError(null);
    setAnalysisType('video');
    
    try {
      const response = await analyzeVideo(file);
      setDiagnosisResult(response.analysis);
      setStatistics(response.statistics);
      
      // 自动保存诊断日志
      await saveDiagnosisLog({
        type: 'video',
        files: [file],
        result: response.analysis
      });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : '分析失败');
      console.error('视频分析错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioAnalysis = async (file: File) => {
    setLoading(true);
    setError(null);
    setAnalysisType('audio');
    
    try {
      // 模拟音频分析，返回符合DiagnosisResult类型的结果
      const result: DiagnosisResultType = {
        faultType: '音频异常检测',
        confidence: 0.78,
        solutions: [
          '检查音频设备连接',
          '调整音频采样率',
          '检查环境噪音水平',
          '验证音频驱动程序'
        ],
        description: '检测到音频信号异常，可能存在设备故障',
        severity: 'medium'
      };
      
      setDiagnosisResult(result);
      
      // 设置音频分析统计
      const audioStats: Statistics = {
        totalFrames: 1,
        analyzedFrames: 1,
        abnormalFrames: result.confidence > 0.7 ? 1 : 0,
        abnormalRatio: result.confidence,
        duration: 10 // 假设音频时长10秒
      };
      setStatistics(audioStats);
      
      // 自动保存诊断日志
      await saveDiagnosisLog({
        type: 'audio',
        files: [file],
        result
      });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : '分析失败');
      console.error('音频分析错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新图片上传处理函数 - 使用ImageInput组件的详细分析
  const handleImageUpload = async (files: File[], analysisData?: any) => {
    if (files.length === 0) return;
    
    setLoading(true);
    setError(null);
    setAnalysisType('image');

    try {
      let imageAnalysisResult: DiagnosisResultType;
      
      if (analysisData) {
        // 使用ImageInput组件提供的详细分析数据
        imageAnalysisResult = convertImageAnalysisToResult(analysisData, files);
      } else {
        // 后备分析方法
        imageAnalysisResult = await performAdvancedImageAnalysis(files);
      }
      
      setDiagnosisResult(imageAnalysisResult);
      
      // 设置图片分析统计
      const abnormalCount = imageAnalysisResult.severity === 'high' ? files.length : 
                           imageAnalysisResult.severity === 'medium' ? Math.ceil(files.length * 0.6) :
                           Math.ceil(files.length * 0.2);
      
      const imageStats: Statistics = {
        totalFrames: files.length,
        analyzedFrames: files.length,
        abnormalFrames: abnormalCount,
        abnormalRatio: abnormalCount / files.length,
        duration: files.length * 3
      };
      setStatistics(imageStats);
      
      // 自动保存诊断日志
      await saveDiagnosisLog({
        type: files.length > 1 ? 'multi-image' : 'image',
        files,
        result: imageAnalysisResult
      });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : '分析失败');
      console.error('图片分析错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 转换ImageInput的分析结果为标准格式
  const convertImageAnalysisToResult = (analysisData: any, files: File[]): DiagnosisResultType => {
    const { individualAnalyses, overallSummary, prioritizedSolutions } = analysisData;
    
    // 统计所有异常
    const allAnomalies = individualAnalyses.flatMap((analysis: any) => 
      analysis.analysisResults.filter((result: any) => result.anomalyType !== 'normal')
    );
    
    // 确定整体故障类型
    let faultType = '设备状态正常';
    let severity: 'low' | 'medium' | 'high' = 'low';
    let confidence = 0.75;
    
    if (allAnomalies.length > 0) {
      const severityCount = { low: 0, medium: 0, high: 0 };
      allAnomalies.forEach((anomaly: any) => {
        const sev = anomaly.severity as 'low' | 'medium' | 'high';
        if (sev in severityCount) {
          severityCount[sev]++;
        }
      });
      
      if (severityCount.high > 0) {
        severity = 'high';
        faultType = '发现严重设备故障';
        confidence = 0.9;
      } else if (severityCount.medium > 0) {
        severity = 'medium';
        faultType = '发现中等程度设备异常';
        confidence = 0.85;
      } else {
        severity = 'low';
        faultType = '发现轻微设备异常';
        confidence = 0.8;
      }
    }
    
    // 生成解决方案
    const solutions = prioritizedSolutions?.map((sol: any) => sol.description) || [
      '继续监控设备状态',
      '按计划进行维护保养',
      '记录设备运行参数'
    ];
    
    // 生成详细描述
    const description = files.length > 1 ? 
      `多图片智能分析完成：共分析${files.length}张图片，检测到${allAnomalies.length}个异常区域。${overallSummary || ''}` :
      `单图片智能分析完成：${individualAnalyses[0]?.overallDescription || '图片分析完成，请查看详细结果。'}`;
    
    return {
      faultType,
      confidence,
      solutions: solutions.slice(0, 5),
      description,
      severity
    };
  };

  // 高级图片分析算法，结合知识库
  const performAdvancedImageAnalysis = async (files: File[]): Promise<DiagnosisResultType> => {
    const analysisPromises = files.map(file => analyzeImageWithKnowledge(file));
    const results = await Promise.all(analysisPromises);
    
    // 综合分析结果
    const allIssues = results.flatMap(r => r.detectedIssues);
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    // 根据检测到的问题匹配知识库
    const matchedKnowledge = findMatchingKnowledge(allIssues);
    
    // 生成综合诊断
    const faultType = determineFaultType(allIssues);
    const solutions = generateSolutions(allIssues, matchedKnowledge);
    const severity = determineSeverity(allIssues);
    
    return {
      faultType,
      confidence: avgConfidence,
      solutions,
      description: generateDescription(files.length, allIssues, matchedKnowledge),
      severity
    };
  };

  // 基于知识库的图片分析
  const analyzeImageWithKnowledge = async (file: File): Promise<{
    detectedIssues: string[];
    confidence: number;
    regions: any[];
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const issues = [];
        let confidence = 0.7;
        
        // 智能特征检测
        const features = extractImageFeatures(imageData);
        
        // 基于特征匹配故障模式
        if (features.redRatio > 0.1) {
          issues.push('腐蚀');
          confidence += 0.15;
        }
        if (features.darkLineRatio > 0.05) {
          issues.push('裂纹');
          confidence += 0.1;
        }
        if (features.brightSpotRatio > 0.08) {
          issues.push('磨损');
          confidence += 0.1;
        }
        if (features.temperatureVariation > 0.3) {
          issues.push('过热');
          confidence += 0.12;
        }
        
        resolve({
          detectedIssues: issues.length > 0 ? issues : ['正常'],
          confidence: Math.min(confidence, 0.95),
          regions: []
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 图像特征提取
  const extractImageFeatures = (imageData: ImageData) => {
    const pixels = imageData.data;
    const totalPixels = imageData.width * imageData.height;
    
    let redPixels = 0;
    let darkLines = 0;
    let brightSpots = 0;
    let tempVariation = 0;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      
      // 红色（腐蚀）检测
      if (r > g + 30 && r > b + 30 && r > 100) redPixels++;
      
      // 暗线（裂纹）检测
      if (brightness < 50) darkLines++;
      
      // 亮点（磨损）检测
      if (brightness > 200) brightSpots++;
      
      // 温度变化检测（基于颜色变化）
      if (Math.abs(r - g) > 40 || Math.abs(g - b) > 40) tempVariation++;
    }
    
    return {
      redRatio: redPixels / totalPixels,
      darkLineRatio: darkLines / totalPixels,
      brightSpotRatio: brightSpots / totalPixels,
      temperatureVariation: tempVariation / totalPixels
    };
  };

  // 匹配知识库
  const findMatchingKnowledge = (issues: string[]): KnowledgeDocument[] => {
    return knowledgeDocuments.filter(doc => 
      issues.some(issue => 
        doc.tags.some(tag => tag.includes(issue)) ||
        doc.content.includes(issue)
      )
    );
  };

  // 确定故障类型
  const determineFaultType = (issues: string[]): string => {
    if (issues.includes('腐蚀')) return '设备腐蚀故障';
    if (issues.includes('裂纹')) return '结构裂纹故障';
    if (issues.includes('磨损')) return '机械磨损故障';
    if (issues.includes('过热')) return '设备过热故障';
    return '设备状态正常';
  };

  // 生成解决方案
  const generateSolutions = (issues: string[], knowledge: KnowledgeDocument[]): string[] => {
    const solutions = [];
    
    if (issues.includes('腐蚀')) {
      solutions.push('立即清除腐蚀物质，重新涂抹防腐涂层');
      solutions.push('检查环境湿度控制系统');
      solutions.push('加强防水密封措施');
    }
    
    if (issues.includes('裂纹')) {
      solutions.push('停机检查，评估裂纹扩展风险');
      solutions.push('进行无损检测，确定裂纹深度');
      solutions.push('必要时更换受损部件');
    }
    
    if (issues.includes('磨损')) {
      solutions.push('检查润滑系统，补充润滑油');
      solutions.push('调整设备运行参数，减少磨损');
      solutions.push('制定部件更换计划');
    }
    
    if (issues.includes('过热')) {
      solutions.push('检查冷却系统运行状态');
      solutions.push('清理散热器，确保通风良好');
      solutions.push('监控负载，避免过载运行');
    }
    
    // 从知识库补充解决方案
    knowledge.forEach(doc => {
      if (doc.content.includes('处理') || doc.content.includes('解决')) {
        const sentences = doc.content.split('。');
        sentences.forEach(sentence => {
          if (sentence.includes('检查') || sentence.includes('更换') || sentence.includes('清理')) {
            solutions.push(sentence.trim());
          }
        });
      }
    });
    
    return solutions.length > 0 ? solutions.slice(0, 5) : ['设备状态良好，继续正常运行'];
  };

  // 确定严重程度
  const determineSeverity = (issues: string[]): 'low' | 'medium' | 'high' => {
    if (issues.includes('裂纹') || issues.includes('过热')) return 'high';
    if (issues.includes('腐蚀') || issues.includes('磨损')) return 'medium';
    return 'low';
  };

  // 生成描述
  const generateDescription = (fileCount: number, issues: string[], knowledge: KnowledgeDocument[]): string => {
    const issueText = issues.filter(i => i !== '正常').join('、');
    if (issueText) {
      return `通过${fileCount}张图片的智能分析，检测到以下问题：${issueText}。基于知识库匹配了${knowledge.length}个相关文档，建议立即采取相应措施。`;
    }
    return `经过${fileCount}张图片的全面分析，设备状态正常，未发现明显异常。建议继续定期监控。`;
  };



  const renderActiveComponent = () => {
    switch (activeInput) {
      case 'video':
        return <VideoInput onVideoUpload={handleVideoAnalysis} />;
      case 'image':
        return <ImageInput onImageUpload={handleImageUpload} />;
      case 'audio':
        return <AudioInput onAudioSubmit={handleAudioAnalysis} />;
      case 'material':
        return <MaterialLibrary
          materials={materials}
          onMaterialsChange={handleMaterialsChange}
          onAddToKnowledgeBase={handleAddToKnowledgeBase}   
          knowledgeDocuments={knowledgeDocuments}
        />;
      case 'graph':
        return <KnowledgeGraph documents={knowledgeDocuments} />;
      case 'knowledge':
        return <KnowledgeGraph documents={knowledgeDocuments} />;
      case 'diagnosis':
        return <SmartDiagnosis documents={knowledgeDocuments} />;
      case 'decision-tree':
        return <DecisionTree onComplete={(result) => {
          console.log('决策树诊断完成:', result);
        }} />;
      default:
        return <TextInput onSubmit={handleTextAnalysis} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
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

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* 侧边栏 */}
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  📊 系统概览
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    总帧数: {statistics.totalFrames}     
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    已分析帧数: {statistics.analyzedFrames}      
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    异常帧数: {statistics.abnormalFrames}      
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    异常比例: {(statistics.abnormalRatio * 100).toFixed(1)}%     
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                    诊断日志: {materials.filter(m => m.type === 'diagnosis').length}条
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  🔧 诊断工具
                </Typography>
                <ButtonGroup orientation="vertical" fullWidth variant="outlined">
                  <Button
                    startIcon={<TextIcon />}
                    onClick={() => {
                      if (activeInput !== 'text') {
                        setDiagnosisResult(null);
                        setStatistics({
                          totalFrames: 0,
                          analyzedFrames: 0,
                          abnormalFrames: 0,
                          abnormalRatio: 0,
                          duration: 0
                        });
                        setError(null);
                        setAnalysisType('text');
                      }
                      setActiveInput('text');
                    }}
                    variant={activeInput === 'text' ? 'contained' : 'outlined'}
                  >
                    文本诊断
                  </Button>
                  <Button
                    startIcon={<ImageIcon />}
                    onClick={() => {
                      if (activeInput !== 'image') {
                        setDiagnosisResult(null);
                        setStatistics({
                          totalFrames: 0,
                          analyzedFrames: 0,
                          abnormalFrames: 0,
                          abnormalRatio: 0,
                          duration: 0
                        });
                        setError(null);
                        setAnalysisType('image');
                      }
                      setActiveInput('image');
                    }}
                    variant={activeInput === 'image' ? 'contained' : 'outlined'}
                  >
                    图片诊断
                  </Button>
                  <Button
                    startIcon={<VideoIcon />}
                    onClick={() => {
                      if (activeInput !== 'video') {
                        setDiagnosisResult(null);
                        setStatistics({
                          totalFrames: 0,
                          analyzedFrames: 0,
                          abnormalFrames: 0,
                          abnormalRatio: 0,
                          duration: 0
                        });
                        setError(null);
                        setAnalysisType('video');
                      }
                      setActiveInput('video');
                    }}
                    variant={activeInput === 'video' ? 'contained' : 'outlined'}
                  >
                    视频诊断
                  </Button>
                  <Button
                    startIcon={<AudioIcon />}
                    onClick={() => {
                      if (activeInput !== 'audio') {
                        setDiagnosisResult(null);
                        setStatistics({
                          totalFrames: 0,
                          analyzedFrames: 0,
                          abnormalFrames: 0,
                          abnormalRatio: 0,
                          duration: 0
                        });
                        setError(null);
                        setAnalysisType('audio');
                      }
                      setActiveInput('audio');
                    }}
                    variant={activeInput === 'audio' ? 'contained' : 'outlined'}
                  >
                    音频诊断
                  </Button>
                  <Button
                    startIcon={<DiagnosisIcon />}
                    onClick={() => {
                      if (activeInput !== 'diagnosis') {
                        setDiagnosisResult(null);
                        setStatistics({
                          totalFrames: 0,
                          analyzedFrames: 0,
                          abnormalFrames: 0,
                          abnormalRatio: 0,
                          duration: 0
                        });
                        setError(null);
                        setAnalysisType('text');
                      }
                      setActiveInput('diagnosis');
                    }}
                    variant={activeInput === 'diagnosis' ? 'contained' : 'outlined'}
                  >
                    智能诊断
                  </Button>
                  <Button
                    startIcon={<MaterialIcon />}
                    onClick={() => {
                      // 素材库不需要清除诊断结果
                      setActiveInput('material');
                    }}
                    variant={activeInput === 'material' ? 'contained' : 'outlined'}
                  >
                    素材库
                  </Button>
                  <Button
                    startIcon={<KnowledgeIcon />}
                    onClick={() => {
                      // 知识图谱不需要清除诊断结果
                      setActiveInput('knowledge');
                    }}
                    variant={activeInput === 'knowledge' ? 'contained' : 'outlined'}
                  >
                    知识图谱
                  </Button>
                </ButtonGroup>
              </Paper>
            </Grid>

            {/* 主内容区域 */}
            <Grid item xs={12} md={9}>
              <Box sx={{ mb: 3 }}>
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
                
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                {renderActiveComponent()}
              </Box>

              {diagnosisResult && (
                <DiagnosisResult
                  result={diagnosisResult}
                  statistics={statistics}
                  analysisType={analysisType}
                />
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          系统设置
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Logo设置部分 */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhotoIcon />
              系统标识设置
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {/* 当前Logo显示 */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>当前标识</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={selectedLogo}
                    sx={{ width: 60, height: 60 }}
                    variant="rounded"
                  >
                    🔋
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      当前使用的系统标识
                    </Typography>
                    <Chip 
                      label={selectedLogo.startsWith('data:') ? '自定义标识' : '默认标识'} 
                      size="small" 
                      color={selectedLogo.startsWith('data:') ? 'primary' : 'default'}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* 上传新Logo */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>上传新标识</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadIcon />}
                  >
                    选择图片文件
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleCustomLogoUpload}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    支持 JPG、PNG、GIF 格式，建议尺寸 120x40 像素
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* 自定义Logo管理 */}
            {customLogos.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>自定义标识管理</Typography>
                  <Grid container spacing={2}>
                    {customLogos.map((logo) => (
                      <Grid item xs={12} sm={6} md={4} key={logo.id}>
                        <Card variant="outlined">
                          <CardContent sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Avatar
                                src={logo.url}
                                sx={{ width: 40, height: 40 }}
                                variant="rounded"
                              />
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap>
                                  {logo.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {logo.size} | {logo.position}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                          <CardActions sx={{ pt: 0 }}>
                            <Button
                              size="small"
                              onClick={() => handleLogoSelect(logo.url)}
                              disabled={selectedLogo === logo.url}
                            >
                              {selectedLogo === logo.url ? '当前使用' : '使用'}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteCustomLogo(logo.id)}
                              startIcon={<DeleteIcon />}
                            >
                              删除
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* 预设Logo选择 */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>预设标识</Typography>
                <Grid container spacing={2}>
                  {[
                    { path: '/logo.png', name: '默认标识' },
                    { path: '🔋', name: '电池图标' },
                    { path: '⚡', name: '闪电图标' },
                    { path: '🔧', name: '工具图标' }
                  ].map((preset) => (
                    <Grid item xs={6} sm={3} key={preset.path}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedLogo === preset.path ? 2 : 1,
                          borderColor: selectedLogo === preset.path ? 'primary.main' : 'divider'
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
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)} startIcon={<CloseIcon />}>
            关闭
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setSettingsDialogOpen(false);
              // 保存设置已经在选择时自动完成
            }}
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