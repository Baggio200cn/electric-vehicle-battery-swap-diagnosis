import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  FormControlLabel,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface DecisionNode {
  id: string;
  question: string;
  condition: string;
  yesAction: DecisionNode | string;
  noAction: DecisionNode | string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface DecisionTreeProps {
  onComplete: (result: DiagnosisResult) => void;
}

interface DiagnosisResult {
  path: string[];
  solution: string;
  confidence: number;
  category: string;
}

const DecisionTree: React.FC<DecisionTreeProps> = ({ onComplete }) => {
  const [currentNode, setCurrentNode] = useState<DecisionNode | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  // 电车换电故障决策树数据
  const decisionTreeData: DecisionNode = {
    id: 'root',
    question: '故障排除开始',
    condition: '是否存在明显的物理损坏？',
    priority: 'high',
    category: '初始检查',
    yesAction: {
      id: 'physical-damage',
      question: '物理损坏检查',
      condition: '连接器是否有明显变形或烧毁痕迹？',
      priority: 'high',
      category: '硬件故障',
      yesAction: '立即停止操作，更换损坏的连接器组件，联系维修团队进行深度检查',
      noAction: {
        id: 'mechanical-check',
        question: '机械系统检查',
        condition: '换电机械臂动作是否正常？',
        priority: 'medium',
        category: '机械故障',
        yesAction: '检查电池锁止机构，清洁导轨，重新校准位置传感器',
        noAction: '检查机械臂驱动系统，验证电机和传动装置工作状态'
      }
    },
    noAction: {
      id: 'electrical-check',
      question: '电气系统检查',
      condition: '系统能否正常启动和识别电池？',
      priority: 'high',
      category: '电气故障',
      yesAction: {
        id: 'communication-check',
        question: '通信系统检查',
        condition: '车辆与换电站通信是否正常？',
        priority: 'medium',
        category: '通信故障',
        yesAction: '检查CAN总线连接，验证通信协议版本兼容性',
        noAction: '重置通信模块，检查网络连接和信号强度'
      },
      noAction: {
        id: 'power-check',
        question: '电源系统检查',
        condition: '主电源指示灯是否正常？',
        priority: 'high',
        category: '电源故障',
        yesAction: '检查辅助电源，验证各子系统供电状态',
        noAction: '检查主电源线路，测试电压输出，检查熔断器状态'
      }
    }
  };

  const startDiagnosis = () => {
    setCurrentNode(decisionTreeData);
    setPath(['开始诊断']);
    setIsComplete(false);
    setResult(null);
  };

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (!currentNode) return;

    const newPath = [...path, `${currentNode.condition} - ${answer === 'yes' ? '是' : '否'}`];
    setPath(newPath);

    const nextStep = answer === 'yes' ? currentNode.yesAction : currentNode.noAction;

    if (typeof nextStep === 'string') {
      // 到达解决方案
      const confidence = calculateConfidence(newPath.length);
      const finalResult: DiagnosisResult = {
        path: newPath,
        solution: nextStep,
        confidence,
        category: currentNode.category
      };
      
      setResult(finalResult);
      setIsComplete(true);
      onComplete(finalResult);
    } else {
      // 继续下一个节点
      setCurrentNode(nextStep);
    }
  };

  const calculateConfidence = (steps: number): number => {
    // 根据决策步骤数计算置信度
    const baseConfidence = 0.95;
    const stepPenalty = 0.05;
    return Math.max(0.6, baseConfidence - (steps - 1) * stepPenalty);
  };

  const reset = () => {
    setCurrentNode(null);
    setPath([]);
    setIsComplete(false);
    setResult(null);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ErrorIcon color="error" />;
      case 'medium': return <WarningIcon color="warning" />;
      case 'low': return <CheckIcon color="success" />;
      default: return <SettingsIcon />;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        电车换电故障决策树诊断
      </Typography>

      {!currentNode && !isComplete && (
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              结构化故障诊断
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              通过标准化的问答流程，快速定位常见故障并获得解决方案
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={startDiagnosis}
              sx={{ mt: 2 }}
            >
              开始诊断
            </Button>
          </CardContent>
        </Card>
      )}

      {currentNode && !isComplete && (
        <Box>
          {/* 进度指示 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              诊断进度: 第 {path.length} 步
            </Typography>
            <Chip 
              label={currentNode.category}
              color="primary"
              size="small"
              sx={{ mb: 2 }}
            />
          </Box>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getPriorityIcon(currentNode.priority)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {currentNode.question}
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1">
                  {currentNode.condition}
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAnswer('yes')}
                  size="large"
                >
                  是
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleAnswer('no')}
                  size="large"
                >
                  否
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* 诊断路径 */}
          {path.length > 1 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  诊断路径:
                </Typography>
                <List dense>
                  {path.slice(1).map((step, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={step} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {isComplete && result && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckIcon color="success" sx={{ fontSize: 48 }} />
              <Typography variant="h5" gutterBottom>
                诊断完成
              </Typography>
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                推荐解决方案:
              </Typography>
              <Typography variant="body1">
                {result.solution}
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip 
                label={`故障类别: ${result.category}`}
                color="primary"
              />
              <Chip 
                label={`置信度: ${(result.confidence * 100).toFixed(1)}%`}
                color="success"
              />
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              完整诊断路径:
            </Typography>
            <List dense>
              {result.path.map((step, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Typography variant="body2" color="primary">
                      {index + 1}.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
              <Button variant="outlined" onClick={reset}>
                重新诊断
              </Button>
              <Button 
                variant="contained" 
                onClick={() => window.print()}
              >
                打印报告
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DecisionTree; 