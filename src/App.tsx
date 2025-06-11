import React, { useState, useEffect } from 'react';
import './App.css';
import TextInput from './components/TextInput';
import VideoInput from './components/VideoInput';
import AudioInput from './components/AudioInput';
import MaterialLibrary from './components/MaterialLibrary';
import KnowledgeBase from './components/KnowledgeBase';
import KnowledgeGraph from './components/KnowledgeGraph';
import SmartDiagnosis from './components/SmartDiagnosis';
import DecisionTree from './components/DecisionTree';
import { analyzeText, analyzeVideo } from './api/faultAnalysis';
import DiagnosisResult from './components/DiagnosisResult';
import { CircularProgress, Alert, Box, Button, Typography, Container, Paper, Grid, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { DiagnosisResult as DiagnosisResultType, Statistics } from './types';
import { Settings as SettingsIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

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

interface CustomLogo {
  name: string;
  path: string;
}

function App() {
  const [activeInput, setActiveInput] = useState<'text' | 'video' | 'audio' | 'material' | 'knowledge' | 'graph' | 'diagnosis' | 'decision-tree'>('knowledge');
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResultType | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 知识库和素材库状态
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  
  // Logo相关状态
  const [selectedLogo, setSelectedLogo] = useState('/logo.png');
  const [customLogos, setCustomLogos] = useState<CustomLogo[]>([]);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<HTMLElement | null>(null);

  // 处理素材变化
  const handleMaterialsChange = (newMaterials: any[]) => {
    setMaterials(newMaterials);
  };

  // 处理添加到知识库
  const handleAddToKnowledgeBase = (document: KnowledgeDocument) => {
    setKnowledgeDocuments(prev => {
      // 检查是否已存在同样的文档
      const exists = prev.some(doc => doc.id === document.id);
      if (exists) {
        return prev;
      }
      return [...prev, document];
    });
  };

  // 处理知识库文档变化
  const handleKnowledgeDocumentsChange = (documents: KnowledgeDocument[]) => {
    setKnowledgeDocuments(documents);
  };

  // 显示知识图谱
  const handleShowKnowledgeGraph = () => {
    if (knowledgeDocuments.length === 0) {
      setError('请先生成知识库文档后再查看知识图谱');
      return;
    }
    setShowKnowledgeGraph(true);
  };

  const handleTextAnalysis = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeText(text);
      setDiagnosisResult(result.analysis);
      setStatistics(result.statistics || {
        totalFrames: 1,
        abnormalFrames: result.analysis.confidence > 0.7 ? 1 : 0,
        abnormalRatio: result.analysis.confidence,
        analyzedFrames: 1,
        duration: 0
      });
    } catch (err) {
      setError('文本分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoAnalysis = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeVideo(file);
      setDiagnosisResult(result.analysis);
      setStatistics(result.statistics || {
        totalFrames: 0,
        abnormalFrames: 0,
        abnormalRatio: 0,
        analyzedFrames: 0,
        duration: 0
      });
    } catch (err) {
      setError('视频分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioRecorded = async (audioFile: File) => {
    console.log('Audio file:', audioFile);
    // TODO: Implement audio analysis
  };

  const handleFrameCapture = (imageData: string) => {
    console.log('Frame captured:', imageData);
  };

  const handleCustomLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoPath = e.target?.result as string;
        const newLogo: CustomLogo = {
          name: file.name,
          path: logoPath
        };
        setCustomLogos(prev => [...prev, newLogo]);
        setSelectedLogo(logoPath);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteCustomLogo = (logoPath: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCustomLogos(prev => prev.filter(logo => logo.path !== logoPath));
    if (selectedLogo === logoPath) {
      setSelectedLogo('/logo.png');
    }
  };

  const resetAll = () => {
    setDiagnosisResult(null);
    setStatistics(null);
    setError(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* 头部 */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={selectedLogo} 
              alt="Logo" 
              style={{ 
                width: 50, 
                height: 50, 
                marginRight: 16,
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🔋 电车换电故障排除知识图谱
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                智能故障诊断 | 知识图谱可视化 | 专业解决方案
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* 统计信息 */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{knowledgeDocuments.length}</Typography>
              <Typography variant="caption">知识文档</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{materials.length}</Typography>
              <Typography variant="caption">素材资源</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{materials.filter(m => m.autoIntegrated).length}</Typography>
              <Typography variant="caption">已集成</Typography>
            </Box>
            
            {/* 设置菜单 */}
            <Tooltip title="设置">
              <IconButton 
                color="inherit"
                onClick={(e) => setSettingsMenuAnchor(e.currentTarget)}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 设置菜单 */}
        <Menu
          anchorEl={settingsMenuAnchor}
          open={Boolean(settingsMenuAnchor)}
          onClose={() => setSettingsMenuAnchor(null)}
        >
          <MenuItem component="label">
            <CloudUploadIcon sx={{ mr: 1 }} />
            上传自定义Logo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleCustomLogoUpload}
            />
          </MenuItem>
          {customLogos.map((logo) => (
            <MenuItem key={logo.path} onClick={() => setSelectedLogo(logo.path)}>
              <img 
                src={logo.path} 
                alt={logo.name}
                style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%' }}
              />
              {logo.name}
              <IconButton
                size="small"
                onClick={(e) => handleDeleteCustomLogo(logo.path, e)}
                sx={{
                  ml: 'auto',
                  color: 'error.main',
                  '&:hover': { backgroundColor: 'error.lighter' }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </MenuItem>
          ))}
        </Menu>

        {/* 主内容区域 */}
        <Box sx={{ p: 3 }}>
          {/* 功能模块选择 */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant={activeInput === 'text' ? 'contained' : 'outlined'}
                onClick={() => setActiveInput('text')}
                fullWidth
                size="large"
                sx={{ py: 2 }}
              >
                文字诊断
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant={activeInput === 'video' ? 'contained' : 'outlined'}
                onClick={() => setActiveInput('video')}
                fullWidth
                size="large"
                sx={{ py: 2 }}
              >
                视频诊断
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant={activeInput === 'audio' ? 'contained' : 'outlined'}
                onClick={() => setActiveInput('audio')}
                fullWidth
                size="large"
                sx={{ py: 2 }}
              >
                语音诊断
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant={activeInput === 'material' ? 'contained' : 'outlined'}
                onClick={() => setActiveInput('material')}
                fullWidth
                size="large"
                sx={{ py: 2 }}
              >
                素材库
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant={activeInput === 'knowledge' ? 'contained' : 'outlined'}
                onClick={() => setActiveInput('knowledge')}
                fullWidth
                size="large"
                sx={{ py: 2 }}
              >
                知识库
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant={activeInput === 'diagnosis' ? 'contained' : 'outlined'}
                onClick={() => setActiveInput('diagnosis')}
                fullWidth
                size="large"
                sx={{ py: 2 }}
              >
                智能诊断
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant={activeInput === 'decision-tree' ? 'contained' : 'outlined'}
                onClick={() => setActiveInput('decision-tree')}
                fullWidth
                size="large"
                sx={{ py: 2 }}
              >
                决策树
              </Button>
            </Grid>
          </Grid>

          {/* 错误提示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* 内容区域 */}
          <Box sx={{ minHeight: '500px' }}>
            {activeInput === 'text' && (
              <TextInput onSubmit={handleTextAnalysis} />
            )}
            
            {activeInput === 'video' && (
              <VideoInput onVideoUpload={handleVideoAnalysis} />
            )}
            
            {activeInput === 'audio' && (
              <AudioInput onAudioSubmit={handleAudioRecorded} />
            )}
            
            {activeInput === 'material' && (
              <MaterialLibrary 
                onMaterialsChange={handleMaterialsChange}
                onAddToKnowledgeBase={handleAddToKnowledgeBase}
              />
            )}
            
            {activeInput === 'knowledge' && (
              <KnowledgeBase 
                onDocumentsChange={handleKnowledgeDocumentsChange}
                onShowKnowledgeGraph={handleShowKnowledgeGraph}
              />
            )}
            
            {activeInput === 'diagnosis' && (
              <SmartDiagnosis documents={knowledgeDocuments} />
            )}

            {activeInput === 'decision-tree' && (
              <DecisionTree 
                onComplete={(result) => {
                  console.log('决策树诊断完成:', result);
                  // 可以选择性地将结果转换为 DiagnosisResult 格式
                }}
              />
            )}

            {/* 加载状态 */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  正在分析中...
                </Typography>
              </Box>
            )}

            {/* 诊断结果 */}
            {diagnosisResult && !loading && (
              <Box sx={{ mt: 4 }}>
                <DiagnosisResult 
                  result={diagnosisResult}
                  statistics={statistics}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

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
    </Container>
  );
}

export default App; 