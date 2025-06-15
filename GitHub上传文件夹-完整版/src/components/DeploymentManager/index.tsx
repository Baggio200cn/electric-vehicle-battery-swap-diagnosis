import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  CloudUpload as UploadIcon,
  BugReport as TestIcon,
  Rocket as DeployIcon,
  Timeline as MonitorIcon,
  People as UsersIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Feedback as FeedbackIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as RunIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface DeploymentConfig {
  repository: string;
  branch: string;
  buildCommand: string;
  deployCommand: string;
  environment: 'development' | 'staging' | 'production';
  autoDeployEnabled: boolean;
  testingEnabled: boolean;
  monitoringEnabled: boolean;
}

interface TestResult {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  timestamp: string;
  details: string;
  coverage?: number;
}

interface UserFeedback {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  category: 'bug' | 'feature' | 'improvement' | 'general';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface DeploymentHistory {
  id: string;
  version: string;
  environment: string;
  status: 'success' | 'failed' | 'in-progress';
  timestamp: string;
  duration: number;
  deployedBy: string;
  commitHash: string;
  changes: string[];
}

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkTraffic: number;
}

const DeploymentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    repository: 'https://github.com/user/electric-vehicle-diagnosis',
    branch: 'main',
    buildCommand: 'npm run build',
    deployCommand: 'npm run deploy',
    environment: 'development',
    autoDeployEnabled: true,
    testingEnabled: true,
    monitoringEnabled: true
  });
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistory[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.12,
    activeUsers: 127,
    memoryUsage: 68.5,
    cpuUsage: 34.2,
    diskUsage: 45.8,
    networkTraffic: 1.2
  });

  const [isDeploying, setIsDeploying] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);

  // 初始化数据
  useEffect(() => {
    initializeData();
    // 定期更新系统指标
    const interval = setInterval(updateSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeData = () => {
    // 初始化测试结果
    const initialTestResults: TestResult[] = [
      {
        id: 'test-1',
        name: '图像分析功能测试',
        type: 'integration',
        status: 'passed',
        duration: 2.3,
        timestamp: new Date().toISOString(),
        details: '所有图像分析功能正常工作',
        coverage: 95.2
      },
      {
        id: 'test-2',
        name: '视频处理性能测试',
        type: 'performance',
        status: 'passed',
        duration: 5.7,
        timestamp: new Date().toISOString(),
        details: '视频处理速度符合预期',
        coverage: 88.7
      },
      {
        id: 'test-3',
        name: '安全性测试',
        type: 'security',
        status: 'failed',
        duration: 1.8,
        timestamp: new Date().toISOString(),
        details: '发现潜在的XSS漏洞',
        coverage: 76.3
      },
      {
        id: 'test-4',
        name: 'API端点测试',
        type: 'unit',
        status: 'passed',
        duration: 0.9,
        timestamp: new Date().toISOString(),
        details: '所有API端点响应正常',
        coverage: 98.1
      }
    ];

    // 初始化用户反馈
    const initialUserFeedback: UserFeedback[] = [
      {
        id: 'feedback-1',
        userId: 'user-001',
        userName: '张工程师',
        rating: 5,
        comment: '系统非常好用，图像识别准确率很高，大大提高了我们的工作效率！',
        category: 'general',
        status: 'resolved',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        priority: 'low'
      },
      {
        id: 'feedback-2',
        userId: 'user-002',
        userName: '李技术员',
        rating: 4,
        comment: '整体不错，但是视频上传有时候会卡住，希望能优化一下',
        category: 'bug',
        status: 'in-progress',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        priority: 'medium'
      },
      {
        id: 'feedback-3',
        userId: 'user-003',
        userName: '王主管',
        rating: 4,
        comment: '建议增加批量处理功能，这样可以一次性处理多个文件',
        category: 'feature',
        status: 'open',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        priority: 'high'
      },
      {
        id: 'feedback-4',
        userId: 'user-004',
        userName: '陈操作员',
        rating: 3,
        comment: '界面有点复杂，新手不太容易上手，能否简化一下？',
        category: 'improvement',
        status: 'open',
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        priority: 'medium'
      }
    ];

    // 初始化部署历史
    const initialDeploymentHistory: DeploymentHistory[] = [
      {
        id: 'deploy-1',
        version: 'v2.1.3',
        environment: 'production',
        status: 'success',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        duration: 4.2,
        deployedBy: '系统管理员',
        commitHash: 'a1b2c3d4',
        changes: ['修复图像处理bug', '优化性能', '更新UI组件']
      },
      {
        id: 'deploy-2',
        version: 'v2.1.2',
        environment: 'staging',
        status: 'success',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        duration: 3.8,
        deployedBy: '开发团队',
        commitHash: 'e5f6g7h8',
        changes: ['添加新功能', '修复已知问题']
      },
      {
        id: 'deploy-3',
        version: 'v2.1.1',
        environment: 'production',
        status: 'failed',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        duration: 2.1,
        deployedBy: '系统管理员',
        commitHash: 'i9j0k1l2',
        changes: ['紧急修复', '安全更新']
      }
    ];

    setTestResults(initialTestResults);
    setUserFeedback(initialUserFeedback);
    setDeploymentHistory(initialDeploymentHistory);
  };

  // 更新系统指标
  const updateSystemMetrics = () => {
    setSystemMetrics(prev => ({
      uptime: Math.max(99.0, prev.uptime + (Math.random() - 0.5) * 0.1),
      responseTime: Math.max(100, prev.responseTime + (Math.random() - 0.5) * 50),
      errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 0.05),
      activeUsers: Math.max(0, prev.activeUsers + Math.floor((Math.random() - 0.5) * 20)),
      memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 10)),
      cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 15)),
      diskUsage: Math.max(0, Math.min(100, prev.diskUsage + (Math.random() - 0.5) * 2)),
      networkTraffic: Math.max(0, prev.networkTraffic + (Math.random() - 0.5) * 0.5)
    }));
  };

  // 开始部署
  const startDeployment = async () => {
    setIsDeploying(true);
    setDeploymentProgress(0);

    // 模拟部署过程
    const steps = [
      '准备部署环境...',
      '拉取最新代码...',
      '安装依赖...',
      '运行测试...',
      '构建应用...',
      '部署到服务器...',
      '验证部署...',
      '完成部署'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeploymentProgress(((i + 1) / steps.length) * 100);
    }

    // 添加新的部署记录
    const newDeployment: DeploymentHistory = {
      id: `deploy-${Date.now()}`,
      version: `v2.1.${deploymentHistory.length + 4}`,
      environment: deploymentConfig.environment,
      status: 'success',
      timestamp: new Date().toISOString(),
      duration: 8.0,
      deployedBy: '当前用户',
      commitHash: Math.random().toString(36).substr(2, 8),
      changes: ['功能更新', '性能优化', 'Bug修复']
    };

    setDeploymentHistory(prev => [newDeployment, ...prev]);
    setIsDeploying(false);
    setDeploymentProgress(0);
  };

  // 运行测试
  const runTests = async () => {
    setIsTesting(true);

    // 模拟测试过程
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 更新测试结果
    const newTestResult: TestResult = {
      id: `test-${Date.now()}`,
      name: '完整系统测试',
      type: 'e2e',
      status: 'passed',
      duration: 12.5,
      timestamp: new Date().toISOString(),
      details: '端到端测试全部通过',
      coverage: 92.8
    };

    setTestResults(prev => [newTestResult, ...prev]);
    setIsTesting(false);
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'passed':
      case 'resolved':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      case 'running':
      case 'in-progress':
        return 'warning';
      case 'pending':
      case 'open':
        return 'info';
      default:
        return 'default';
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* 标题和状态面板 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DeployIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                部署管理中心
              </Typography>
              <Badge badgeContent={isDeploying ? '部署中' : '就绪'} color={isDeploying ? 'warning' : 'success'}>
                <GitHubIcon sx={{ fontSize: 32 }} />
              </Badge>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              自动化部署、测试管理、用户反馈收集和系统监控
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MonitorIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" color="white">系统状态</Typography>
                </Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {systemMetrics.uptime.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  系统可用性
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: systemMetrics.uptime > 99 ? '#4caf50' : '#ff9800',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {systemMetrics.activeUsers} 活跃用户
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 功能标签页 */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<DeployIcon />} label="部署管理" />
          <Tab icon={<TestIcon />} label="测试中心" />
          <Tab icon={<FeedbackIcon />} label="用户反馈" />
          <Tab icon={<MonitorIcon />} label="系统监控" />
        </Tabs>

        {/* 部署管理 */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* 快速操作 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<DeployIcon />}
                    onClick={startDeployment}
                    disabled={isDeploying}
                    size="large"
                  >
                    {isDeploying ? '部署中...' : '开始部署'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TestIcon />}
                    onClick={runTests}
                    disabled={isTesting}
                  >
                    {isTesting ? '测试中...' : '运行测试'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GitHubIcon />}
                    onClick={() => window.open(deploymentConfig.repository, '_blank')}
                  >
                    查看代码
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setShowConfigDialog(true)}
                  >
                    配置
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      当前环境
                    </Typography>
                    <Chip 
                      label={deploymentConfig.environment.toUpperCase()} 
                      color={deploymentConfig.environment === 'production' ? 'error' : 
                             deploymentConfig.environment === 'staging' ? 'warning' : 'info'}
                      size="medium"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 部署进度 */}
            {isDeploying && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    部署进度
                  </Typography>
                  <LinearProgress variant="determinate" value={deploymentProgress} sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {deploymentProgress.toFixed(0)}% 完成
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* 部署历史 */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  部署历史
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>版本</TableCell>
                        <TableCell>环境</TableCell>
                        <TableCell>状态</TableCell>
                        <TableCell>部署时间</TableCell>
                        <TableCell>持续时间</TableCell>
                        <TableCell>部署者</TableCell>
                        <TableCell>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deploymentHistory.map((deployment) => (
                        <TableRow key={deployment.id}>
                          <TableCell>{deployment.version}</TableCell>
                          <TableCell>
                            <Chip 
                              label={deployment.environment} 
                              size="small"
                              color={deployment.environment === 'production' ? 'error' : 
                                     deployment.environment === 'staging' ? 'warning' : 'info'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={deployment.status} 
                              size="small"
                              color={getStatusColor(deployment.status) as any}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(deployment.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{deployment.duration}分钟</TableCell>
                          <TableCell>{deployment.deployedBy}</TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 测试中心 */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            {/* 测试统计 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {testResults.filter(t => t.status === 'passed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      通过测试
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {testResults.filter(t => t.status === 'failed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      失败测试
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {(testResults.reduce((sum, t) => sum + (t.coverage || 0), 0) / testResults.length).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      平均覆盖率
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {testResults.reduce((sum, t) => sum + t.duration, 0).toFixed(1)}s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      总测试时间
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 测试结果列表 */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    测试结果
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<RunIcon />}
                    onClick={runTests}
                    disabled={isTesting}
                  >
                    {isTesting ? '运行中...' : '运行所有测试'}
                  </Button>
                </Box>
                <List>
                  {testResults.map((test) => (
                    <ListItem key={test.id} divider>
                      <ListItemIcon>
                        {test.status === 'passed' ? <SuccessIcon color="success" /> :
                         test.status === 'failed' ? <ErrorIcon color="error" /> :
                         test.status === 'running' ? <CircularProgress size={24} /> :
                         <InfoIcon color="info" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {test.name}
                            </Typography>
                            <Chip label={test.type} size="small" variant="outlined" />
                            <Chip 
                              label={test.status} 
                              size="small" 
                              color={getStatusColor(test.status) as any}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {test.details}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              耗时: {test.duration}s | 覆盖率: {test.coverage}% | 
                              时间: {new Date(test.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 用户反馈 */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            {/* 反馈统计 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {userFeedback.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      总反馈数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {(userFeedback.reduce((sum, f) => sum + f.rating, 0) / userFeedback.length).toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      平均评分
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {userFeedback.filter(f => f.status === 'open').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      待处理
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {userFeedback.filter(f => f.priority === 'critical' || f.priority === 'high').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      高优先级
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 反馈列表 */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  用户反馈
                </Typography>
                <List>
                  {userFeedback.map((feedback) => (
                    <ListItem key={feedback.id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1">
                              {feedback.userName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {[...Array(5)].map((_, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    bgcolor: i < feedback.rating ? '#ffc107' : '#e0e0e0',
                                    borderRadius: '50%'
                                  }}
                                />
                              ))}
                            </Box>
                            <Chip 
                              label={feedback.category} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={feedback.priority} 
                              size="small" 
                              color={getPriorityColor(feedback.priority) as any}
                            />
                            <Chip 
                              label={feedback.status} 
                              size="small" 
                              color={getStatusColor(feedback.status) as any}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" paragraph>
                              {feedback.comment}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(feedback.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton 
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setShowFeedbackDialog(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 系统监控 */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            {/* 系统指标 */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      性能指标
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">CPU使用率</Typography>
                        <Typography variant="body2">{systemMetrics.cpuUsage.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={systemMetrics.cpuUsage} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">内存使用率</Typography>
                        <Typography variant="body2">{systemMetrics.memoryUsage.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={systemMetrics.memoryUsage} color="success" />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">磁盘使用率</Typography>
                        <Typography variant="body2">{systemMetrics.diskUsage.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={systemMetrics.diskUsage} color="warning" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      服务状态
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">系统可用性</Typography>
                        <Chip 
                          label={`${systemMetrics.uptime.toFixed(2)}%`} 
                          color="success" 
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">响应时间</Typography>
                        <Chip 
                          label={`${systemMetrics.responseTime.toFixed(0)}ms`} 
                          color={systemMetrics.responseTime < 300 ? 'success' : 'warning'} 
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">错误率</Typography>
                        <Chip 
                          label={`${systemMetrics.errorRate.toFixed(2)}%`} 
                          color={systemMetrics.errorRate < 1 ? 'success' : 'error'} 
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">活跃用户</Typography>
                        <Chip 
                          label={systemMetrics.activeUsers.toString()} 
                          color="info" 
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">网络流量</Typography>
                        <Chip 
                          label={`${systemMetrics.networkTraffic.toFixed(1)} GB/h`} 
                          color="primary" 
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* 配置对话框 */}
      <Dialog open={showConfigDialog} onClose={() => setShowConfigDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>部署配置</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Git仓库地址"
                value={deploymentConfig.repository}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, repository: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="分支"
                value={deploymentConfig.branch}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, branch: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>环境</InputLabel>
                <Select
                  value={deploymentConfig.environment}
                  onChange={(e) => setDeploymentConfig(prev => ({ ...prev, environment: e.target.value as any }))}
                  label="环境"
                >
                  <MenuItem value="development">开发环境</MenuItem>
                  <MenuItem value="staging">测试环境</MenuItem>
                  <MenuItem value="production">生产环境</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="构建命令"
                value={deploymentConfig.buildCommand}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, buildCommand: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="部署命令"
                value={deploymentConfig.deployCommand}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, deployCommand: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={deploymentConfig.autoDeployEnabled}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, autoDeployEnabled: e.target.checked }))}
                  />
                }
                label="启用自动部署"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={deploymentConfig.testingEnabled}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, testingEnabled: e.target.checked }))}
                  />
                }
                label="启用自动测试"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={deploymentConfig.monitoringEnabled}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, monitoringEnabled: e.target.checked }))}
                  />
                }
                label="启用系统监控"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfigDialog(false)}>
            取消
          </Button>
          <Button variant="contained" onClick={() => setShowConfigDialog(false)}>
            保存配置
          </Button>
        </DialogActions>
      </Dialog>

      {/* 反馈详情对话框 */}
      <Dialog open={showFeedbackDialog} onClose={() => setShowFeedbackDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>反馈详情</DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {selectedFeedback.userName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={selectedFeedback.category} color="primary" />
                    <Chip label={selectedFeedback.priority} color={getPriorityColor(selectedFeedback.priority) as any} />
                    <Chip label={selectedFeedback.status} color={getStatusColor(selectedFeedback.status) as any} />
                  </Box>
                  <Typography variant="body1" paragraph>
                    {selectedFeedback.comment}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    评分
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: i < selectedFeedback.rating ? '#ffc107' : '#e0e0e0',
                          borderRadius: '50%'
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    提交时间: {new Date(selectedFeedback.timestamp).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    用户ID: {selectedFeedback.userId}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedbackDialog(false)}>
            关闭
          </Button>
          <Button variant="contained">
            标记为已处理
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeploymentManager; 