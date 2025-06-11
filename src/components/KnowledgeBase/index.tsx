import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Storage as StorageIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  AutoFixHigh as GenerateIcon,
  SchemaOutlined as KnowledgeGraphIcon
} from '@mui/icons-material';

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  relatedDocuments: string[];
}

interface KnowledgeBaseProps {
  onDocumentsChange?: (documents: KnowledgeDocument[]) => void;
  onShowKnowledgeGraph?: () => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onDocumentsChange, onShowKnowledgeGraph }) => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // 电车换电故障排除知识模板
  const knowledgeTemplates = [
    {
      title: "电车换电系统总体结构与工作原理",
      category: "系统概述",
      content: `# 电车换电系统总体结构与工作原理

## 系统组成
电车换电系统主要由以下几个部分组成：
1. **换电站主体结构**：包括站房、储能舱、操作台等
2. **电池存储系统**：多层电池存储架，支持不同型号电池
3. **机械操作系统**：机器人手臂、传输轨道、定位系统
4. **电气控制系统**：主控制器、安全监测、通信模块
5. **充电系统**：直流充电桩、电源管理、散热系统

## 工作流程
1. 车辆进入换电位，系统自动识别车型
2. 解锁并取出低电量电池
3. 从储能仓中选取满电电池
4. 安装新电池并进行安全检查
5. 完成换电，车辆可以驶离

## 关键技术指标
- 换电时间：3-5分钟
- 支持电池规格：多种标准化电池包
- 安全等级：IP67防护等级
- 年换电量：可达100万次以上`,
      tags: ["系统结构", "工作原理", "技术指标"],
      relatedDocuments: ["机械系统故障", "电气系统故障", "安全系统故障"]
    },
    {
      title: "机械系统常见故障及排除方法",
      category: "机械故障",
      content: `# 机械系统常见故障及排除方法

## 1. 机器人手臂故障
### 故障现象
- 手臂动作缓慢或卡顿
- 定位精度下降
- 抓取力度不足

### 可能原因
- 伺服电机老化
- 传动齿轮磨损
- 液压系统压力不足
- 传感器故障

### 排除方法
1. 检查伺服电机运行参数
2. 清洁并润滑传动机构
3. 检查液压油位和压力
4. 校准位置传感器
5. 更换磨损部件

## 2. 电池传输轨道故障
### 故障现象
- 电池传输卡滞
- 轨道异响
- 传输速度异常

### 排除方法
1. 清理轨道杂物
2. 检查导轨润滑情况
3. 调整传输电机参数
4. 更换磨损的导轮

## 3. 升降机构故障
### 预防措施
- 定期检查钢丝绳磨损
- 保持导轨清洁
- 监控载荷传感器数据`,
      tags: ["机械故障", "手臂故障", "传输故障", "维修方法"],
      relatedDocuments: ["系统概述", "电气系统故障", "预防性维护"]
    },
    {
      title: "电气控制系统故障诊断",
      category: "电气故障",
      content: `# 电气控制系统故障诊断

## 主控制器故障
### 常见故障码
- E001: 通信故障
- E002: 传感器异常
- E003: 执行器故障
- E004: 电源异常
- E005: 安全系统报警

### 诊断步骤
1. **检查电源供应**
   - 测量输入电压是否稳定
   - 检查保险丝和断路器状态
   - 验证UPS工作正常

2. **通信系统检查**
   - 验证网络连接状态
   - 检查通信协议设置
   - 测试数据传输完整性

3. **传感器系统**
   - 校准位置传感器
   - 检查温度传感器精度
   - 验证压力传感器工作范围

## 充电系统故障
### 故障表现
- 充电电流异常
- 充电温度过高
- 充电效率低下

### 解决方案
1. 检查充电桩连接状态
2. 清洁充电接触点
3. 校准电流电压测量
4. 更换老化的充电模块`,
      tags: ["电气故障", "控制系统", "充电故障", "故障码"],
      relatedDocuments: ["机械系统故障", "安全系统故障", "系统概述"]
    },
    {
      title: "安全系统故障处理与应急预案",
      category: "安全系统",
      content: `# 安全系统故障处理与应急预案

## 火灾报警系统
### 烟雾探测器故障
- **故障现象**: 误报警或无法检测
- **处理方法**: 清洁探测器、更换电池、校准灵敏度
- **应急措施**: 启用备用探测器，增加人工巡检

## 气体泄漏检测
### 氢气检测系统
- **检测范围**: 0-1000ppm
- **报警阈值**: 100ppm
- **故障处理**: 
  1. 校准检测仪器
  2. 检查采样管路
  3. 更换传感器元件

## 人员安全系统
### 安全光幕故障
- **故障现象**: 无法正常遮断
- **紧急处理**: 立即停机，启用物理隔离
- **维修步骤**:
  1. 清洁光学元件
  2. 校准光束对齐
  3. 测试响应时间

## 应急预案
### 电池热失控
1. 立即断电
2. 启动消防系统
3. 疏散人员
4. 通知专业救援

### 机械故障紧急停机
1. 按下急停按钮
2. 检查人员安全
3. 隔离故障区域
4. 记录故障信息`,
      tags: ["安全系统", "应急预案", "火灾报警", "气体检测"],
      relatedDocuments: ["电气系统故障", "机械系统故障", "维护计划"]
    },
    {
      title: "电池管理系统BMS故障分析",
      category: "电池系统",
      content: `# 电池管理系统BMS故障分析

## BMS系统架构
### 主要功能模块
1. **电池监测模块**
   - 单体电压监测
   - 电池温度监测
   - 电流检测

2. **均衡管理模块**
   - 主动均衡控制
   - 被动均衡管理
   - 均衡效率监测

3. **安全保护模块**
   - 过充保护
   - 过放保护
   - 过温保护
   - 短路保护

## 常见BMS故障
### 1. 电压检测异常
**故障现象**:
- 单体电压读数异常
- 总电压计算错误
- 电压采样漂移

**故障原因**:
- ADC转换器故障
- 采样电路问题
- 传感器老化

**解决方法**:
1. 校准ADC转换精度
2. 检查采样电路连接
3. 更换故障传感器
4. 重新标定电压基准

### 2. 温度监测故障
**故障表现**:
- 温度读数不准确
- 温度传感器断线
- 温度保护失效

**处理步骤**:
1. 检查温度传感器连接
2. 校准温度测量精度
3. 验证温度保护阈值
4. 更换故障传感器

### 3. 通信故障
**故障类型**:
- CAN通信中断
- 数据包丢失
- 通信速率异常

**解决方案**:
1. 检查CAN总线完整性
2. 验证通信协议设置
3. 更换通信控制器
4. 优化通信参数`,
      tags: ["BMS", "电池管理", "电压监测", "温度监测", "通信故障"],
      relatedDocuments: ["电气系统故障", "安全系统故障", "充电系统故障"]
    }
  ];

  // 生成知识库文档
  const generateKnowledgeBase = async () => {
    setGenerating(true);
    setLoading(true);

    try {
      const newDocuments: KnowledgeDocument[] = [];
      
      // 基础文档（前5个）
      for (let i = 0; i < Math.min(5, knowledgeTemplates.length); i++) {
        const template = knowledgeTemplates[i];
        const doc: KnowledgeDocument = {
          id: `kb-${Date.now()}-${i}`,
          title: template.title,
          content: template.content,
          category: template.category,
          tags: template.tags,
          createdAt: new Date().toISOString(),
          relatedDocuments: template.relatedDocuments
        };
        newDocuments.push(doc);
        
        // 模拟生成进度
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 生成额外15个衍生文档
      const additionalTopics = [
        "换电站环境监测系统故障处理",
        "电池包锁止机构故障分析",
        "充电模块热管理故障排除",
        "换电机器人视觉系统故障诊断",
        "电池包CAN总线通信故障",
        "换电站照明系统维护指南",
        "电池包举升机构安全检查",
        "换电站消防系统维护规程",
        "电池储存环境控制系统故障",
        "换电站接地系统检测方法",
        "电池包接触器故障诊断",
        "换电站监控系统故障处理",
        "电池包密封性检测方法",
        "换电站通风系统维护指南",
        "电池包绝缘检测故障分析"
      ];

      for (let i = 0; i < additionalTopics.length; i++) {
        const topic = additionalTopics[i];
        const doc: KnowledgeDocument = {
          id: `kb-ext-${Date.now()}-${i}`,
          title: topic,
          content: generateDetailedContent(topic),
          category: getCategoryByTopic(topic),
          tags: generateTagsByTopic(topic),
          createdAt: new Date().toISOString(),
          relatedDocuments: getRelatedDocuments(topic)
        };
        newDocuments.push(doc);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setDocuments(newDocuments);
      
      // 保存到localStorage
      localStorage.setItem('knowledgeBase', JSON.stringify(newDocuments));
      
      // 通知父组件
      if (onDocumentsChange) {
        onDocumentsChange(newDocuments);
      }

    } catch (error) {
      console.error('生成知识库失败:', error);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  // 根据主题生成详细内容
  const generateDetailedContent = (topic: string): string => {
    return `# ${topic}

## 概述
本文档详细介绍了${topic}的相关技术要点、常见故障现象、诊断方法和解决方案。

## 技术要点
1. **系统架构分析**
   - 核心组件识别
   - 工作原理说明
   - 关键参数定义

2. **故障模式分析** 
   - 常见故障现象描述
   - 故障原因分析
   - 故障影响评估

3. **诊断方法**
   - 系统状态检查
   - 参数测量方法
   - 故障定位步骤

## 预防措施
- 定期检查保养计划
- 关键参数监测要求
- 预警系统设置

## 应急处理
- 紧急情况应对流程
- 安全操作规程
- 联系方式和备件信息

---
*此文档基于最新技术标准编制，请定期更新*`;
  };

  // 根据主题确定分类
  const getCategoryByTopic = (topic: string): string => {
    if (topic.includes('机器人') || topic.includes('机构') || topic.includes('举升')) return '机械故障';
    if (topic.includes('电池') || topic.includes('BMS') || topic.includes('充电')) return '电池系统';
    if (topic.includes('通信') || topic.includes('控制') || topic.includes('监控')) return '电气故障';
    if (topic.includes('消防') || topic.includes('安全') || topic.includes('环境')) return '安全系统';
    return '维护保养';
  };

  // 根据主题生成标签
  const generateTagsByTopic = (topic: string): string[] => {
    const tags = [topic.split('系统')[0], '故障处理', '维护'];
    if (topic.includes('检测')) tags.push('检测方法');
    if (topic.includes('安全')) tags.push('安全规程');
    if (topic.includes('通信')) tags.push('通信协议');
    return tags;
  };

  // 获取相关文档
  const getRelatedDocuments = (topic: string): string[] => {
    return ['系统概述', '预防性维护', '安全操作规程'];
  };

  // 加载已保存的知识库
  useEffect(() => {
    const saved = localStorage.getItem('knowledgeBase');
    if (saved) {
      const parsedDocs = JSON.parse(saved);
      setDocuments(parsedDocs);
      if (onDocumentsChange) {
        onDocumentsChange(parsedDocs);
      }
    }
  }, [onDocumentsChange]);

  const handleViewDocument = (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setViewDialogOpen(true);
  };

  const downloadDocument = (doc: KnowledgeDocument) => {
    const element = document.createElement('a');
    const file = new Blob([doc.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon />
          电车换电故障排除知识库
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<GenerateIcon />}
            onClick={generateKnowledgeBase}
            disabled={generating}
            sx={{ backgroundColor: '#FF6B35' }}
          >
            {generating ? '生成中...' : '生成知识库'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<KnowledgeGraphIcon />}
            onClick={onShowKnowledgeGraph}
            disabled={documents.length === 0}
          >
            查看知识图谱
          </Button>
        </Box>
      </Box>

      {generating && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            正在生成知识库文档... 预计生成20个专业文档
          </Alert>
          <LinearProgress />
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        知识库统计: {documents.length} 个文档
      </Typography>

      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid item xs={12} md={6} lg={4} key={doc.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {doc.title}
                </Typography>
                
                <Chip 
                  label={doc.category} 
                  size="small" 
                  sx={{ mb: 1, backgroundColor: '#FF6B35', color: 'white' }}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {new Date(doc.createdAt).toLocaleDateString('zh-CN')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {doc.tags.slice(0, 3).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
              
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => handleViewDocument(doc)}
                  title="查看文档"
                >
                  <ViewIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => downloadDocument(doc)}
                  title="下载文档"
                >
                  <DownloadIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 文档查看对话框 */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedDoc?.title}</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            value={selectedDoc?.content || ''}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
            sx={{ mt: 1 }}
            minRows={20}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>关闭</Button>
          {selectedDoc && (
            <Button 
              onClick={() => downloadDocument(selectedDoc)}
              startIcon={<DownloadIcon />}
            >
              下载
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeBase;