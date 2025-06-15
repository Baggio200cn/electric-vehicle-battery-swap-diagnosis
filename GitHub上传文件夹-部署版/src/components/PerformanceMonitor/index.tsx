import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Speed as CpuIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface PerformanceMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    usage: number;
    readSpeed: number;
    writeSpeed: number;
  };
  network: {
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
    packetsLost: number;
  };
  system: {
    uptime: number;
    processes: number;
    threads: number;
    loadAverage: number[];
  };
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  message: string;
  timestamp: Date;
  threshold: number;
  currentValue: number;
}

interface PerformanceMonitorProps {
  open: boolean;
  onClose: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: { usage: 0, cores: 8, temperature: 45, frequency: 2.4 },
    memory: { used: 0, total: 16384, available: 0, usage: 0 },
    disk: { used: 0, total: 512000, usage: 0, readSpeed: 0, writeSpeed: 0 },
    network: { downloadSpeed: 0, uploadSpeed: 0, latency: 0, packetsLost: 0 },
    system: { uptime: 0, processes: 0, threads: 0, loadAverage: [0, 0, 0] }
  });
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(1000);
  const [showSettings, setShowSettings] = useState(false);
  const [thresholds, setThresholds] = useState({
    cpu: 80,
    memory: 85,
    disk: 90,
    temperature: 70
  });

  const intervalRef = useRef<NodeJS.Timeout>();
  const historyRef = useRef<PerformanceMetrics[]>([]);

  // 模拟性能数据生成
  const generateMetrics = (): PerformanceMetrics => {
    const baseTime = Date.now();
    return {
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        temperature: 40 + Math.random() * 30,
        frequency: 2.0 + Math.random() * 1.5
      },
      memory: {
        used: 8192 + Math.random() * 4096,
        total: 16384,
        available: 0,
        usage: 0
      },
      disk: {
        used: 256000 + Math.random() * 100000,
        total: 512000,
        usage: 0,
        readSpeed: Math.random() * 200,
        writeSpeed: Math.random() * 150
      },
      network: {
        downloadSpeed: Math.random() * 100,
        uploadSpeed: Math.random() * 50,
        latency: 10 + Math.random() * 40,
        packetsLost: Math.random() * 0.1
      },
      system: {
        uptime: baseTime,
        processes: 150 + Math.floor(Math.random() * 50),
        threads: 800 + Math.floor(Math.random() * 200),
        loadAverage: [
          Math.random() * 4,
          Math.random() * 4,
          Math.random() * 4
        ]
      }
    };
  };

  // 更新性能指标
  const updateMetrics = () => {
    const newMetrics = generateMetrics();
    
    // 计算衍生指标
    newMetrics.memory.available = newMetrics.memory.total - newMetrics.memory.used;
    newMetrics.memory.usage = (newMetrics.memory.used / newMetrics.memory.total) * 100;
    newMetrics.disk.usage = (newMetrics.disk.used / newMetrics.disk.total) * 100;

    setMetrics(newMetrics);
    
    // 保存历史数据
    historyRef.current.push(newMetrics);
    if (historyRef.current.length > 60) {
      historyRef.current.shift();
    }

    // 检查阈值并生成警报
    checkThresholds(newMetrics);
  };

  // 检查阈值
  const checkThresholds = (currentMetrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    if (currentMetrics.cpu.usage > thresholds.cpu) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'warning',
        metric: 'CPU',
        message: `CPU使用率过高: ${currentMetrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date(),
        threshold: thresholds.cpu,
        currentValue: currentMetrics.cpu.usage
      });
    }

    if (currentMetrics.memory.usage > thresholds.memory) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        metric: '内存',
        message: `内存使用率过高: ${currentMetrics.memory.usage.toFixed(1)}%`,
        timestamp: new Date(),
        threshold: thresholds.memory,
        currentValue: currentMetrics.memory.usage
      });
    }

    if (currentMetrics.disk.usage > thresholds.disk) {
      newAlerts.push({
        id: `disk-${Date.now()}`,
        type: 'error',
        metric: '磁盘',
        message: `磁盘空间不足: ${currentMetrics.disk.usage.toFixed(1)}%`,
        timestamp: new Date(),
        threshold: thresholds.disk,
        currentValue: currentMetrics.disk.usage
      });
    }

    if (currentMetrics.cpu.temperature > thresholds.temperature) {
      newAlerts.push({
        id: `temp-${Date.now()}`,
        type: 'error',
        metric: '温度',
        message: `CPU温度过高: ${currentMetrics.cpu.temperature.toFixed(1)}°C`,
        timestamp: new Date(),
        threshold: thresholds.temperature,
        currentValue: currentMetrics.cpu.temperature
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));
    }
  };

  // 启动监控
  useEffect(() => {
    if (isMonitoring && open) {
      intervalRef.current = setInterval(updateMetrics, refreshInterval);
      updateMetrics(); // 立即更新一次
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring, refreshInterval, open]);

  // 格式化字节
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化运行时间
  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  // 获取状态颜色
  const getStatusColor = (value: number, threshold: number) => {
    if (value > threshold) return 'error';
    if (value > threshold * 0.8) return 'warning';
    return 'success';
  };

  // 渲染概览标签页
  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CpuIcon sx={{ mr: 1 }} />
              <Typography variant="h6">CPU</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">使用率</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {metrics.cpu.usage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.cpu.usage}
                color={getStatusColor(metrics.cpu.usage, thresholds.cpu)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  核心数: {metrics.cpu.cores}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  频率: {metrics.cpu.frequency.toFixed(1)} GHz
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  温度: {metrics.cpu.temperature.toFixed(1)}°C
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MemoryIcon sx={{ mr: 1 }} />
              <Typography variant="h6">内存</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">使用率</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {metrics.memory.usage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.memory.usage}
                color={getStatusColor(metrics.memory.usage, thresholds.memory)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  已用: {formatBytes(metrics.memory.used * 1024 * 1024)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  总计: {formatBytes(metrics.memory.total * 1024 * 1024)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  可用: {formatBytes(metrics.memory.available * 1024 * 1024)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorageIcon sx={{ mr: 1 }} />
              <Typography variant="h6">磁盘</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">使用率</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {metrics.disk.usage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.disk.usage}
                color={getStatusColor(metrics.disk.usage, thresholds.disk)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  已用: {formatBytes(metrics.disk.used * 1024 * 1024)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  总计: {formatBytes(metrics.disk.total * 1024 * 1024)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  读取: {metrics.disk.readSpeed.toFixed(1)} MB/s
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  写入: {metrics.disk.writeSpeed.toFixed(1)} MB/s
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NetworkIcon sx={{ mr: 1 }} />
              <Typography variant="h6">网络</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  下载: {metrics.network.downloadSpeed.toFixed(1)} Mbps
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  上传: {metrics.network.uploadSpeed.toFixed(1)} Mbps
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  延迟: {metrics.network.latency.toFixed(0)} ms
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  丢包率: {metrics.network.packetsLost.toFixed(2)}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 渲染警报标签页
  const renderAlerts = () => (
    <Box>
      {alerts.length === 0 ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography>系统运行正常，暂无性能警报</Typography>
        </Alert>
      ) : (
        <List>
          {alerts.map((alert) => (
            <ListItem key={alert.id}>
              <ListItemIcon>
                {alert.type === 'error' ? (
                  <ErrorIcon color="error" />
                ) : alert.type === 'warning' ? (
                  <WarningIcon color="warning" />
                ) : (
                  <CheckIcon color="info" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={alert.message}
                secondary={`${alert.timestamp.toLocaleTimeString()} - 阈值: ${alert.threshold}${
                  alert.metric === '温度' ? '°C' : '%'
                }`}
              />
              <Chip
                label={alert.metric}
                size="small"
                color={alert.type === 'error' ? 'error' : 'warning'}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon />
          <Typography variant="h6">性能监控</Typography>
          <Chip
            label={isMonitoring ? '监控中' : '已暂停'}
            color={isMonitoring ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="刷新">
            <IconButton onClick={updateMetrics}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="设置">
            <IconButton onClick={() => setShowSettings(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="系统概览" />
            <Tab label={`性能警报 (${alerts.length})`} />
            <Tab label="系统信息" />
          </Tabs>
        </Box>

        {activeTab === 0 && renderOverview()}
        {activeTab === 1 && renderAlerts()}
        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>系统信息</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    运行时间: {formatUptime(Date.now() - metrics.system.uptime)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    进程数: {metrics.system.processes}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    线程数: {metrics.system.threads}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    负载均衡: {metrics.system.loadAverage.map(l => l.toFixed(2)).join(', ')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <FormControlLabel
          control={
            <Switch
              checked={isMonitoring}
              onChange={(e) => setIsMonitoring(e.target.checked)}
            />
          }
          label="实时监控"
        />
        <Button onClick={() => setAlerts([])}>清空警报</Button>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>

      {/* 设置对话框 */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
        <DialogTitle>监控设置</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>警报阈值</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">CPU使用率 (%)</Typography>
                <input
                  type="number"
                  value={thresholds.cpu}
                  onChange={(e) => setThresholds(prev => ({ ...prev, cpu: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">内存使用率 (%)</Typography>
                <input
                  type="number"
                  value={thresholds.memory}
                  onChange={(e) => setThresholds(prev => ({ ...prev, memory: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">磁盘使用率 (%)</Typography>
                <input
                  type="number"
                  value={thresholds.disk}
                  onChange={(e) => setThresholds(prev => ({ ...prev, disk: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">CPU温度 (°C)</Typography>
                <input
                  type="number"
                  value={thresholds.temperature}
                  onChange={(e) => setThresholds(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>取消</Button>
          <Button onClick={() => setShowSettings(false)} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default PerformanceMonitor; 