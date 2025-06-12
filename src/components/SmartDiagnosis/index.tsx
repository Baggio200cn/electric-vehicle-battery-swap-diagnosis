import React, { useState, useEffect } from 'react';
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
  Grid
} from '@mui/material';
import {
  Psychology as DiagnosisIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Source as SourceIcon,
  Info as InfoIcon
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

interface DiagnosisResult {
  document: KnowledgeDocument;
  relevanceScore: number;
  matchedKeywords: string[];
  solutionSteps: string[];
  relatedDocuments: KnowledgeDocument[];
  sourceType: 'knowledge_base' | 'external_api';
}

interface SmartDiagnosisProps {
  documents: KnowledgeDocument[];
}

const SmartDiagnosis: React.FC<SmartDiagnosisProps> = ({ documents }) => {
  const [faultDescription, setFaultDescription] = useState('');
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // 故障关键词库
  const faultKeywords = {
    mechanical: ['机器人', '手臂', '传输', '升降', '机械', '卡顿', '异响', '磨损', '润滑', '齿轮'],
    electrical: ['电气', '控制', '传感器', '电源', '通信', 'E001', 'E002', 'E003', '故障码', '断电'],
    battery: ['电池', 'BMS', '充电', '电压', '电流', '温度', '均衡', '过充', '过放', '热失控'],
    safety: ['安全', '报警', '火灾', '烟雾', '气体', '泄漏', '光幕', '急停', '消防'],
    maintenance: ['维护', '保养', '检查', '清洁', '更换', '校准', '预防', '定期']
  };

  // 分析故障描述并提供解决方案
  const analyzeFault = async () => {
    if (!faultDescription.trim()) {
      return;
    }

    setAnalyzing(true);
    setDiagnosisResults([]);
    setAnalysisComplete(false);

    try {
      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      const results: DiagnosisResult[] = [];
      
      // 1. 基于知识库的匹配分析
      const knowledgeBaseResults = analyzeWithKnowledgeBase(faultDescription);
      results.push(...knowledgeBaseResults);

      // 2. 如果知识库覆盖不够，模拟外部API调用
      if (results.length === 0 || results[0].relevanceScore < 0.6) {
        const externalResults = await simulateExternalAPI(faultDescription);
        results.push(...externalResults);
      }

      // 按相关度排序
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setDiagnosisResults(results);
      setAnalysisComplete(true);

    } catch (error) {
      console.error('故障分析失败:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // 基于知识库的分析
  const analyzeWithKnowledgeBase = (description: string): DiagnosisResult[] => {
    const results: DiagnosisResult[] = [];
    const descriptionLower = description.toLowerCase();

    documents.forEach(doc => {
      let relevanceScore = 0;
      const matchedKeywords: string[] = [];

      // 1. 检查标题匹配
      if (doc.title.toLowerCase().includes(descriptionLower.substring(0, 10))) {
        relevanceScore += 0.4;
      }

      // 2. 检查标签匹配
      doc.tags.forEach(tag => {
        if (descriptionLower.includes(tag.toLowerCase())) {
          relevanceScore += 0.2;
          matchedKeywords.push(tag);
        }
      });

      // 3. 检查关键词匹配
      Object.entries(faultKeywords).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          if (descriptionLower.includes(keyword)) {
            relevanceScore += 0.1;
            matchedKeywords.push(keyword);
          }
        });
      });

      // 4. 检查内容匹配
      const contentWords = description.split(/\s+/);
      contentWords.forEach(word => {
        if (doc.content.toLowerCase().includes(word.toLowerCase()) && word.length > 2) {
          relevanceScore += 0.05;
        }
      });

      // 如果相关度足够高，添加到结果中
      if (relevanceScore > 0.3) {
        const solutionSteps = extractSolutionSteps(doc.content);
        const relatedDocs = getRelatedDocuments(doc, documents);

        results.push({
          document: doc,
          relevanceScore: Math.min(relevanceScore, 1.0),
          matchedKeywords: Array.from(new Set(matchedKeywords)),
          solutionSteps,
          relatedDocuments: relatedDocs,
          sourceType: 'knowledge_base'
        });
      }
    });

    return results;
  };

  // 模拟外部API调用
  const simulateExternalAPI = async (description: string): Promise<DiagnosisResult[]> => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 创建外部来源的解决方案
    const externalDoc: KnowledgeDocument = {
      id: 'external-solution',
      title: `针对"${description}"的外部解决方案`,
      content: generateExternalSolution(description),
      category: '外部资源',
      tags: ['外部API', '补充解决方案'],
      createdAt: new Date().toISOString(),
      relatedDocuments: []
    };

    return [{
      document: externalDoc,
      relevanceScore: 0.75,
      matchedKeywords: extractKeywordsFromDescription(description),
      solutionSteps: generateExternalSolutionSteps(description),
      relatedDocuments: [],
      sourceType: 'external_api'
    }];
  };

  // 生成外部解决方案内容
  const generateExternalSolution = (description: string): string => {
    return `# 基于外部专家系统的解决方案

## 问题分析
根据您描述的故障现象："${description}"，我们的外部专家系统提供以下分析和建议。

## 推荐解决步骤
1. **初步检查**
   - 确认设备安全状态
   - 记录当前故障现象
   - 检查相关警告指示

2. **系统诊断**
   - 运行设备自检程序
   - 查看系统日志记录
   - 检测关键参数状态

3. **故障定位**
   - 分析故障模式特征
   - 确定可能的故障源
   - 验证诊断结果

4. **解决方案实施**
   - 按照标准操作程序执行
   - 实时监控修复过程
   - 验证修复效果

## 预防措施
- 建立定期维护计划
- 设置预警监测机制
- 培训操作人员技能

---
*此解决方案来源于外部专家系统API，请结合实际情况使用*`;
  };

  // 生成外部解决方案步骤
  const generateExternalSolutionSteps = (description: string): string[] => {
    return [
      '确保设备处于安全状态，按下急停开关',
      '查看控制面板的故障代码和报警信息',
      '检查相关系统的电源和连接状态',
      '运行系统自诊断程序，获取详细故障信息',
      '根据故障代码查阅技术手册，确定具体问题',
      '按照标准维修程序进行故障排除',
      '完成修复后进行功能测试和安全检查',
      '记录故障现象、原因和解决方法',
      '制定预防措施，避免类似故障再次发生'
    ];
  };

  // 从描述中提取关键词
  const extractKeywordsFromDescription = (description: string): string[] => {
    const keywords: string[] = [];
    Object.values(faultKeywords).flat().forEach(keyword => {
      if (description.toLowerCase().includes(keyword)) {
        keywords.push(keyword);
      }
    });
    return Array.from(new Set(keywords));
  };

  // 从文档内容中提取解决步骤
  const extractSolutionSteps = (content: string): string[] => {
    const steps: string[] = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\./)) {
        steps.push(trimmed);
      } else if (trimmed.startsWith('- ') && trimmed.length > 5) {
        steps.push(trimmed.substring(2));
      }
    });

    return steps.slice(0, 8); // 最多返回8个步骤
  };

  // 获取相关文档
  const getRelatedDocuments = (doc: KnowledgeDocument, allDocs: KnowledgeDocument[]): KnowledgeDocument[] => {
    return allDocs
      .filter(d => d.id !== doc.id)
      .filter(d => 
        d.category === doc.category || 
        doc.tags.some(tag => d.tags.includes(tag)) ||
        doc.relatedDocuments.some(rel => d.title.includes(rel))
      )
      .slice(0, 3);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <DiagnosisIcon />
        智能故障诊断系统
      </Typography>

      {documents.length === 0 ? (
        <Alert severity="warning">
          请先生成知识库文档，然后才能使用智能诊断功能
        </Alert>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                描述您遇到的故障问题
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                placeholder="请详细描述故障现象，例如：换电机器人手臂动作缓慢，有异响，定位不准确..."
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={analyzeFault}
                disabled={analyzing || !faultDescription.trim()}
                sx={{ backgroundColor: '#FF6B35' }}
              >
                {analyzing ? '分析中...' : '开始诊断'}
              </Button>
            </CardContent>
          </Card>

          {analyzing && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  正在分析故障...
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  1. 搜索知识库中的相关文档<br/>
                  2. 分析故障模式和关键词<br/>
                  3. 匹配最佳解决方案<br/>
                  4. 如需要，调用外部专家系统
                </Typography>
              </CardContent>
            </Card>
          )}

          {analysisComplete && diagnosisResults.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                诊断结果 ({diagnosisResults.length} 个解决方案)
              </Typography>

              {diagnosisResults.map((result, index) => (
                <Accordion key={result.document.id} defaultExpanded={index === 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {result.sourceType === 'knowledge_base' ? (
                          <CheckIcon color="success" />
                        ) : (
                          <WarningIcon color="warning" />
                        )}
                        <Typography variant="h6">
                          {result.document.title}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          icon={<SourceIcon />}
                          label={result.sourceType === 'knowledge_base' ? '知识库' : '外部API'}
                          color={result.sourceType === 'knowledge_base' ? 'success' : 'warning'}
                          size="small"
                        />
                        <Rating 
                          value={result.relevanceScore * 5} 
                          precision={0.1} 
                          size="small" 
                          readOnly 
                        />
                        <Typography variant="body2" color="text.secondary">
                          相关度: {(result.relevanceScore * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* 匹配的关键词 */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          匹配关键词
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {result.matchedKeywords.map(keyword => (
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
                          {result.solutionSteps.map((step, stepIndex) => (
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

                      {/* 相关文档 */}
                      {result.relatedDocuments.length > 0 && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle1" gutterBottom>
                            相关文档
                          </Typography>
                          {result.relatedDocuments.map(relatedDoc => (
                            <Card key={relatedDoc.id} variant="outlined" sx={{ mb: 1 }}>
                              <CardContent sx={{ p: 1.5 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {relatedDoc.title}
                                </Typography>
                                <Chip 
                                  label={relatedDoc.category} 
                                  size="small" 
                                  sx={{ mt: 0.5 }}
                                />
                              </CardContent>
                            </Card>
                          ))}
                        </Grid>
                      )}

                      {/* 信息来源标注 */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Alert 
                          severity={result.sourceType === 'knowledge_base' ? 'success' : 'info'}
                          icon={<InfoIcon />}
                        >
                          <Typography variant="body2">
                            <strong>信息来源：</strong>
                            {result.sourceType === 'knowledge_base' 
                              ? '本地知识库 - 基于已验证的专业文档'
                              : '外部专家系统API - 由于知识库覆盖不足，调用外部资源补充'}
                          </Typography>
                        </Alert>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {analysisComplete && diagnosisResults.length === 0 && (
            <Alert severity="error">
              抱歉，无法找到与您描述的故障相关的解决方案。请尝试：
              <br />• 更详细地描述故障现象
              <br />• 包含具体的错误代码或警告信息  
              <br />• 说明故障发生的具体环境和操作
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default SmartDiagnosis;