import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Insights as InsightsIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Speed as PerformanceIcon,
  BugReport as FaultIcon,
  BatteryFull as BatteryIcon,
  ElectricBolt as ElectricIcon,
  Build as MechanicalIcon,
  Security as SafetyIcon
} from '@mui/icons-material';

interface AnalyticsData {
  overview: {
    totalDiagnoses: number;
    successRate: number;
    avgResponseTime: number;
    activeIssues: number;
    resolvedIssues: number;
    criticalAlerts: number;
  };
  trends: {
    daily: Array<{ date: string; count: number; success: number }>;
    weekly: Array<{ week: string; count: number; success: number }>;
    monthly: Array<{ month: string; count: number; success: number }>;
  };
  faultDistribution: {
    electrical: number;
    mechanical: number;
    battery: number;
    safety: number;
    software: number;
  };
  performanceMetrics: {
    avgDiagnosisTime: number;
    accuracyRate: number;
    falsePositiveRate: number;
    systemUptime: number;
    userSatisfaction: number;
  };
  topIssues: Array<{
    id: string;
    type: string;
    description: string;
    frequency: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    trend: 'up' | 'down' | 'stable';
  }>;
  predictions: {
    nextWeekIssues: number;
    maintenanceNeeded: string[];
    riskAreas: string[];
    recommendations: string[];
  };
}

interface DataAnalyticsProps {
  open: boolean;
  onClose: () => void;
}

const DataAnalytics: React.FC<DataAnalyticsProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalDiagnoses: 1247,
      successRate: 94.2,
      avgResponseTime: 2.3,
      activeIssues: 12,
      resolvedIssues: 1089,
      criticalAlerts: 3
    },
    trends: {
      daily: [
        { date: '2024-01-08', count: 45, success: 42 },
        { date: '2024-01-09', count: 52, success: 49 },
        { date: '2024-01-10', count: 38, success: 36 },
        { date: '2024-01-11', count: 61, success: 58 },
        { date: '2024-01-12', count: 47, success: 44 },
        { date: '2024-01-13', count: 55, success: 52 },
        { date: '2024-01-14', count: 49, success: 46 }
      ],
      weekly: [],
      monthly: []
    },
    faultDistribution: {
      electrical: 35,
      mechanical: 28,
      battery: 22,
      safety: 10,
      software: 5
    },
    performanceMetrics: {
      avgDiagnosisTime: 2.3,
      accuracyRate: 94.2,
      falsePositiveRate: 3.1,
      systemUptime: 99.7,
      userSatisfaction: 4.6
    },
    topIssues: [
      {
        id: '1',
        type: '电气故障',
        description: '电池连接器接触不良',
        frequency: 23,
        severity: 'high',
        trend: 'up'
      },
      {
        id: '2',
        type: '机械故障',
        description: '机械手臂定位偏差',
        frequency: 18,
        severity: 'medium',
        trend: 'stable'
      },
      {
        id: '3',
        type: '电池故障',
        description: 'BMS通信异常',
        frequency: 15,
        severity: 'high',
        trend: 'down'
      }
    ],
    predictions: {
      nextWeekIssues: 67,
      maintenanceNeeded: ['机械手臂校准', '电池连接器清洁', '传感器检查'],
      riskAreas: ['电气系统', '机械传动'],
      recommendations: [
        '增加电气系统巡检频率',
        '优化机械手臂维护计划',
        '升级BMS固件版本'
      ]
    }
  });

  // 刷新数据
  const refreshData = async () => {
    setLoading(true);
    // 模拟数据加载
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && open) {
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, open]);

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="error" />;
      case 'down': return <TrendingDownIcon color="success" />;
      default: return <TimelineIcon color="info" />;
    }
  };

  // 获取严重程度颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  // 渲染概览标签页
  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* 关键指标卡片 */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Typography variant="h6">总诊断次数</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {analyticsData.overview.totalDiagnoses.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              本月累计
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <SuccessIcon />
              </Avatar>
              <Typography variant="h6">成功率</Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              {analyticsData.overview.successRate}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={analyticsData.overview.successRate} 
              color="success"
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <PerformanceIcon />
              </Avatar>
              <Typography variant="h6">平均响应时间</Typography>
            </Box>
            <Typography variant="h4" color="info.main">
              {analyticsData.overview.avgResponseTime}s
            </Typography>
            <Typography variant="body2" color="text.secondary">
              系统响应速度
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <WarningIcon />
              </Avatar>
              <Typography variant="h6">活跃问题</Typography>
            </Box>
            <Typography variant="h4" color="warning.main">
              {analyticsData.overview.activeIssues}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              待处理问题数
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 故障分布图 */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChartIcon />
              故障类型分布
            </Typography>
            <Box sx={{ mt: 2 }}>
              {Object.entries(analyticsData.faultDistribution).map(([type, count]) => {
                const total = Object.values(analyticsData.faultDistribution).reduce((a, b) => a + b, 0);
                const percentage = (count / total * 100).toFixed(1);
                const getIcon = () => {
                  switch (type) {
                    case 'electrical': return <ElectricIcon />;
                    case 'mechanical': return <MechanicalIcon />;
                    case 'battery': return <BatteryIcon />;
                    case 'safety': return <SafetyIcon />;
                    default: return <FaultIcon />;
                  }
                };
                const getLabel = () => {
                  switch (type) {
                    case 'electrical': return '电气故障';
                    case 'mechanical': return '机械故障';
                    case 'battery': return '电池故障';
                    case 'safety': return '安全故障';
                    default: return '软件故障';
                  }
                };
                
                return (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getIcon()}
                        <Typography variant="body2">{getLabel()}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {count} ({percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(percentage)} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 性能指标 */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PerformanceIcon />
              性能指标
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="平均诊断时间" 
                  secondary={`${analyticsData.performanceMetrics.avgDiagnosisTime}秒`}
                />
                <Chip 
                  label="优秀" 
                  color="success" 
                  size="small"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="准确率" 
                  secondary={`${analyticsData.performanceMetrics.accuracyRate}%`}
                />
                <Chip 
                  label="优秀" 
                  color="success" 
                  size="small"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="误报率" 
                  secondary={`${analyticsData.performanceMetrics.falsePositiveRate}%`}
                />
                <Chip 
                  label="良好" 
                  color="info" 
                  size="small"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="系统正常运行时间" 
                  secondary={`${analyticsData.performanceMetrics.systemUptime}%`}
                />
                <Chip 
                  label="优秀" 
                  color="success" 
                  size="small"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon />
          数据分析仪表板
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="自动刷新"
          />
          <Tooltip title="刷新数据">
            <IconButton onClick={refreshData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="导出报告">
            <IconButton onClick={() => setShowExportDialog(true)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="概览" icon={<AssessmentIcon />} />
            <Tab label="趋势分析" icon={<TimelineIcon />} />
            <Tab label="预测分析" icon={<InsightsIcon />} />
          </Tabs>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {activeTab === 0 && renderOverview()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataAnalytics; 