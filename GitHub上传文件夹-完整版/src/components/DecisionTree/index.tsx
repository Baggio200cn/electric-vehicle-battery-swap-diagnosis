import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Timeline as DecisionTreeIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  RadioButtonUnchecked as NodeIcon,
  ArrowForward as ArrowIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as AIIcon,
  Lightbulb as SolutionIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as ConfidenceIcon
} from '@mui/icons-material';

interface DecisionNode {
  id: string;
  question: string;
  description?: string;
  options: DecisionOption[];
  confidence: number;
  isLeaf?: boolean;
  solution?: {
    title: string;
    steps: string[];
    severity: 'low' | 'medium' | 'high';
    estimatedTime: string;
  };
}

interface DecisionOption {
  id: string;
  label: string;
  value: string;
  nextNodeId?: string;
  confidence: number;
}

interface DecisionPath {
  nodeId: string;
  question: string;
  selectedOption: DecisionOption;
  confidence: number;
  timestamp: Date;
}

interface DecisionTreeProps {
  initialSymptoms?: string[];
  onDecisionComplete?: (path: DecisionPath[], solution: any) => void;
  onComplete?: (result: any) => void;
}

const DecisionTree: React.FC<DecisionTreeProps> = ({ 
  initialSymptoms = [], 
  onDecisionComplete,
  onComplete
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [decisionPath, setDecisionPath] = useState<DecisionPath[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showPathDialog, setShowPathDialog] = useState(false);
  const [overallConfidence, setOverallConfidence] = useState(1.0);

  // 决策树数据结构
  const decisionNodes: Record<string, DecisionNode> = {
    root: {
      id: 'root',
      question: '设备当前的主要症状是什么？',
      description: '请选择最符合当前设备状况的描述',
      confidence: 1.0,
      options: [
        {
          id: 'abnormal_sound',
          label: '异常声音',
          value: '设备发出异常声音',
          nextNodeId: 'sound_analysis',
          confidence: 0.9
        },
        {
          id: 'overheating',
          label: '设备过热',
          value: '设备温度异常升高',
          nextNodeId: 'temperature_analysis',
          confidence: 0.95
        },
        {
          id: 'vibration',
          label: '异常振动',
          value: '设备出现异常振动',
          nextNodeId: 'vibration_analysis',
          confidence: 0.85
        },
        {
          id: 'electrical_issue',
          label: '电气问题',
          value: '电气系统异常',
          nextNodeId: 'electrical_analysis',
          confidence: 0.8
        },
        {
          id: 'performance_drop',
          label: '性能下降',
          value: '设备性能明显下降',
          nextNodeId: 'performance_analysis',
          confidence: 0.75
        }
      ]
    },
    sound_analysis: {
      id: 'sound_analysis',
      question: '异常声音的特征是什么？',
      description: '请详细描述听到的声音类型',
      confidence: 0.9,
      options: [
        {
          id: 'grinding_sound',
          label: '磨擦声/刮擦声',
          value: '金属摩擦或刮擦声音',
          nextNodeId: 'bearing_check',
          confidence: 0.95
        },
        {
          id: 'clicking_sound',
          label: '咔嗒声/敲击声',
          value: '规律性的咔嗒或敲击声',
          nextNodeId: 'relay_check',
          confidence: 0.9
        },
        {
          id: 'humming_sound',
          label: '嗡嗡声/电流声',
          value: '持续的嗡嗡声或电流声',
          nextNodeId: 'motor_check',
          confidence: 0.85
        },
        {
          id: 'whistling_sound',
          label: '尖锐声/哨声',
          value: '高频尖锐声音',
          nextNodeId: 'pressure_check',
          confidence: 0.8
        }
      ]
    },
    bearing_check: {
      id: 'bearing_check',
      question: '磨擦声是否伴随振动？',
      description: '检查声音是否与设备振动同步',
      confidence: 0.95,
      options: [
        {
          id: 'with_vibration',
          label: '有振动',
          value: '磨擦声伴随明显振动',
          nextNodeId: 'bearing_fault_solution',
          confidence: 0.98
        },
        {
          id: 'no_vibration',
          label: '无振动',
          value: '只有声音，无明显振动',
          nextNodeId: 'lubrication_check',
          confidence: 0.85
        }
      ]
    },
    bearing_fault_solution: {
      id: 'bearing_fault_solution',
      question: '轴承故障诊断完成',
      description: '根据症状分析，确定为轴承故障',
      confidence: 0.98,
      isLeaf: true,
      options: [],
      solution: {
        title: '轴承故障',
        steps: [
          '立即停机，避免进一步损坏',
          '检查轴承润滑状况',
          '更换损坏的轴承',
          '检查轴承座和轴的配合',
          '重新装配并测试运行'
        ],
        severity: 'high',
        estimatedTime: '2-4小时'
      }
    },
    temperature_analysis: {
      id: 'temperature_analysis',
      question: '过热区域在哪里？',
      description: '确定设备过热的具体位置',
      confidence: 0.95,
      options: [
        {
          id: 'motor_hot',
          label: '电机过热',
          value: '电机外壳温度异常',
          nextNodeId: 'motor_overload_check',
          confidence: 0.9
        },
        {
          id: 'control_panel_hot',
          label: '控制面板过热',
          value: '控制柜或面板发热',
          nextNodeId: 'electrical_overload_check',
          confidence: 0.85
        },
        {
          id: 'bearing_hot',
          label: '轴承过热',
          value: '轴承部位温度过高',
          nextNodeId: 'bearing_lubrication_check',
          confidence: 0.95
        }
      ]
    },
    motor_overload_check: {
      id: 'motor_overload_check',
      question: '电机是否超负荷运行？',
      description: '检查电机负载和电流情况',
      confidence: 0.9,
      options: [
        {
          id: 'overloaded',
          label: '超负荷',
          value: '电机电流超过额定值',
          nextNodeId: 'motor_overload_solution',
          confidence: 0.95
        },
        {
          id: 'normal_load',
          label: '负荷正常',
          value: '电机负荷在正常范围',
          nextNodeId: 'motor_cooling_check',
          confidence: 0.8
        }
      ]
    },
    motor_overload_solution: {
      id: 'motor_overload_solution',
      question: '电机超负荷故障诊断完成',
      description: '确定为电机超负荷运行导致过热',
      confidence: 0.95,
      isLeaf: true,
      options: [],
      solution: {
        title: '电机超负荷故障',
        steps: [
          '立即减少负荷或停机',
          '检查传动系统是否卡滞',
          '清理电机散热片和风扇',
          '检查电机绕组绝缘',
          '调整负荷至额定范围内'
        ],
        severity: 'high',
        estimatedTime: '1-3小时'
      }
    }
  };

  // 获取当前节点
  const getCurrentNode = (): DecisionNode => {
    return decisionNodes[currentNodeId] || decisionNodes.root;
  };

  // 处理选项选择
  const handleOptionSelect = (option: DecisionOption) => {
    const currentNode = getCurrentNode();
    
    // 记录决策路径
    const pathEntry: DecisionPath = {
      nodeId: currentNodeId,
      question: currentNode.question,
      selectedOption: option,
      confidence: option.confidence,
      timestamp: new Date()
    };

    const newPath = [...decisionPath, pathEntry];
    setDecisionPath(newPath);

    // 更新整体置信度
    const newConfidence = overallConfidence * option.confidence;
    setOverallConfidence(newConfidence);

    // 检查是否到达叶子节点
    if (option.nextNodeId) {
      const nextNode = decisionNodes[option.nextNodeId];
      if (nextNode?.isLeaf) {
        setIsComplete(true);
        onDecisionComplete?.(newPath, nextNode.solution);
        // 调用 onComplete 回调
        onComplete?.({
          path: newPath,
          solution: nextNode.solution,
          confidence: newConfidence,
          completed: true
        });
      } else {
        setCurrentNodeId(option.nextNodeId);
      }
    }
  };

  // 重置决策树
  const resetDecisionTree = () => {
    setCurrentNodeId('root');
    setDecisionPath([]);
    setIsComplete(false);
    setOverallConfidence(1.0);
  };

  // 获取严重程度颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const currentNode = getCurrentNode();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DecisionTreeIcon color="primary" />
        智能决策推理系统
      </Typography>

      {/* 进度指示器 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">诊断进度</Typography>
            <Chip 
              label={`置信度: ${(overallConfidence * 100).toFixed(0)}%`}
              color="info"
              icon={<ConfidenceIcon />}
            />
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={(decisionPath.length / 5) * 100} 
            sx={{ mb: 1 }}
          />
          
          <Typography variant="body2" color="textSecondary">
            已完成 {decisionPath.length} 个决策步骤
          </Typography>
        </CardContent>
      </Card>

      {!isComplete ? (
        /* 决策问题卡片 */
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AIIcon color="primary" />
              <Typography variant="h6">
                步骤 {decisionPath.length + 1}
              </Typography>
            </Box>
            
            <Typography variant="h5" gutterBottom>
              {currentNode.question}
            </Typography>
            
            {currentNode.description && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {currentNode.description}
              </Typography>
            )}

            {/* 选项列表 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentNode.options.map((option) => (
                <Paper
                  key={option.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50'
                    }
                  }}
                  onClick={() => handleOptionSelect(option)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {option.label}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {option.value}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`${(option.confidence * 100).toFixed(0)}%`}
                        size="small"
                        color="info"
                      />
                      <ArrowIcon color="primary" />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : (
        /* 诊断结果卡片 */
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CompleteIcon color="success" />
              <Typography variant="h6" color="success.main">
                诊断完成
              </Typography>
            </Box>

            {currentNode.solution && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {currentNode.solution.title}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`严重程度: ${currentNode.solution.severity}`}
                    color={getSeverityColor(currentNode.solution.severity) as any}
                    icon={<WarningIcon />}
                  />
                  <Chip 
                    label={`预计用时: ${currentNode.solution.estimatedTime}`}
                    color="info"
                    icon={<InfoIcon />}
                  />
                  <Chip 
                    label={`整体置信度: ${(overallConfidence * 100).toFixed(0)}%`}
                    color="success"
                    icon={<ConfidenceIcon />}
                  />
                </Box>

                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SolutionIcon />
                      解决方案步骤
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {currentNode.solution.steps.map((step, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Chip label={index + 1} size="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowPathDialog(true)}
                    startIcon={<DecisionTreeIcon />}
                  >
                    查看决策路径
                  </Button>
                  <Button
                    variant="contained"
                    onClick={resetDecisionTree}
                    startIcon={<StartIcon />}
                  >
                    重新诊断
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* 当前决策路径显示 */}
      {decisionPath.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              当前决策路径
            </Typography>
            <Stepper orientation="vertical">
              {decisionPath.map((path, index) => (
                <Step key={path.nodeId} active={true} completed={true}>
                  <StepLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {path.question}
                      </Typography>
                      <Chip 
                        label={`${(path.confidence * 100).toFixed(0)}%`}
                        size="small"
                        color="success"
                      />
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="textSecondary">
                      选择: {path.selectedOption.label}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {path.timestamp.toLocaleTimeString()}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      {/* 决策路径详情对话框 */}
      <Dialog
        open={showPathDialog}
        onClose={() => setShowPathDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DecisionTreeIcon />
            完整决策路径
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            以下是完整的决策推理过程，展示了AI如何逐步分析并得出诊断结论。
          </Alert>
          
          {decisionPath.map((path, index) => (
            <Box key={path.nodeId} sx={{ mb: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={`步骤 ${index + 1}`} size="small" color="primary" />
                  <Chip 
                    label={`置信度: ${(path.confidence * 100).toFixed(0)}%`} 
                    size="small" 
                    color="info" 
                  />
                  <Typography variant="caption" color="textSecondary">
                    {path.timestamp.toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  问题: {path.question}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  回答: {path.selectedOption.label} - {path.selectedOption.value}
                </Typography>
              </Paper>
              
              {index < decisionPath.length - 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                  <Typography variant="body2" color="primary">↓</Typography>
                </Box>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPathDialog(false)}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DecisionTree; 