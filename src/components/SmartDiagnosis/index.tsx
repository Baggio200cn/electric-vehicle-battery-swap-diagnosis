import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Divider,
  Grid,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Psychology as DiagnosisIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Source as SourceIcon,
  Info as InfoIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Mic as MicIcon,
  AccountTree as TreeIcon,
  Analytics as AnalyticsIcon,
  School as LearningIcon
} from '@mui/icons-material';
import DecisionTree from '../DecisionTree';

// 添加CSS动画样式
const pulseAnimation = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// 将样式注入到页面
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  relatedDocuments: string[];
}

interface DiagnosisResult {
  document: KnowledgeDocument;
  relevanceScore: number;
  matchedKeywords: string[];
  solutionSteps: string[];
  relatedDocuments: KnowledgeDocument[];
  sourceType: 'knowledge_base' | 'external_api' | 'decision_tree';
  confidence: number;
  decisionPath?: any[];
}

interface LearningMetrics {
  totalCases: number;
  successfulDiagnoses: number;
  accuracyRate: number;
  learningProgress: number;
  recentAccuracy: number[];
  knowledgeGrowth: number[];
}

interface SmartDiagnosisProps {
  documents?: KnowledgeDocument[];
}

const SmartDiagnosis: React.FC<SmartDiagnosisProps> = ({ documents = [] }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [faultDescription, setFaultDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showDecisionTree, setShowDecisionTree] = useState(false);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics>({
    totalCases: 1247,
    successfulDiagnoses: 1089,
    accuracyRate: 87.3,
    learningProgress: 73.5,
    recentAccuracy: [82.1, 84.3, 85.7, 86.9, 87.3],
    knowledgeGrowth: [45, 52, 61, 68, 73.5]
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 故障关键词库
  const faultKeywords = {
    mechanical: ['机器人', '手臂', '传输', '升降', '机械', '卡顿', '异响', '磨损', '润滑', '齿轮'],
    electrical: ['电气', '控制', '传感器', '电源', '通信', 'E001', 'E002', 'E003', '故障码', '断电'],
    battery: ['电池', 'BMS', '充电', '电压', '电流', '温度', '均衡', '过充', '过放', '热失控'],
    safety: ['安全', '报警', '火灾', '烟雾', '气体', '泄漏', '光幕', '急停', '消防'],
    maintenance: ['维护', '保养', '检查', '清洁', '更换', '校准', '预防', '定期']
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // 删除文件
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
        setSelectedFiles(prev => [...prev, file]);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('录音失败:', error);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // 综合分析故障
  const performComprehensiveAnalysis = async () => {
    if (!faultDescription.trim() && selectedFiles.length === 0) {
      return;
    }

    setAnalyzing(true);
    setDiagnosisResults([]);
    setAnalysisComplete(false);

    try {
      const results: DiagnosisResult[] = [];

      // 1. 文本分析
      if (faultDescription.trim()) {
        const textResults = await analyzeText(faultDescription);
        results.push(...textResults);
      }

      // 2. 多媒体文件分析
      if (selectedFiles.length > 0) {
        const mediaResults = await analyzeMediaFiles(selectedFiles);
        results.push(...mediaResults);
      }

      // 3. 决策树分析（如果有足够信息）
      if (results.length > 0) {
        const treeResults = await analyzeWithDecisionTree(faultDescription, selectedFiles);
        results.push(...treeResults);
      }

      // 按置信度排序
      results.sort((a, b) => b.confidence - a.confidence);

      setDiagnosisResults(results);
      setAnalysisComplete(true);

      // 更新学习指标
      updateLearningMetrics(results);

    } catch (error) {
      console.error('综合分析失败:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // 文本分析
  const analyzeText = async (text: string): Promise<DiagnosisResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results: DiagnosisResult[] = [];
    const textLower = text.toLowerCase();

    documents.forEach(doc => {
      let relevanceScore = 0;
      const matchedKeywords: string[] = [];

      // 关键词匹配
      Object.entries(faultKeywords).forEach(([, keywords]) => {
        keywords.forEach(keyword => {
          if (textLower.includes(keyword)) {
            relevanceScore += 0.15;
            matchedKeywords.push(keyword);
          }
        });
      });

      if (relevanceScore > 0.3) {
        results.push({
          document: doc,
          relevanceScore: Math.min(relevanceScore, 1.0),
          matchedKeywords: Array.from(new Set(matchedKeywords)),
          solutionSteps: extractSolutionSteps(doc.content),
          relatedDocuments: [],
          sourceType: 'knowledge_base',
          confidence: relevanceScore * 100
        });
      }
    });

    return results;
  };

  // 多媒体文件分析
  const analyzeMediaFiles = async (files: File[]): Promise<DiagnosisResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results: DiagnosisResult[] = [];
    
    for (const file of files) {
      const fileType = file.type.split('/')[0];
      let analysisResult: DiagnosisResult;

      switch (fileType) {
        case 'image':
          analysisResult = await analyzeImage(file);
          break;
        case 'video':
          analysisResult = await analyzeVideo(file);
          break;
        case 'audio':
          analysisResult = await analyzeAudio(file);
          break;
        default:
          continue;
      }

      results.push(analysisResult);
    }

    return results;
  };

  // 图片分析
  const analyzeImage = async (file: File): Promise<DiagnosisResult> => {
    // 模拟图片分析
    const mockDoc: KnowledgeDocument = {
      id: `image-analysis-${Date.now()}`,
      title: `图片分析结果: ${file.name}`,
      content: '基于图像识别技术检测到的设备状态和潜在问题',
      category: '图像诊断',
      tags: ['图像识别', '设备检测'],
      createdAt: new Date().toISOString(),
      relatedDocuments: []
    };

    return {
      document: mockDoc,
      relevanceScore: 0.85,
      matchedKeywords: ['设备异常', '视觉检测'],
      solutionSteps: ['检查设备外观', '确认异常位置', '制定维修方案'],
      relatedDocuments: [],
      sourceType: 'external_api',
      confidence: 85.3
    };
  };

  // 视频分析
  const analyzeVideo = async (file: File): Promise<DiagnosisResult> => {
    const mockDoc: KnowledgeDocument = {
      id: `video-analysis-${Date.now()}`,
      title: `视频分析结果: ${file.name}`,
      content: '通过视频序列分析检测到的动态异常和运行状态',
      category: '视频诊断',
      tags: ['视频分析', '动态检测'],
      createdAt: new Date().toISOString(),
      relatedDocuments: []
    };

    return {
      document: mockDoc,
      relevanceScore: 0.78,
      matchedKeywords: ['运行异常', '动态分析'],
      solutionSteps: ['分析运行轨迹', '检测异常模式', '优化运行参数'],
      relatedDocuments: [],
      sourceType: 'external_api',
      confidence: 78.9
    };
  };

  // 音频分析
  const analyzeAudio = async (file: File): Promise<DiagnosisResult> => {
    const mockDoc: KnowledgeDocument = {
      id: `audio-analysis-${Date.now()}`,
      title: `音频分析结果: ${file.name}`,
      content: '通过声音特征分析检测到的设备运行状态和异常声音',
      category: '音频诊断',
      tags: ['声音识别', '异响检测'],
      createdAt: new Date().toISOString(),
      relatedDocuments: []
    };

    return {
      document: mockDoc,
      relevanceScore: 0.72,
      matchedKeywords: ['异响', '声音分析'],
      solutionSteps: ['识别异响类型', '定位声源位置', '检查相关部件'],
      relatedDocuments: [],
      sourceType: 'external_api',
      confidence: 72.4
    };
  };

  // 决策树分析
  const analyzeWithDecisionTree = async (text: string, files: File[]): Promise<DiagnosisResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockDoc: KnowledgeDocument = {
      id: `decision-tree-${Date.now()}`,
      title: '智能决策树诊断结果',
      content: '基于决策树算法的综合诊断分析',
      category: '智能诊断',
      tags: ['决策树', '智能分析'],
      createdAt: new Date().toISOString(),
      relatedDocuments: []
    };

    return [{
      document: mockDoc,
      relevanceScore: 0.92,
      matchedKeywords: ['智能诊断', '决策分析'],
      solutionSteps: [
        '收集多源数据',
        '执行决策树分析',
        '生成诊断建议',
        '提供解决方案'
      ],
      relatedDocuments: [],
      sourceType: 'decision_tree',
      confidence: 92.1,
      decisionPath: [
        { step: '数据收集', confidence: 95 },
        { step: '特征提取', confidence: 88 },
        { step: '模式识别', confidence: 92 },
        { step: '结果生成', confidence: 90 }
      ]
    }];
  };

  // 更新学习指标
  const updateLearningMetrics = (results: DiagnosisResult[]) => {
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    setLearningMetrics(prev => ({
      ...prev,
      totalCases: prev.totalCases + 1,
      successfulDiagnoses: avgConfidence > 70 ? prev.successfulDiagnoses + 1 : prev.successfulDiagnoses,
      accuracyRate: ((prev.successfulDiagnoses + (avgConfidence > 70 ? 1 : 0)) / (prev.totalCases + 1)) * 100,
      recentAccuracy: [...prev.recentAccuracy.slice(1), avgConfidence],
      learningProgress: Math.min(prev.learningProgress + 0.1, 100)
    }));
  };

  // 辅助函数
  const extractSolutionSteps = (content: string): string[] => {
    return [
      '初步检查设备状态',
      '分析故障现象',
      '确定故障原因',
      '制定解决方案',
      '执行维修操作',
      '验证修复效果'
    ];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image': return <ImageIcon />;
      case 'video': return <VideoIcon />;
      case 'audio': return <AudioIcon />;
      default: return <UploadIcon />;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* 注入CSS动画 */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      
      {/* 标题和学习能力展示 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DiagnosisIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                智能多模态诊断系统
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              支持文本、图片、视频、音频多种输入方式，结合智能决策树提供精准诊断
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LearningIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" color="white">学习能力</Typography>
                </Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {learningMetrics.accuracyRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  当前准确率 ({learningMetrics.successfulDiagnoses}/{learningMetrics.totalCases} 案例)
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={learningMetrics.learningProgress} 
                  sx={{ 
                    mt: 1, 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                  }} 
                />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  学习进度: {learningMetrics.learningProgress.toFixed(1)}%
                </Typography>
                
                {/* 实时能力曲线 */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                    📈 实时能力曲线
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'end', gap: 0.5, height: 40 }}>
                    {learningMetrics.recentAccuracy.map((accuracy, index) => (
                      <Box
                        key={index}
                        sx={{
                          flex: 1,
                          height: `${(accuracy / 100) * 40}px`,
                          bgcolor: index === learningMetrics.recentAccuracy.length - 1 ? 'white' : 'rgba(255,255,255,0.6)',
                          borderRadius: '2px 2px 0 0',
                          transition: 'all 0.3s ease',
                          minHeight: '4px'
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      5次前
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      当前
                    </Typography>
                  </Box>
                </Box>
                
                {/* 学习状态指示器 */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: learningMetrics.learningProgress > 70 ? '#4caf50' : '#ff9800',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {learningMetrics.learningProgress > 70 ? '智能学习中' : '快速学习中'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 输入方式选择 */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<TextIcon />} label="文本描述" />
          <Tab icon={<ImageIcon />} label="图片上传" />
          <Tab icon={<VideoIcon />} label="视频上传" />
          <Tab icon={<AudioIcon />} label="音频录制" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* 文本输入 */}
          {activeTab === 0 && (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="请详细描述设备故障现象、异常声音、错误代码等信息..."
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {/* 图片上传 */}
          {activeTab === 1 && (
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mb: 2 }}
              >
                选择图片文件
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                支持 JPG、PNG、GIF 等格式，可同时上传多张图片
              </Typography>
            </Box>
          )}

          {/* 视频上传 */}
          {activeTab === 2 && (
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="video/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<VideoIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mb: 2 }}
              >
                选择视频文件
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                支持 MP4、AVI、MOV 等格式，建议文件大小不超过 100MB
              </Typography>
            </Box>
          )}

          {/* 音频录制 */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button
                  variant={isRecording ? "contained" : "outlined"}
                  color={isRecording ? "error" : "primary"}
                  startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? `停止录音 ${formatTime(recordingTime)}` : '开始录音'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*"
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AudioIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  上传音频文件
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary">
                可以直接录制设备运行声音，或上传已有的音频文件进行分析
              </Typography>
            </Box>
          )}

          {/* 已选择的文件列表 */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                已选择的文件 ({selectedFiles.length})
              </Typography>
              <List dense>
                {selectedFiles.map((file, index) => (
                  <ListItem key={index} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                    <ListItemIcon>
                      {getFileIcon(file)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                    <IconButton onClick={() => removeFile(index)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 分析按钮 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={analyzing ? <CircularProgress size={20} /> : <SearchIcon />}
          onClick={performComprehensiveAnalysis}
          disabled={analyzing || (!faultDescription.trim() && selectedFiles.length === 0)}
          sx={{ minWidth: 200 }}
        >
          {analyzing ? '分析中...' : '开始智能诊断'}
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          startIcon={<TreeIcon />}
          onClick={() => setShowDecisionTree(true)}
          disabled={analyzing}
        >
          启动决策树
        </Button>
      </Box>

      {/* 分析进度 */}
      {analyzing && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            正在进行多模态智能分析...
          </Typography>
          <LinearProgress />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption">文本分析</Typography>
            <Typography variant="caption">媒体分析</Typography>
            <Typography variant="caption">决策树推理</Typography>
            <Typography variant="caption">结果生成</Typography>
          </Box>
        </Paper>
      )}

      {/* 诊断结果 */}
      {analysisComplete && diagnosisResults.length > 0 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon />
            智能诊断结果
            <Chip label={`${diagnosisResults.length} 个解决方案`} color="primary" size="small" />
          </Typography>

          {diagnosisResults.map((result, index) => (
            <Accordion key={index} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {result.sourceType === 'decision_tree' && <TreeIcon color="primary" />}
                    {result.sourceType === 'knowledge_base' && <SourceIcon color="success" />}
                    {result.sourceType === 'external_api' && <InfoIcon color="info" />}
                    <Typography variant="h6">
                      {result.document.title}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={`置信度: ${result.confidence.toFixed(1)}%`} 
                      color={result.confidence > 80 ? 'success' : result.confidence > 60 ? 'warning' : 'error'}
                      size="small"
                    />
                    <Rating value={result.confidence / 20} readOnly size="small" />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* 匹配关键词 */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" gutterBottom>
                      匹配关键词
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {result.matchedKeywords.map((keyword: string) => (
                        <Chip key={keyword} label={keyword} size="small" color="primary" />
                      ))}
                    </Box>
                  </Grid>

                  {/* 解决步骤 */}
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" gutterBottom>
                      解决步骤
                    </Typography>
                    <List dense>
                      {result.solutionSteps.map((step: string, stepIndex: number) => (
                        <ListItem key={stepIndex}>
                          <ListItemIcon>
                            <Typography variant="body2" color="primary">
                              {stepIndex + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>

                  {/* 决策路径（如果有） */}
                  {result.decisionPath && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        决策路径
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {result.decisionPath.map((path: any, pathIndex: number) => (
                          <Chip
                            key={pathIndex}
                            label={`${path.step} (${path.confidence}%)`}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {/* 信息来源标注 */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Alert
                      severity={result.sourceType === 'knowledge_base' ? 'success' : result.sourceType === 'decision_tree' ? 'info' : 'warning'}
                      icon={result.sourceType === 'decision_tree' ? <TreeIcon /> : <SourceIcon />}
                    >
                      <Typography variant="body2">
                        <strong>信息来源:</strong> {
                          result.sourceType === 'knowledge_base' ? '内部知识库' :
                          result.sourceType === 'decision_tree' ? '智能决策树' : '外部API'
                        } | <strong>置信度:</strong> {result.confidence.toFixed(1)}%
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      {/* 决策树对话框 */}
      <Dialog
        open={showDecisionTree}
        onClose={() => setShowDecisionTree(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TreeIcon />
            智能决策树诊断
          </Box>
        </DialogTitle>
        <DialogContent>
          <DecisionTree
            initialSymptoms={faultDescription ? [faultDescription] : []}
            onComplete={(result) => {
              console.log('决策树完成:', result);
              setShowDecisionTree(false);
              // 可以将决策树结果添加到诊断结果中
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDecisionTree(false)}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SmartDiagnosis; 