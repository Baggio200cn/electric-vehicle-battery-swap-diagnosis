import React, { useRef, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Alert, 
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Analytics as AnalysisIcon,
  VideoFile as VideoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

interface VideoInputProps {
  onVideoUpload: (file: File, frameAnalyses?: FrameAnalysis[]) => Promise<void>;
}

interface FrameAnalysis {
  timeStamp: number;
  description: string;
  confidence: number;
  anomalyType: 'normal' | 'vibration' | 'noise' | 'visual' | 'other';
  severity: 'low' | 'medium' | 'high';
}

// 视频验证结果接口
interface VideoValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    size: number;
    type: string;
    duration?: number;
    resolution?: { width: number; height: number };
    bitrate?: number;
    frameRate?: number;
  };
}

const VideoInput: React.FC<VideoInputProps> = ({ onVideoUpload }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [frameAnalyses, setFrameAnalyses] = useState<FrameAnalysis[]>([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<VideoValidationResult | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error'>('success');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const validationResult = await validateVideo(file);
      setValidationResult(validationResult);
      
      if (!validationResult.isValid) {
        setShowValidationDialog(true);
        showSnackbar('视频文件验证失败', 'error');
        return;
      }
      
      if (validationResult.warnings.length > 0) {
        setShowValidationDialog(true);
        showSnackbar('视频文件有警告信息', 'warning');
      } else {
        showSnackbar('视频文件验证通过！', 'success');
      }
      
      // 设置文件和预览
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
    } catch (error) {
      console.error('视频验证失败:', error);
      showSnackbar('视频验证过程中出现错误', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  const analyzeVideoFrame = (timeStamp: number): FrameAnalysis => {
    // 模拟视频帧分析 - 在实际应用中这里会调用真实的AI分析API
    const frameData = captureFrame();
    
    if (!frameData) {
      return {
        timeStamp,
        description: '无法获取帧数据',
        confidence: 0,
        anomalyType: 'other',
        severity: 'low'
      };
    }

    // 简单的像素分析示例（实际项目中会使用更复杂的算法）
    const pixels = frameData.data;
    let brightPixels = 0;
    let darkPixels = 0;
    let totalBrightness = 0;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      totalBrightness += brightness;
      
      if (brightness > 200) brightPixels++;
      if (brightness < 50) darkPixels++;
    }
    
    const avgBrightness = totalBrightness / (pixels.length / 4);
    const brightRatio = brightPixels / (pixels.length / 4);
    const darkRatio = darkPixels / (pixels.length / 4);
    
    // 基于简单分析决定异常类型
    let anomalyType: FrameAnalysis['anomalyType'] = 'normal';
    let description = '设备运行正常';
    let confidence = 0.8;
    let severity: FrameAnalysis['severity'] = 'low';
    
    if (brightRatio > 0.3) {
      anomalyType = 'visual';
      description = '检测到过度曝光或异常发光，可能存在电气故障';
      confidence = 0.75;
      severity = 'medium';
    } else if (darkRatio > 0.4) {
      anomalyType = 'visual';
      description = '画面过暗，可能设备照明不足或传感器故障';
      confidence = 0.70;
      severity = 'low';
    } else if (avgBrightness > 180) {
      anomalyType = 'visual';
      description = '检测到异常亮度变化，建议检查设备状态';
      confidence = 0.65;
      severity = 'low';
    } else if (Math.random() > 0.7) { // 随机模拟一些其他异常
      const anomalies = [
        { type: 'vibration' as const, desc: '检测到设备异常振动', conf: 0.85, sev: 'high' as const },
        { type: 'noise' as const, desc: '检测到异常噪声模式', conf: 0.78, sev: 'medium' as const },
        { type: 'visual' as const, desc: '检测到零件松动或磨损', conf: 0.82, sev: 'high' as const }
      ];
      const anomaly = anomalies[Math.floor(Math.random() * anomalies.length)];
      anomalyType = anomaly.type;
      description = anomaly.desc;
      confidence = anomaly.conf;
      severity = anomaly.sev;
    }
    
    return {
      timeStamp,
      description,
      confidence,
      anomalyType,
      severity
    };
  };

  const startVideoAnalysis = async () => {
    if (!selectedFile || !videoRef.current) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setFrameAnalyses([]);
    
    const video = videoRef.current;
    const duration = video.duration;
    const frameInterval = Math.max(1, duration / 20); // 分析20帧
    
    const analyses: FrameAnalysis[] = [];
    
    for (let i = 0; i < 20; i++) {
      const timeStamp = i * frameInterval;
      
      // 跳转到指定时间
      video.currentTime = timeStamp;
      
      // 等待视频跳转完成
      await new Promise(resolve => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve(void 0);
        };
        video.addEventListener('seeked', onSeeked);
      });
      
      // 分析当前帧
      const analysis = analyzeVideoFrame(timeStamp);
      analyses.push(analysis);
      
      setFrameAnalyses([...analyses]);
      setAnalysisProgress((i + 1) / 20 * 100);
      
      // 模拟分析延迟
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsAnalyzing(false);
    
    // 调用父组件的处理函数，传递帧分析数据
    try {
      await onVideoUpload(selectedFile, analyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : '视频分析失败');
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const getSeverityColor = (severity: FrameAnalysis['severity']) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
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

  // 视频验证配置
  const validationConfig = {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    minFileSize: 100 * 1024, // 100KB
    allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/mkv'],
    maxDuration: 300, // 5分钟
    minDuration: 1, // 1秒
    recommendedResolution: { width: 1920, height: 1080 },
    minResolution: { width: 320, height: 240 },
    maxResolution: { width: 3840, height: 2160 }
  };

  // 验证视频文件
  const validateVideo = async (file: File): Promise<VideoValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 1. 文件类型验证
    if (!validationConfig.allowedTypes.includes(file.type)) {
      errors.push(`不支持的视频格式: ${file.type}。支持的格式: MP4, AVI, MOV, WMV, WebM, MKV`);
    }

    // 2. 文件大小验证
    if (file.size > validationConfig.maxFileSize) {
      errors.push(`文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大允许: ${validationConfig.maxFileSize / 1024 / 1024}MB`);
    }
    
    if (file.size < validationConfig.minFileSize) {
      errors.push(`文件过小: ${(file.size / 1024).toFixed(1)}KB。最小要求: ${validationConfig.minFileSize / 1024}KB`);
    }

    // 3. 视频属性验证
    let duration: number | undefined;
    let resolution: { width: number; height: number } | undefined;
    let bitrate: number | undefined;
    let frameRate: number | undefined;

    try {
      const videoInfo = await getVideoInfo(file);
      duration = videoInfo.duration;
      resolution = videoInfo.resolution;
      bitrate = videoInfo.bitrate;
      frameRate = videoInfo.frameRate;

      // 时长验证
      if (duration !== undefined) {
        if (duration < validationConfig.minDuration) {
          errors.push(`视频时长过短: ${duration.toFixed(1)}秒。最小要求: ${validationConfig.minDuration}秒`);
        }
        
        if (duration > validationConfig.maxDuration) {
          warnings.push(`视频时长较长: ${Math.floor(duration / 60)}分${Math.floor(duration % 60)}秒。建议时长: ${validationConfig.maxDuration / 60}分钟以内`);
        }
      }

      // 分辨率验证
      if (resolution) {
        if (resolution.width < validationConfig.minResolution.width || 
            resolution.height < validationConfig.minResolution.height) {
          errors.push(`视频分辨率过低: ${resolution.width}x${resolution.height}。最小要求: ${validationConfig.minResolution.width}x${validationConfig.minResolution.height}`);
        }

        if (resolution.width > validationConfig.maxResolution.width || 
            resolution.height > validationConfig.maxResolution.height) {
          warnings.push(`视频分辨率过高: ${resolution.width}x${resolution.height}。可能影响处理速度`);
        }

        // 检查宽高比
        const aspectRatio = resolution.width / resolution.height;
        if (aspectRatio < 0.5 || aspectRatio > 3) {
          warnings.push(`视频宽高比异常: ${aspectRatio.toFixed(2)}。建议使用标准比例的视频`);
        }
      }

      // 码率检查
      if (bitrate !== undefined) {
        if (bitrate < 500000) { // 500kbps
          warnings.push('视频码率较低，可能影响分析质量');
        }
        if (bitrate > 10000000) { // 10Mbps
          warnings.push('视频码率较高，处理时间可能较长');
        }
      }

      // 帧率检查
      if (frameRate !== undefined) {
        if (frameRate < 15) {
          warnings.push(`视频帧率较低: ${frameRate}fps。建议使用15fps以上的视频`);
        }
        if (frameRate > 60) {
          warnings.push(`视频帧率较高: ${frameRate}fps。可能影响处理效率`);
        }
      }

    } catch (error) {
      errors.push('无法读取视频信息，请确保文件未损坏且格式正确');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        size: file.size,
        type: file.type,
        duration,
        resolution,
        bitrate,
        frameRate
      }
    };
  };

  // 获取视频信息
  const getVideoInfo = (file: File): Promise<{
    duration: number;
    resolution: { width: number; height: number };
    bitrate?: number;
    frameRate?: number;
  }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        
        // 估算码率（文件大小 / 时长）
        const estimatedBitrate = video.duration > 0 ? (file.size * 8) / video.duration : undefined;
        
        resolve({
          duration: video.duration,
          resolution: { width: video.videoWidth, height: video.videoHeight },
          bitrate: estimatedBitrate,
          frameRate: undefined // 浏览器API无法直接获取帧率
        });
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('无法加载视频'));
      };
      
      video.src = url;
    });
  };

  // 显示提示消息
  const showSnackbar = (message: string, severity: 'success' | 'warning' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 开始分析
  const handleAnalyze = () => {
    if (selectedFile && validationResult?.isValid) {
      startVideoAnalysis();
    }
  };

  // 清除选择
  const handleClear = () => {
    setSelectedFile(null);
    setVideoUrl(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VideoIcon />
        视频智能诊断
      </Typography>

      {/* 上传提示信息 */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>上传要求：</strong><br/>
          • 支持格式：MP4, AVI, MOV, WMV, WebM, MKV<br/>
          • 文件大小：100KB - 100MB<br/>
          • 视频时长：1秒 - 5分钟<br/>
          • 分辨率：320x240 - 3840x2160<br/>
          • 建议：使用高质量、标准比例的视频以获得最佳分析效果
        </Typography>
      </Alert>

      {/* 文件上传区域 */}
      <Card sx={{ mb: 3, border: '2px dashed #ccc', '&:hover': { borderColor: '#1976d2' } }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <input
            type="file"
            accept={validationConfig.allowedTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="large"
          >
            {uploading ? '验证中...' : '选择视频文件'}
          </Button>
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            点击选择视频文件
          </Typography>
        </CardContent>
      </Card>

      {/* 上传进度 */}
      {uploading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>正在验证视频文件...</Typography>
          <LinearProgress />
        </Box>
      )}

      {/* 视频预览和信息 */}
      {selectedFile && videoUrl && validationResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>视频预览</Typography>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {/* 视频播放器 */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <video
                  src={videoUrl}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px'
                  }}
                />
              </Box>
              
              {/* 视频信息 */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography variant="subtitle1" gutterBottom>文件信息</Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={`大小: ${formatFileSize(validationResult.fileInfo.size)}`} size="small" />
                  <Chip label={`格式: ${validationResult.fileInfo.type.split('/')[1].toUpperCase()}`} size="small" />
                  {validationResult.fileInfo.duration && (
                    <Chip label={`时长: ${formatDuration(validationResult.fileInfo.duration)}`} size="small" />
                  )}
                  {validationResult.fileInfo.resolution && (
                    <Chip 
                      label={`分辨率: ${validationResult.fileInfo.resolution.width}x${validationResult.fileInfo.resolution.height}`} 
                      size="small" 
                    />
                  )}
                  {validationResult.fileInfo.bitrate && (
                    <Chip 
                      label={`码率: ${(validationResult.fileInfo.bitrate / 1000000).toFixed(1)}Mbps`} 
                      size="small" 
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={handleAnalyze}
                    disabled={!validationResult.isValid}
                  >
                    开始分析
                  </Button>
                  <Button variant="outlined" onClick={handleClear}>
                    重新选择
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 分析结果部分 */}
      {selectedFile && validationResult && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 实时分析结果
                </Typography>
                
                {frameAnalyses.length === 0 && !isAnalyzing && (
                  <Typography variant="body2" color="text.secondary">
                    点击"开始智能分析"查看详细的视频分析结果
                  </Typography>
                )}
                
                {frameAnalyses.length > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      已分析 {frameAnalyses.length} 个关键帧
                    </Typography>
                    
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {frameAnalyses.map((analysis, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <span>{getAnomalyIcon(analysis.anomalyType)}</span>
                                  <Typography variant="body2">
                                    {formatDuration(analysis.timeStamp)}
                                  </Typography>
                                  <Chip 
                                    size="small" 
                                    label={`${(analysis.confidence * 100).toFixed(0)}%`}
                                    color={getSeverityColor(analysis.severity)}
                                  />
                                </Box>
                              }
                              secondary={analysis.description}
                            />
                          </ListItem>
                          {index < frameAnalyses.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 验证结果对话框 */}
      <Dialog 
        open={showValidationDialog} 
        onClose={() => setShowValidationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          视频验证结果
        </DialogTitle>
        <DialogContent>
          {validationResult && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {validationResult.isValid ? (
                    <CheckIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                  <Typography variant="h6">
                    {selectedFile?.name}
                  </Typography>
                  <Chip 
                    label={validationResult.isValid ? '有效' : '无效'} 
                    color={validationResult.isValid ? 'success' : 'error'}
                  />
                </Box>

                {validationResult.errors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>错误：</strong>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {validationResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </Typography>
                  </Alert>
                )}

                {validationResult.warnings.length > 0 && (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>警告：</strong>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {validationResult.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowValidationDialog(false)}>
            确定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VideoInput; 