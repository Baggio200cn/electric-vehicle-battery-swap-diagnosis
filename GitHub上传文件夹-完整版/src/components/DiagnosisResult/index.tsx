import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Grid,
  Paper,
  Divider,
  LinearProgress
} from '@mui/material';

import { ExpandMore as ExpandMoreIcon, CheckCircle as CheckIcon, Warning as WarningIcon, Error as ErrorIcon, Analytics as AnalyticsIcon, Timeline as TimelineIcon, TrendingUp as TrendingUpIcon, Image as ImageIcon } from '@mui/icons-material';
import { 
  DiagnosisResult as DiagnosisResultType, 
  Statistics, 
  FrameAnalysis, 
  MultiImageAnalysis, 
  SingleImageAnalysis, 
  ImageAnalysis,
  RootCauseAnalysis, 
  PrioritizedSolution 
} from '../../types';

interface DiagnosisResultProps {
  result: DiagnosisResultType;
  statistics?: Statistics;
  frameAnalyses?: FrameAnalysis[];
  multiImageAnalysis?: MultiImageAnalysis | null;
  analysisType?: 'text' | 'video' | 'audio' | 'image' | 'multi-image';
}

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({
  result,
  statistics,
  frameAnalyses = [],
  multiImageAnalysis,
  analysisType = 'text'
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return '轻微';
      case 'medium': return '中等';
      case 'high': return '严重';
      default: return '未知';
    }
  };

  const getAnomalyIcon = (type: FrameAnalysis['anomalyType']) => {
    switch (type) {
      case 'vibration': return '📳';
      case 'noise': return '🔊';
      case 'visual': return '👁️';
      case 'normal': return '✅';
      default: return '❓';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnalysisTypeLabel = () => {
    switch (analysisType) {
      case 'video': return '视频分析';
      case 'audio': return '音频分析';
      case 'image': return '图片分析';
      case 'multi-image': return '多图片分析';
      default: return '文本分析';
    }
  };

  const getAnalysisIcon = () => {
    switch (analysisType) {
      case 'video': return '📹';
      case 'audio': return '🎤';
      case 'image': return '📷';
      case 'multi-image': return '📸';
      default: return '📝';
    }
  };

  // 计算异常分布
  const getAnomalyDistribution = () => {
    const distribution = frameAnalyses.reduce((acc, frame) => {
      acc[frame.anomalyType] = (acc[frame.anomalyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      percentage: (count / frameAnalyses.length * 100).toFixed(1)
    }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckIcon color="success" />;
      case 'medium': return <WarningIcon color="warning" />;
      case 'high': return <ErrorIcon color="error" />;
      default: return <CheckIcon />;
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

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      if (prev.includes(section)) {
        return prev.filter(s => s !== section);
      } else {
        return [...prev, section];
      }
    });
  };

  // 统计帧分析中的异常类型
  const getFrameAnomalyStats = () => {
    if (!frameAnalyses || frameAnalyses.length === 0) return [];
    
    const anomalyCounts = frameAnalyses.reduce((acc, frame) => {
      if (frame.anomalyType !== 'normal') {
        acc[frame.anomalyType] = (acc[frame.anomalyType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(anomalyCounts).map(([type, count]) => ({
      type,
      count: count,
      percentage: (count / frameAnalyses.length * 100).toFixed(1)
    }));
  };

  const getAnomalyTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      'vibration': '振动异常',
      'noise': '噪声异常',
      'visual': '视觉异常',
      'normal': '正常'
    };
    return typeMap[type] || type;
  };

  const anomalyStats = useMemo(() => getFrameAnomalyStats(), [frameAnalyses]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {getAnalysisIcon()} 诊断结果 - {getAnalysisTypeLabel()}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              故障类型
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip 
                label={result.faultType} 
                color="primary" 
                size="medium"
              />
              {result.severity && (
                <Chip 
                  label={getSeverityText(result.severity)} 
                  color={getSeverityColor(result.severity) as any}
                  size="small"
                />
              )}
              <Chip 
                label={`置信度: ${(result.confidence * 100).toFixed(1)}%`} 
                color="info" 
                variant="outlined"
              />
              {analysisType === 'video' && frameAnalyses.length > 0 && (
                <Chip 
                  label={`分析帧数: ${frameAnalyses.length}`} 
                  color="secondary" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {result.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                详细描述
              </Typography>
              <Alert severity="info">
                {result.description}
              </Alert>
            </Box>
          )}

          {/* 视频分析特有的详细依据 */}
          {analysisType === 'video' && frameAnalyses.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    📊 分析依据详情 ({frameAnalyses.length} 个关键帧)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        异常类型分布
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {getAnomalyDistribution().map(({ type, count, percentage }) => (
                          <Chip
                            key={type}
                            label={`${getAnomalyIcon(type as any)} ${type}: ${count} (${percentage}%)`}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        严重程度统计
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {['high', 'medium', 'low'].map(severity => {
                          const count = frameAnalyses.filter(f => f.severity === severity).length;
                          if (count === 0) return null;
                          return (
                            <Chip
                              key={severity}
                              label={`${getSeverityText(severity)}: ${count}`}
                              color={getSeverityColor(severity) as any}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    关键异常检测点
                  </Typography>
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {frameAnalyses
                      .filter(analysis => analysis.anomalyType !== 'normal')
                      .map((analysis, index) => (
                        <ListItem key={index} sx={{ py: 1 }}>
                          <Box 
                            sx={{ 
                              mr: 2, 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: getSeverityColor(analysis.severity) + '.main',
                              color: 'white',
                              fontSize: '1rem'
                            }}
                          >
                            {getAnomalyIcon(analysis.anomalyType)}
                          </Box>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2">
                                  {formatTime(analysis.timestamp)}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={`${(analysis.confidence * 100).toFixed(0)}%`}
                                  color={getSeverityColor(analysis.severity) as any}
                                />
                              </Box>
                            }
                            secondary={analysis.description}
                          />
                        </ListItem>
                      ))}
                  </List>
                  
                  {frameAnalyses.filter(f => f.anomalyType === 'normal').length > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      ✅ 正常帧数: {frameAnalyses.filter(f => f.anomalyType === 'normal').length}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              建议解决方案
            </Typography>
            <List>
              {result.solutions.map((solution, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={`${index + 1}. ${solution}`}
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {result.recommendations && result.recommendations.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                预防建议
              </Typography>
              <List>
                {result.recommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={`• ${recommendation}`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {statistics && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  分析统计
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`总帧数: ${statistics.totalFrames}`} 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`异常帧数: ${statistics.abnormalFrames}`} 
                    variant="outlined" 
                    color="warning"
                  />
                  <Chip 
                    label={`异常率: ${(statistics.abnormalRatio * 100).toFixed(1)}%`} 
                    variant="outlined" 
                    color="error"
                  />
                  {statistics.duration && (
                    <Chip 
                      label={`时长: ${statistics.duration.toFixed(1)}s`} 
                      variant="outlined" 
                    />
                  )}
                  {analysisType === 'video' && frameAnalyses.length > 0 && (
                    <Chip 
                      label={`平均置信度: ${(frameAnalyses.reduce((sum, f) => sum + f.confidence, 0) / frameAnalyses.length * 100).toFixed(1)}%`} 
                      variant="outlined" 
                      color="info"
                    />
                  )}
                </Box>
              </Box>
            </>
          )}

          {/* 多图片分析详情 */}
          {multiImageAnalysis && analysisType === 'multi-image' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                📊 多图片分析详情
              </Typography>
              
              {/* 总体概述 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  总体概述
                </Typography>
                <Typography variant="body1">
                  {multiImageAnalysis.overallSummary}
                </Typography>
              </Box>

              {/* 单图分析结果 */}
              <Typography variant="h6" gutterBottom>
                逐图详细分析
              </Typography>
              {multiImageAnalysis.individualAnalyses.map((analysis: SingleImageAnalysis, index: number) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ImageIcon />
                      <Typography variant="subtitle1">
                        图片 {index + 1}: {analysis.fileName}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${analysis.analysisResults.filter((r: ImageAnalysis) => r.anomalyType !== 'normal').length} 个异常`}
                        color={analysis.analysisResults.some((r: ImageAnalysis) => r.severity === 'high') ? 'error' : 
                               analysis.analysisResults.some((r: ImageAnalysis) => r.severity === 'medium') ? 'warning' : 'success'}
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
                          {analysis.primaryIssues.map((issue: string, issueIndex: number) => (
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
                          {analysis.recommendations.map((rec: string, recIndex: number) => (
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
              {multiImageAnalysis.rootCauseAnalysis.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    问题根源分析
                  </Typography>
                  {multiImageAnalysis.rootCauseAnalysis.map((rootCause: RootCauseAnalysis, index: number) => (
                    <Box key={index} sx={{ mb: 2 }}>
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
                      <Typography variant="body2">
                        {rootCause.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* 优先级解决方案 */}
              <Typography variant="h6" gutterBottom>
                优先级解决方案
              </Typography>
              {multiImageAnalysis.prioritizedSolutions.map((solution: PrioritizedSolution, index: number) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {solution.title}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={`优先级 ${solution.priority}`}
                    color={getPriorityColor(solution.priority) as any}
                    variant="filled"
                  />
                  <Chip 
                    size="small" 
                    label={`有效性 ${(solution.effectivenessScore * 100).toFixed(0)}%`}
                    color="success"
                    variant="outlined"
                  />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {solution.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip size="small" label={`成本: ${solution.estimatedCost}`} />
                    <Chip size="small" label={`时间: ${solution.timeToImplement}`} />
                    <Chip size="small" label={`解决 ${solution.affectedIssues.length} 个问题`} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* 视频帧分析详情 */}
          {frameAnalyses.length > 0 && analysisType === 'video' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                📈 视频帧分析详情
              </Typography>
              
              {/* 异常类型统计 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  异常类型分布
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(
                    frameAnalyses.reduce((acc, frame) => {
                      acc[frame.anomalyType] = (acc[frame.anomalyType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <Chip 
                      key={type} 
                      label={`${type}: ${count}帧`} 
                      size="small"
                      color={type === 'normal' ? 'success' : 'warning'}
                    />
                  ))}
                </Box>
              </Box>

              {/* 严重程度统计 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  严重程度分布
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(
                    frameAnalyses.reduce((acc, frame) => {
                      acc[frame.severity] = (acc[frame.severity] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([severity, count]) => (
                    <Chip 
                      key={severity} 
                      label={`${severity === 'high' ? '严重' : severity === 'medium' ? '中等' : '轻微'}: ${count}帧`} 
                      size="small"
                      color={getSeverityColor(severity as 'low' | 'medium' | 'high') as any}
                    />
                  ))}
                </Box>
              </Box>

              {/* 详细分析结果 */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimelineIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      详细帧分析结果 ({frameAnalyses.length}帧)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {frameAnalyses.map((frame, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  第 {frame.frameNumber} 帧 ({frame.timestamp.toFixed(2)}s)
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={frame.anomalyType}
                                  color={frame.anomalyType === 'normal' ? 'success' : 'warning'}
                                />
                                <Chip 
                                  size="small" 
                                  label={`${(frame.confidence * 100).toFixed(0)}%`}
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={frame.description}
                          />
                        </ListItem>
                        {index < frameAnalyses.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DiagnosisResult; 