import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import {
  AccountTree as GraphIcon,
  Info as InfoIcon,
  Close as CloseIcon
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

interface GraphNode {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  connections: string[];
}

interface GraphConnection {
  from: string;
  to: string;
  strength: number;
}

interface KnowledgeGraphProps {
  documents: KnowledgeDocument[];
  onClose?: () => void;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ documents, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    connections: GraphConnection[];
  }>({ nodes: [], connections: [] });

  // 分类颜色映射
  const categoryColors: { [key: string]: string } = {
    '系统概述': '#FF6B35',
    '机械故障': '#4CAF50', 
    '电气故障': '#2196F3',
    '安全系统': '#F44336',
    '电池系统': '#9C27B0',
    '维护保养': '#FF9800'
  };

  // 构建知识图谱数据
  useEffect(() => {
    if (documents.length === 0) return;

    const nodes: GraphNode[] = documents.map((doc, index) => {
      const angle = (index / documents.length) * 2 * Math.PI;
      const radius = Math.min(250, 150 + documents.length * 3);
      
      return {
        id: doc.id,
        label: doc.title.length > 15 ? doc.title.substring(0, 15) + '...' : doc.title,
        category: doc.category,
        x: 400 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
        connections: doc.relatedDocuments
      };
    });

    const connections: GraphConnection[] = [];
    
    // 简化连接逻辑，基于实际素材库内容
    for (let i = 0; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const doc1 = documents[i];
        const doc2 = documents[j];
        
        // 计算连接强度 - 简化算法
        let strength = 0;
        
        // 1. 相同分类的文档有基础连接
        if (doc1.category === doc2.category) {
          strength += 0.4;
        }
        
        // 2. 标签重叠 - 每个共同标签增加0.2强度
        const commonTags = doc1.tags.filter(tag => doc2.tags.includes(tag));
        strength += Math.min(commonTags.length * 0.2, 0.6);
        
        // 3. 明确的相关文档引用
        if (doc1.relatedDocuments.includes(doc2.id) || doc2.relatedDocuments.includes(doc1.id)) {
          strength += 0.5;
        }
        
        // 4. 内容关键词相似性 - 简化版本
        const keywords1 = extractSimpleKeywords(doc1.content);
        const keywords2 = extractSimpleKeywords(doc2.content);
        const commonKeywords = keywords1.filter(kw => keywords2.includes(kw));
        strength += Math.min(commonKeywords.length * 0.15, 0.3);
        
        // 只有当连接强度达到阈值时才创建连接，避免过于复杂的图谱
        if (strength >= 0.4) {
          connections.push({
            from: doc1.id,
            to: doc2.id,
            strength: Math.min(strength, 1.0)
          });
        }
      }
    }

    setGraphData({ nodes, connections });
  }, [documents]);

  // 简化的关键词提取
  const extractSimpleKeywords = (content: string): string[] => {
    const keywords = [
      '电池', '充电', '机械', '传感器', '控制', '安全', '故障', '检测',
      '维护', '温度', '电压', '电流', '通信', '报警', '监测', '诊断',
      '系统', '设备', '连接器', '液压', '驱动', '手臂', 'BMS', '环境'
    ];
    
    return keywords.filter(keyword => content.includes(keyword));
  };

  // 绘制知识图谱
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || graphData.nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制连接线
    graphData.connections.forEach(connection => {
      const fromNode = graphData.nodes.find(n => n.id === connection.from);
      const toNode = graphData.nodes.find(n => n.id === connection.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = `rgba(100, 100, 100, ${connection.strength * 0.6})`;
        ctx.lineWidth = connection.strength * 3;
        ctx.stroke();
      }
    });

    // 绘制节点
    graphData.nodes.forEach(node => {
      const color = categoryColors[node.category] || '#757575';
      
      // 绘制节点圆圈
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 绘制节点标签
      ctx.fillStyle = '#333333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 45);
    });

  }, [graphData, categoryColors]);

  // 处理画布点击
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 检查是否点击了某个节点
    const clickedNode = graphData.nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 25;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      setDetailDialogOpen(true);
    }
  };

  // 获取选中节点的文档详情
  const getSelectedDocument = (): KnowledgeDocument | null => {
    if (!selectedNode) return null;
    return documents.find(doc => doc.id === selectedNode.id) || null;
  };

  return (
    <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GraphIcon />
          电车换电故障排除知识图谱
        </Typography>
        {onClose && (
          <Button variant="outlined" onClick={onClose} startIcon={<CloseIcon />}>
            关闭
          </Button>
        )}
      </Box>

      {documents.length === 0 ? (
        <Alert severity="warning">
          请先生成知识库文档，然后才能查看知识图谱
        </Alert>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            点击图中的节点可以查看详细信息。节点颜色代表不同类别，连线粗细表示关联强度。
          </Alert>

          {/* 图例 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>图例</Typography>
              <Grid container spacing={2}>
                {Object.entries(categoryColors).map(([category, color]) => (
                  <Grid item key={category}>
                    <Chip
                      label={category}
                      sx={{
                        backgroundColor: color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* 知识图谱画布 */}
          <Card>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '800px'
                }}
                onClick={handleCanvasClick}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                知识图谱显示了 {graphData.nodes.length} 个知识文档和 {graphData.connections.length} 个关联关系
              </Typography>
            </CardContent>
          </Card>
        </>
      )}

      {/* 节点详情对话框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon />
          {getSelectedDocument()?.title || '文档详情'}
        </DialogTitle>
        <DialogContent>
          {getSelectedDocument() && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={getSelectedDocument()!.category}
                  sx={{
                    backgroundColor: categoryColors[getSelectedDocument()!.category],
                    color: 'white',
                    mb: 1
                  }}
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>标签</Typography>
              <Box sx={{ mb: 2 }}>
                {getSelectedDocument()!.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
              
              <Typography variant="h6" gutterBottom>相关文档</Typography>
              <Box sx={{ mb: 2 }}>
                {getSelectedDocument()!.relatedDocuments.map(rel => (
                  <Chip 
                    key={rel} 
                    label={rel} 
                    size="small" 
                    variant="outlined" 
                    sx={{ mr: 1, mb: 1 }} 
                  />
                ))}
              </Box>
              
              <Typography variant="h6" gutterBottom>关联节点</Typography>
              <Box>
                {graphData.connections
                  .filter(conn => conn.from === selectedNode?.id || conn.to === selectedNode?.id)
                  .map(conn => {
                    const relatedNodeId = conn.from === selectedNode?.id ? conn.to : conn.from;
                    const relatedNode = graphData.nodes.find(n => n.id === relatedNodeId);
                    const relatedDoc = documents.find(d => d.id === relatedNodeId);
                    
                    return relatedDoc ? (
                      <Chip
                        key={relatedNodeId}
                        label={`${relatedDoc.title} (强度: ${(conn.strength * 100).toFixed(0)}%)`}
                        size="small"
                        sx={{ 
                          mr: 1, 
                          mb: 1,
                          backgroundColor: categoryColors[relatedDoc.category],
                          color: 'white'
                        }}
                      />
                    ) : null;
                  })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeGraph; 