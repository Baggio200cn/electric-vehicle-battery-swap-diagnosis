import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  People as UsersIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Memory as MemoryIcon,
  Timer as TimerIcon,
  BugReport as BugIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  totalDiagnoses: number;
  successRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

const SystemDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.12,
    activeUsers: 127,
    totalDiagnoses: 1247,
    successRate: 87.3,
    memoryUsage: 68.5,
    cpuUsage: 34.2,
    diskUsage: 45.8,
    networkLatency: 12
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'alert-1',
      type: 'success',
      title: '系统更新完成',
      message: '智能诊断模块已成功更新到v2.1.3版本',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      resolved: true
    },
    {
      id: 'alert-2',
      type: 'warning',
      title: '内存使用率偏高',
      message: '当前内存使用率为68.5%，建议关注系统性能',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      resolved: false
    },
    {
      id: 'alert-3',
      type: 'info',
      title: '新用户注册',
      message: '今日新增用户15名，系统活跃度持续提升',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      resolved: false
    }
  ]);

  const [loading, setLoading] = useState(true);

  // 初始化数据
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);

    // 定期更新指标
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.max(100, prev.responseTime + (Math.random() - 0.5) * 50),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor((Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        networkLatency: Math.max(5, prev.networkLatency + (Math.random() - 0.5) * 5)
      }));
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // 获取状态颜色
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'success';
    if (value <= thresholds.warning) return 'warning';
    return 'error';
  };

  // 获取系统健康状态
  const getSystemHealth = () => {
    const healthScore = (
      (metrics.uptime / 100) * 0.3 +
      (Math.max(0, 100 - metrics.responseTime / 10) / 100) * 0.2 +
      (Math.max(0, 100 - metrics.errorRate * 10) / 100) * 0.2 +
      (metrics.successRate / 100) * 0.3
    ) * 100;

    if (healthScore >= 90) return { status: 'excellent', color: 'success', text: '优秀' };
    if (healthScore >= 80) return { status: 'good', color: 'info', text: '良好' };
    if (healthScore >= 70) return { status: 'fair', color: 'warning', text: '一般' };
    return { status: 'poor', color: 'error', text: '需要关注' };
  };

  const systemHealth = getSystemHealth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* 标题和系统状态 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DashboardIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                系统总览仪表板
              </Typography>
              <Chip 
                label={systemHealth.text} 
                color={systemHealth.color as any}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              实时监控系统性能、用户活动和诊断统计
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <VerifiedIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" color="white">系统健康度</Typography>
                </Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {getSystemHealth().status === 'excellent' ? '95.2%' : 
                   getSystemHealth().status === 'good' ? '85.7%' : 
                   getSystemHealth().status === 'fair' ? '75.3%' : '65.8%'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  综合评分
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 核心指标卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TimerIcon />
                </Avatar>
                <Typography variant="h6">系统可用性</Typography>
              </Box>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {metrics.uptime.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={metrics.uptime} 
                color="primary"
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                过去30天平均值
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <SpeedIcon />
                </Avatar>
                <Typography variant="h6">响应时间</Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {metrics.responseTime.toFixed(0)}ms
              </Typography>
              <Chip 
                label={metrics.responseTime < 300 ? '优秀' : metrics.responseTime < 500 ? '良好' : '需优化'}
                size="small"
                color={getStatusColor(metrics.responseTime, { good: 300, warning: 500 }) as any}
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                平均API响应时间
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <UsersIcon />
                </Avatar>
                <Typography variant="h6">活跃用户</Typography>
              </Box>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {metrics.activeUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                当前在线: {Math.floor(metrics.activeUsers * 0.3)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                今日活跃用户数
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AssessmentIcon />
                </Avatar>
                <Typography variant="h6">诊断成功率</Typography>
              </Box>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {metrics.successRate.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={metrics.successRate} 
                color="warning"
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                总诊断次数: {metrics.totalDiagnoses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 系统资源使用情况 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MemoryIcon />
                系统资源使用
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">CPU使用率</Typography>
                  <Typography variant="body2">{metrics.cpuUsage.toFixed(1)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.cpuUsage} 
                  color={getStatusColor(metrics.cpuUsage, { good: 50, warning: 80 }) as any}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">内存使用率</Typography>
                  <Typography variant="body2">{metrics.memoryUsage.toFixed(1)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.memoryUsage} 
                  color={getStatusColor(metrics.memoryUsage, { good: 60, warning: 80 }) as any}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">磁盘使用率</Typography>
                  <Typography variant="body2">{metrics.diskUsage.toFixed(1)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.diskUsage} 
                  color={getStatusColor(metrics.diskUsage, { good: 70, warning: 90 }) as any}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">网络延迟</Typography>
                  <Typography variant="body2">{metrics.networkLatency.toFixed(0)}ms</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, metrics.networkLatency * 2)} 
                  color={getStatusColor(metrics.networkLatency, { good: 20, warning: 50 }) as any}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugIcon />
                系统警报
              </Typography>
              
              <List dense>
                {alerts.slice(0, 4).map((alert) => (
                  <ListItem key={alert.id} divider>
                    <ListItemIcon>
                      {alert.type === 'error' ? <ErrorIcon color="error" /> :
                       alert.type === 'warning' ? <WarningIcon color="warning" /> :
                       alert.type === 'success' ? <CheckCircleIcon color="success" /> :
                       <InfoIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    {alert.resolved && (
                      <Chip label="已解决" size="small" color="success" variant="outlined" />
                    )}
                  </ListItem>
                ))}
              </List>

              {alerts.length > 4 && (
                <Button size="small" sx={{ mt: 1 }}>
                  查看全部警报 ({alerts.length})
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 性能趋势 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon />
            24小时性能趋势
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary">
                  {metrics.responseTime.toFixed(0)}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  当前响应时间
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="success.main">
                  {Math.floor(120 + Math.random() * 40)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  每分钟处理量
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="error.main">
                  {Math.floor(metrics.errorRate * 100)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  24小时错误总数
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography color="text.secondary">
              📊 性能趋势图表区域 - 可集成Chart.js或其他图表库
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemDashboard; 