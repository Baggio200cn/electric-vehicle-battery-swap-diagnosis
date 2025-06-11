import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Alert,
  TextField,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  CardMedia,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  Description as TextIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Language as WebIcon,
  Image as ImageIcon,
  AutoFixHigh as AutoIntegrateIcon,
  LibraryBooks as KnowledgeIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Material {
  id: string;
  name: string;
  type: 'text' | 'audio' | 'video' | 'web' | 'image';
  size?: string;
  uploadDate: string;
  url?: string;
  content?: string;
  description?: string;
  imagePreview?: string;
  category?: string;
  tags?: string[];
  autoIntegrated?: boolean;
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

interface MaterialLibraryProps {
  onMaterialsChange?: (materials: Material[]) => void;
  onAddToKnowledgeBase?: (document: KnowledgeDocument) => void;
}

const MaterialLibrary: React.FC<MaterialLibraryProps> = ({ 
  onMaterialsChange, 
  onAddToKnowledgeBase 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewDialog, setViewDialog] = useState<{ open: boolean; material: Material | null }>({
    open: false,
    material: null
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [autoIntegrationEnabled, setAutoIntegrationEnabled] = useState(true);
  const [integrationDialog, setIntegrationDialog] = useState<{ 
    open: boolean; 
    material: Material | null; 
    suggestedCategory: string;
    suggestedTags: string[];
  }>({
    open: false,
    material: null,
    suggestedCategory: '',
    suggestedTags: []
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 知识库分类
  const knowledgeCategories = [
    '系统概述',
    '机械故障', 
    '电气故障',
    '安全系统',
    '电池系统',
    '维护保养',
    '技术标准',
    '操作规程',
    '故障案例'
  ];

  // 加载已保存的素材库数据
  useEffect(() => {
    console.log('加载素材库数据...');
    const savedMaterials = localStorage.getItem('materialLibrary');
    if (savedMaterials) {
      try {
        const parsedMaterials = JSON.parse(savedMaterials);
        console.log('从localStorage加载了', parsedMaterials.length, '个素材');
        setMaterials(parsedMaterials);
        onMaterialsChange?.(parsedMaterials);
      } catch (error) {
        console.error('加载素材库数据失败:', error);
      }
    } else {
      console.log('localStorage中没有素材库数据');
    }

    // 加载自动集成设置
    const savedAutoIntegration = localStorage.getItem('autoIntegrationEnabled');
    if (savedAutoIntegration !== null) {
      setAutoIntegrationEnabled(JSON.parse(savedAutoIntegration));
    }
  }, [onMaterialsChange]);

  // 保存素材库数据到localStorage
  const saveMaterialsToStorage = (materialsToSave: Material[]) => {
    try {
      localStorage.setItem('materialLibrary', JSON.stringify(materialsToSave));
    } catch (error) {
      console.error('保存素材库数据失败:', error);
    }
  };

  // 保存自动集成设置
  const saveAutoIntegrationSetting = (enabled: boolean) => {
    try {
      localStorage.setItem('autoIntegrationEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('保存自动集成设置失败:', error);
    }
  };

  // 更新素材库并保存
  const updateMaterials = (newMaterials: Material[]) => {
    setMaterials(newMaterials);
    onMaterialsChange?.(newMaterials);
    saveMaterialsToStorage(newMaterials);
  };

  // 自动分类算法
  const autoCategorizeMaterial = (material: Material): { category: string; tags: string[] } => {
    const content = (material.content || material.description || material.name).toLowerCase();
    
    // 关键词映射
    const categoryKeywords = {
      '机械故障': ['机器人', '手臂', '传输', '升降', '机械', '卡顿', '异响', '磨损', '润滑', '齿轮', '轴承'],
      '电气故障': ['电气', '控制', '传感器', '电源', '通信', '故障码', 'PLC', '变频器', '继电器'],
      '电池系统': ['电池', 'BMS', '充电', '电压', '电流', '温度', '均衡', '过充', '过放', '热失控'],
      '安全系统': ['安全', '报警', '火灾', '烟雾', '气体', '泄漏', '光幕', '急停', '消防', '防护'],
      '维护保养': ['维护', '保养', '检查', '清洁', '更换', '校准', '预防', '定期', '润滑', '点检'],
      '技术标准': ['标准', '规范', '要求', 'GB', 'JT', 'ISO', '国标', '行标', '企标'],
      '操作规程': ['操作', '程序', '流程', '步骤', '指导', '手册', '作业', '规程'],
      '故障案例': ['故障', '案例', '事故', '异常', '问题', '处理', '解决', '维修']
    };

    let bestCategory = '系统概述';
    let maxScore = 0;
    const matchedTags: string[] = [];

    // 计算每个分类的匹配分数
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          score += 1;
          matchedTags.push(keyword);
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    });

    // 去重并限制标签数量
    const uniqueTags = [...new Set(matchedTags)].slice(0, 5);
    
    return {
      category: bestCategory,
      tags: uniqueTags
    };
  };

  // 将素材转换为知识库文档
  const convertToKnowledgeDocument = (material: Material, category: string, tags: string[]): KnowledgeDocument => {
    return {
      id: `kb_${material.id}`,
      title: material.name,
      content: material.content || material.description || `# ${material.name}\n\n导入自素材库的文档。\n\n${material.description || '暂无详细描述。'}`,
      category,
      tags,
      createdAt: new Date().toISOString(),
      relatedDocuments: []
    };
  };

  // 自动集成到知识库
  const integrateToKnowledgeBase = (material: Material) => {
    const { category, tags } = autoCategorizeMaterial(material);
    
    if (autoIntegrationEnabled) {
      // 直接自动集成
      const document = convertToKnowledgeDocument(material, category, tags);
      onAddToKnowledgeBase?.(document);
      
      // 更新素材状态
      const updatedMaterials = materials.map(m => 
        m.id === material.id 
          ? { ...m, category, tags, autoIntegrated: true }
          : m
      );
      updateMaterials(updatedMaterials);
    } else {
      // 显示确认对话框
      setIntegrationDialog({
        open: true,
        material,
        suggestedCategory: category,
        suggestedTags: tags
      });
    }
  };

  // 手动集成确认
  const handleManualIntegration = () => {
    const { material, suggestedCategory, suggestedTags } = integrationDialog;
    if (material) {
      const document = convertToKnowledgeDocument(material, suggestedCategory, suggestedTags);
      onAddToKnowledgeBase?.(document);
      
      const updatedMaterials = materials.map(m => 
        m.id === material.id 
          ? { ...m, category: suggestedCategory, tags: suggestedTags, autoIntegrated: true }
          : m
      );
      updateMaterials(updatedMaterials);
    }
    
    setIntegrationDialog({
      open: false,
      material: null,
      suggestedCategory: '',
      suggestedTags: []
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleWebSearch = async () => {
    setIsSearching(true);
    try {
      const mockResults = [
        {
          title: "电动汽车电池更换站通用技术要求 GB/T 29772-2013",
          url: "https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D801B1D3A7E05397BE0A0AB82A",
          content: "国家标准《电动汽车电池更换站通用技术要求》包含了配电站设计规范、安全要求、维护标准等关键内容。涵盖电池更换设备、充电系统、安全防护、应急处理等方面的技术要求。本标准适用于电动汽车电池更换站的设计、建设、运营和维护，规定了更换站的基本要求、技术要求、安全要求、试验方法等。主要内容包括：1. 更换站分类和组成 2. 技术性能要求 3. 安全防护要求 4. 环境适应性要求 5. 电磁兼容性要求 6. 可靠性要求 7. 维护保养要求。",
          type: "技术标准"
        },
        {
          title: "纯电动汽车维护、检测、诊断技术规范 JT/T 1344-2020",
          url: "https://www.example.com/maintenance-standard",
          content: "该标准规定了纯电动汽车维护的作业安全和作业要求，包括日常维护、一级维护和二级维护的具体操作流程。涵盖动力蓄电池系统、驱动电机系统、高压配电系统等关键部件的维护要求。主要维护项目：1. 动力蓄电池系统检查 2. 充电系统检查 3. 高压线束检查 4. 绝缘电阻测试 5. 冷却系统检查 6. 制动系统检查 7. 转向传动系统检查。检测诊断内容包括故障代码读取、数据流分析、执行器测试等。",
          type: "维护规范"
        },
        {
          title: "换电站故障快速诊断与处理手册",
          url: "https://www.example.com/fault-diagnosis",
          content: "包含换电站常见故障类型、故障现象分析、诊断方法、处理流程等实用内容。涵盖电池故障、充电故障、通信故障、机械故障等多种情况的处理方案。常见故障类型：1. 机械臂故障 - 定位不准、动作缓慢、抓取失败 2. 电池检测故障 - BMS通信异常、电压异常、温度异常 3. 充电系统故障 - 充电桩故障、接触不良、过流保护 4. 控制系统故障 - PLC故障、传感器故障、网络通信故障。每种故障都提供详细的诊断步骤和解决方案。",
          type: "操作手册"
        },
        {
          title: "电池更换站安全作业指导书",
          url: "https://www.example.com/safety-guide",
          content: "详细说明电池更换作业中的安全要求、防护措施、应急处理程序等。包括人员安全、设备安全、环境安全等多个方面的指导内容。安全要求：1. 人员资质要求 - 持证上岗、定期培训 2. 个人防护用品 - 绝缘手套、安全帽、防护服 3. 作业环境要求 - 通风良好、温湿度适宜、无易燃易爆物品 4. 设备安全检查 - 日检、周检、月检项目清单 5. 应急处理程序 - 火灾应急、触电应急、化学品泄漏应急。",
          type: "安全指南"
        }
      ];
      
      setSearchResults(mockResults);
      
      setTimeout(() => {
        setIsSearching(false);
      }, 2000);
    } catch (error) {
      console.error('搜索失败:', error);
      setIsSearching(false);
    }
  };

  const addWebMaterial = (result: any) => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      name: result.title,
      type: 'web',
      uploadDate: new Date().toLocaleDateString('zh-CN'),
      url: result.url,
      content: result.content,
      description: `类型: ${result.type}\n来源: 互联网搜索\n内容: ${result.content}`
    };
    
    const updatedMaterials = [...materials, newMaterial];
    updateMaterials(updatedMaterials);
    
    setSearchResults(prev => prev.filter(r => r.title !== result.title));
    
    // 自动集成到知识库
    integrateToKnowledgeBase(newMaterial);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'text' | 'audio' | 'video' | 'image') => {
    const files = event.target.files;
    console.log('文件上传触发:', { type, fileCount: files?.length });
    if (files) {
      Array.from(files).forEach(file => {
        console.log('处理文件:', { name: file.name, type: file.type, size: file.size });
        const newMaterial: Material = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          uploadDate: new Date().toLocaleDateString('zh-CN'),
          description: `文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB\n上传时间: ${new Date().toLocaleString('zh-CN')}`
        };

        // 如果是图片文件，创建预览URL
        if (type === 'image') {
          const reader = new FileReader();
          reader.onload = (e) => {
            newMaterial.imagePreview = e.target?.result as string;
            // 使用回调函数确保获取最新状态
            setMaterials(prevMaterials => {
              const updatedMaterials = [...prevMaterials, newMaterial];
              console.log('图片文件添加成功:', newMaterial.name, '总数:', updatedMaterials.length);
              onMaterialsChange?.(updatedMaterials);
              saveMaterialsToStorage(updatedMaterials);
              return updatedMaterials;
            });
            
            // 自动集成到知识库
            integrateToKnowledgeBase(newMaterial);
          };
          reader.readAsDataURL(file);
        } else if (type === 'text') {
          // 读取文本文件内容
          const reader = new FileReader();
          reader.onload = (e) => {
            newMaterial.content = e.target?.result as string;
            // 使用回调函数确保获取最新状态
            setMaterials(prevMaterials => {
              const updatedMaterials = [...prevMaterials, newMaterial];
              console.log('文本文件添加成功:', newMaterial.name, '总数:', updatedMaterials.length);
              onMaterialsChange?.(updatedMaterials);
              saveMaterialsToStorage(updatedMaterials);
              return updatedMaterials;
            });
            
            // 自动集成到知识库
            integrateToKnowledgeBase(newMaterial);
          };
          reader.readAsText(file);
        } else {
          // 对于音频和视频文件，直接添加
          setMaterials(prevMaterials => {
            const updatedMaterials = [...prevMaterials, newMaterial];
            console.log('音频/视频文件添加成功:', newMaterial.name, '总数:', updatedMaterials.length);
            onMaterialsChange?.(updatedMaterials);
            saveMaterialsToStorage(updatedMaterials);
            return updatedMaterials;
          });
          
          // 自动集成到知识库
          integrateToKnowledgeBase(newMaterial);
        }
      });
    }
    
    // 清空文件输入值，允许重复上传同一文件
    event.target.value = '';
  };

  // 处理自动集成设置变化
  const handleAutoIntegrationToggle = (enabled: boolean) => {
    setAutoIntegrationEnabled(enabled);
    saveAutoIntegrationSetting(enabled);
  };

  // 删除素材
  const handleDeleteMaterial = (materialId: string) => {
    const updatedMaterials = materials.filter(m => m.id !== materialId);
    updateMaterials(updatedMaterials);
  };

  // 清空素材库
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有素材吗？此操作不可恢复。')) {
      updateMaterials([]);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === 0 || 
      (activeTab === 1 && material.type === 'text') ||
      (activeTab === 2 && material.type === 'audio') ||
      (activeTab === 3 && material.type === 'video') ||
      (activeTab === 4 && material.type === 'image') ||
      (activeTab === 5 && material.type === 'web');
    return matchesSearch && matchesType;
  });

  const getStats = () => {
    return {
      total: materials.length,
      text: materials.filter(m => m.type === 'text').length,
      audio: materials.filter(m => m.type === 'audio').length,
      video: materials.filter(m => m.type === 'video').length,
      image: materials.filter(m => m.type === 'image').length,
      web: materials.filter(m => m.type === 'web').length,
      integrated: materials.filter(m => m.autoIntegrated).length
    };
  };

  const stats = getStats();

  const handleViewMaterial = (material: Material) => {
    setViewDialog({ open: true, material });
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'text': return <TextIcon />;
      case 'audio': return <AudioIcon />;
      case 'video': return <VideoIcon />;
      case 'image': return <ImageIcon />;
      case 'web': return <WebIcon />;
      default: return <FolderIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'primary';
      case 'audio': return 'secondary';
      case 'video': return 'error';
      case 'image': return 'warning';
      case 'web': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📚 素材库管理
      </Typography>

      {/* 统计信息和设置 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                素材统计
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Chip 
                    icon={<FolderIcon />} 
                    label={`总计: ${stats.total}`} 
                    color="primary" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<TextIcon />} 
                    label={`文档: ${stats.text}`} 
                    color="default" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<AudioIcon />} 
                    label={`音频: ${stats.audio}`} 
                    color="secondary" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<VideoIcon />} 
                    label={`视频: ${stats.video}`} 
                    color="error" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<ImageIcon />} 
                    label={`图片: ${stats.image}`} 
                    color="warning" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<WebIcon />} 
                    label={`网络: ${stats.web}`} 
                    color="success" 
                  />
                </Grid>
              </Grid>
              {stats.total > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearAll}
                  >
                    清空所有
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                知识库集成设置
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoIntegrationEnabled}
                    onChange={(e) => handleAutoIntegrationToggle(e.target.checked)}
                    color="primary"
                  />
                }
                label="自动集成到知识库"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {autoIntegrationEnabled 
                  ? "新上传的素材将自动分类并添加到知识库" 
                  : "需要手动确认后才会添加到知识库"
                }
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<KnowledgeIcon />} 
                  label={`已集成: ${materials.filter(m => m.autoIntegrated).length}`}
                  color="success"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 搜索和上传区域 */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="搜索素材..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => document.getElementById('text-upload')?.click()}
                size="small"
              >
                文档
              </Button>
              <Button
                variant="outlined"
                startIcon={<AudioIcon />}
                onClick={() => document.getElementById('audio-upload')?.click()}
                size="small"
              >
                音频
              </Button>
              <Button
                variant="outlined"
                startIcon={<VideoIcon />}
                onClick={() => document.getElementById('video-upload')?.click()}
                size="small"
              >
                视频
              </Button>
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={() => document.getElementById('image-upload')?.click()}
                size="small"
              >
                图片
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 网络搜索区域 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🌐 网络资源搜索
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="搜索电车换电相关技术资料..."
              fullWidth
              size="small"
            />
            <Button 
              variant="contained" 
              onClick={handleWebSearch}
              disabled={isSearching}
              startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {isSearching ? '搜索中...' : '搜索'}
            </Button>
          </Box>
          
          {searchResults.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                搜索结果:
              </Typography>
              <List>
                {searchResults.map((result, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={result.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {result.content.substring(0, 150)}...
                          </Typography>
                          <Chip 
                            label={result.type} 
                            size="small" 
                            sx={{ mt: 1 }} 
                            color="primary"
                          />
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addWebMaterial(result)}
                    >
                      添加
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 分类标签 */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label={`全部 (${stats.total})`} />
        <Tab label={`文档 (${stats.text})`} />
        <Tab label={`音频 (${stats.audio})`} />
        <Tab label={`视频 (${stats.video})`} />
        <Tab label={`图片 (${stats.image})`} />
        <Tab label={`网络 (${stats.web})`} />
      </Tabs>

      {/* 素材列表 */}
      <Grid container spacing={3}>
        {filteredMaterials.map((material) => (
          <Grid item xs={12} sm={6} md={4} key={material.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {material.type === 'image' && material.imagePreview && (
                <CardMedia
                  component="img"
                  height="140"
                  image={material.imagePreview}
                  alt={material.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {renderIcon(material.type)}
                  <Typography variant="h6" sx={{ ml: 1, fontSize: '1rem' }}>
                    {material.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={material.type} 
                    size="small" 
                    color={getTypeColor(material.type) as any}
                  />
                  {material.autoIntegrated && (
                    <Chip 
                      icon={<KnowledgeIcon />}
                      label="已集成" 
                      size="small" 
                      color="success"
                    />
                  )}
                  {material.category && (
                    <Chip 
                      label={material.category} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {material.tags && material.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    {material.tags.slice(0, 3).map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {material.tags.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{material.tags.length - 3} 更多
                      </Typography>
                    )}
                  </Box>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  {material.size && `大小: ${material.size} | `}
                  上传时间: {material.uploadDate}
                </Typography>
                
                {material.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {material.description.length > 100 
                      ? `${material.description.substring(0, 100)}...` 
                      : material.description
                    }
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => handleViewMaterial(material)}
                  title="查看详情"
                >
                  <ViewIcon />
                </IconButton>
                <IconButton 
                  size="small"
                  title="下载"
                >
                  <DownloadIcon />
                </IconButton>
                {!material.autoIntegrated && (
                  <Button 
                    size="small"
                    startIcon={<AutoIntegrateIcon />}
                    onClick={() => integrateToKnowledgeBase(material)}
                    color="primary"
                  >
                    集成
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 空状态 */}
      {filteredMaterials.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <FolderIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              暂无素材
            </Typography>
            <Typography variant="body2" color="text.secondary">
              上传文件或搜索网络资源来添加素材
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        id="text-upload"
        multiple
        accept=".txt,.md,.doc,.docx,.pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e, 'text')}
      />
      <input
        type="file"
        id="audio-upload"
        multiple
        accept=".mp3,.wav,.ogg,.m4a"
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e, 'audio')}
      />
      <input
        type="file"
        id="video-upload"
        multiple
        accept=".mp4,.avi,.mov,.wmv"
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e, 'video')}
      />
      <input
        type="file"
        id="image-upload"
        multiple
        accept=".jpg,.jpeg,.png,.gif,.bmp"
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e, 'image')}
      />

      {/* 素材详情对话框 */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, material: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {viewDialog.material?.name}
        </DialogTitle>
        <DialogContent>
          {viewDialog.material && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={viewDialog.material.type} 
                  color={getTypeColor(viewDialog.material.type) as any}
                />
                {viewDialog.material.autoIntegrated && (
                  <Chip 
                    icon={<KnowledgeIcon />}
                    label="已集成到知识库" 
                    color="success"
                  />
                )}
              </Box>
              
              {viewDialog.material.imagePreview && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img 
                    src={viewDialog.material.imagePreview} 
                    alt={viewDialog.material.name}
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                  />
                </Box>
              )}
              
              <Typography variant="body1" paragraph>
                {viewDialog.material.description || '暂无描述'}
              </Typography>
              
              {viewDialog.material.content && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    内容:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      maxHeight: '300px',
                      overflow: 'auto',
                      backgroundColor: 'grey.50',
                      p: 2,
                      borderRadius: 1
                    }}
                  >
                    {viewDialog.material.content}
                  </Typography>
                </Box>
              )}
              
              {viewDialog.material.url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    来源: <a href={viewDialog.material.url} target="_blank" rel="noopener noreferrer">
                      {viewDialog.material.url}
                    </a>
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, material: null })}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      {/* 手动集成确认对话框 */}
      <Dialog
        open={integrationDialog.open}
        onClose={() => setIntegrationDialog({ 
          open: false, 
          material: null, 
          suggestedCategory: '', 
          suggestedTags: [] 
        })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          确认集成到知识库
        </DialogTitle>
        <DialogContent>
          {integrationDialog.material && (
            <Box>
              <Typography variant="body1" gutterBottom>
                素材: {integrationDialog.material.name}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>分类</InputLabel>
                <Select
                  value={integrationDialog.suggestedCategory}
                  onChange={(e) => setIntegrationDialog(prev => ({
                    ...prev,
                    suggestedCategory: e.target.value
                  }))}
                >
                  {knowledgeCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="body2" gutterBottom>
                建议标签:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                {integrationDialog.suggestedTags.map((tag, index) => (
                  <Chip 
                    key={index}
                    label={tag} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIntegrationDialog({ 
            open: false, 
            material: null, 
            suggestedCategory: '', 
            suggestedTags: [] 
          })}>
            取消
          </Button>
          <Button 
            onClick={handleManualIntegration}
            variant="contained"
            startIcon={<KnowledgeIcon />}
          >
            确认集成
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialLibrary;
