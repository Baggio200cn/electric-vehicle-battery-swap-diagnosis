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
  Divider
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Analytics as AnalysisIcon,
  VideoFile as VideoIcon
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setError(null);
        
        // 创建视频预览URL
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        
        // 清除之前的分析结果
        setFrameAnalyses([]);
        setAnalysisProgress(0);
      } else {
        setError('请选择有效的视频文件');
      }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            📹 视频上传诊断
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            上传设备运行视频，AI将自动分析视频中的异常状况
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />

          {!selectedFile ? (
            <Box sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center', 
              mb: 3,
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                点击上传视频文件
              </Typography>
              <Typography variant="body2" color="text.secondary">
                支持 MP4, AVI, MOV 等常见视频格式
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* 视频播放器部分 */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <VideoIcon sx={{ mr: 1 }} />
                      视频预览
                    </Typography>
                    
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <video
                        ref={videoRef}
                        src={videoUrl || ''}
                        style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                        onClick={togglePlayPause}
                        disabled={!videoUrl}
                      >
                        {isPlaying ? '暂停' : '播放'}
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(currentTime)} / {formatTime(videoDuration)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      文件: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                    
                    <Button
                      variant="contained"
                      onClick={startVideoAnalysis}
                      disabled={isAnalyzing}
                      fullWidth
                      size="large"
                      startIcon={<AnalysisIcon />}
                    >
                      {isAnalyzing ? '分析中...' : '开始智能分析'}
                    </Button>
                    
                    {isAnalyzing && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress variant="determinate" value={analysisProgress} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          分析进度: {analysisProgress.toFixed(0)}%
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* 分析结果部分 */}
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
                                        {formatTime(analysis.timeStamp)}
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default VideoInput; 