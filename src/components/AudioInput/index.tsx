import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  AudioFile as AudioIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface AudioInputProps {
  onAudioSubmit: (file: File) => void;
}

// 音频验证结果接口
interface AudioValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    size: number;
    type: string;
    duration?: number;
    sampleRate?: number;
    channels?: number;
    bitrate?: number;
  };
}

const AudioInput: React.FC<AudioInputProps> = ({ onAudioSubmit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<AudioValidationResult | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error'>('success');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 音频验证配置
  const validationConfig = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    minFileSize: 10 * 1024, // 10KB
    allowedTypes: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm'],
    maxDuration: 600, // 10分钟
    minDuration: 1, // 1秒
    recommendedSampleRate: 44100,
    minSampleRate: 8000,
    maxSampleRate: 192000
  };

  // 验证音频文件
  const validateAudio = async (file: File): Promise<AudioValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 1. 文件类型验证
    if (!validationConfig.allowedTypes.includes(file.type)) {
      errors.push(`不支持的音频格式: ${file.type}。支持的格式: MP3, WAV, M4A, AAC, OGG, WebM`);
    }

    // 2. 文件大小验证
    if (file.size > validationConfig.maxFileSize) {
      errors.push(`文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大允许: ${validationConfig.maxFileSize / 1024 / 1024}MB`);
    }
    
    if (file.size < validationConfig.minFileSize) {
      errors.push(`文件过小: ${(file.size / 1024).toFixed(1)}KB。最小要求: ${validationConfig.minFileSize / 1024}KB`);
    }

    // 3. 音频属性验证
    let duration: number | undefined;
    let sampleRate: number | undefined;
    let channels: number | undefined;
    let bitrate: number | undefined;

    try {
      const audioInfo = await getAudioInfo(file);
      duration = audioInfo.duration;
      sampleRate = audioInfo.sampleRate;
      channels = audioInfo.channels;
      bitrate = audioInfo.bitrate;

      // 时长验证
      if (duration !== undefined) {
        if (duration < validationConfig.minDuration) {
          errors.push(`音频时长过短: ${duration.toFixed(1)}秒。最小要求: ${validationConfig.minDuration}秒`);
        }
        
        if (duration > validationConfig.maxDuration) {
          warnings.push(`音频时长较长: ${Math.floor(duration / 60)}分${Math.floor(duration % 60)}秒。建议时长: ${validationConfig.maxDuration / 60}分钟以内`);
        }
      }

      // 采样率验证
      if (sampleRate !== undefined) {
        if (sampleRate < validationConfig.minSampleRate) {
          warnings.push(`音频采样率较低: ${sampleRate}Hz。建议使用${validationConfig.recommendedSampleRate}Hz以上`);
        }
        
        if (sampleRate > validationConfig.maxSampleRate) {
          warnings.push(`音频采样率过高: ${sampleRate}Hz。可能影响处理效率`);
        }
      }

      // 声道数检查
      if (channels !== undefined) {
        if (channels > 2) {
          warnings.push(`音频声道数较多: ${channels}声道。建议使用单声道或立体声`);
        }
      }

      // 码率检查
      if (bitrate !== undefined) {
        if (bitrate < 64000) { // 64kbps
          warnings.push('音频码率较低，可能影响分析质量');
        }
        if (bitrate > 320000) { // 320kbps
          warnings.push('音频码率较高，处理时间可能较长');
        }
      }

    } catch (error) {
      errors.push('无法读取音频信息，请确保文件未损坏且格式正确');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        size: file.size,
        type: file.type,
        duration,
        sampleRate,
        channels,
        bitrate
      }
    };
  };

  // 获取音频信息
  const getAudioInfo = (file: File): Promise<{
    duration: number;
    sampleRate?: number;
    channels?: number;
    bitrate?: number;
  }> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        
        // 估算码率（文件大小 / 时长）
        const estimatedBitrate = audio.duration > 0 ? (file.size * 8) / audio.duration : undefined;
        
        resolve({
          duration: audio.duration,
          sampleRate: undefined, // 浏览器API无法直接获取采样率
          channels: undefined, // 浏览器API无法直接获取声道数
          bitrate: estimatedBitrate
        });
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('无法加载音频'));
      };
      
      audio.src = url;
    });
  };

  // 显示提示消息
  const showSnackbar = (message: string, severity: 'success' | 'warning' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const validationResult = await validateAudio(file);
      setValidationResult(validationResult);
      
      if (!validationResult.isValid) {
        setShowValidationDialog(true);
        showSnackbar('音频文件验证失败', 'error');
        return;
      }
      
      if (validationResult.warnings.length > 0) {
        setShowValidationDialog(true);
        showSnackbar('音频文件有警告信息', 'warning');
      } else {
        showSnackbar('音频文件验证通过！', 'success');
      }
      
      // 设置文件和预览
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
    } catch (error) {
      console.error('音频验证失败:', error);
      showSnackbar('音频验证过程中出现错误', 'error');
    } finally {
      setUploading(false);
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        
        // 验证录制的音频
        const validationResult = await validateAudio(file);
        setValidationResult(validationResult);
        
        if (validationResult.isValid) {
          setAudioFile(file);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          showSnackbar('录音完成！', 'success');
        } else {
          showSnackbar('录音质量不符合要求', 'error');
          setShowValidationDialog(true);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // 开始计时
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      showSnackbar('开始录音...', 'success');
    } catch (error) {
      console.error('录音失败:', error);
      showSnackbar('无法访问麦克风，请检查权限设置', 'error');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // 播放/暂停音频
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 开始分析
  const handleAnalyze = () => {
    if (audioFile && validationResult?.isValid) {
      onAudioSubmit(audioFile);
    }
  };

  // 清除选择
  const handleClear = () => {
    setAudioFile(null);
    setAudioUrl('');
    setValidationResult(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 格式化时长
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AudioIcon />
        音频智能诊断
      </Typography>

      {/* 上传提示信息 */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>上传要求：</strong><br/>
          • 支持格式：MP3, WAV, M4A, AAC, OGG, WebM<br/>
          • 文件大小：10KB - 50MB<br/>
          • 音频时长：1秒 - 10分钟<br/>
          • 建议：使用高质量音频以获得最佳分析效果
        </Typography>
      </Alert>

      {/* 录音和上传选项 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>音频输入方式</Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            {/* 录音按钮 */}
            <Button
              variant={isRecording ? "contained" : "outlined"}
              color={isRecording ? "error" : "primary"}
              startIcon={isRecording ? <StopIcon /> : <MicIcon />}
              onClick={isRecording ? stopRecording : startRecording}
              size="large"
              disabled={uploading}
            >
              {isRecording ? '停止录音' : '开始录音'}
            </Button>

            {/* 文件上传 */}
            <input
              type="file"
              accept={validationConfig.allowedTypes.join(',')}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isRecording}
              size="large"
            >
              {uploading ? '验证中...' : '上传音频文件'}
            </Button>
          </Box>

          {/* 录音状态显示 */}
          {isRecording && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="warning" sx={{ mb: 1 }}>
                正在录音中... 请对着麦克风说话，完成后点击"停止录音"
              </Alert>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress sx={{ flex: 1 }} color="error" />
                <Chip 
                  label={`录音时长: ${formatDuration(recordingTime)}`}
                  color="error"
                  size="small"
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 上传进度 */}
      {uploading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>正在验证音频文件...</Typography>
          <LinearProgress />
        </Box>
      )}

      {/* 音频预览和信息 */}
      {audioFile && audioUrl && validationResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>音频预览</Typography>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {/* 音频播放器 */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  style={{ width: '100%', marginBottom: 16 }}
                  controls
                />
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <IconButton
                    onClick={togglePlayback}
                    color="primary"
                    size="large"
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                  <Typography variant="body2">
                    {isPlaying ? '播放中' : '点击播放'}
                  </Typography>
                  <IconButton
                    onClick={handleClear}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              
              {/* 音频信息 */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography variant="subtitle1" gutterBottom>文件信息</Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={`大小: ${formatFileSize(validationResult.fileInfo.size)}`} size="small" />
                  <Chip label={`格式: ${validationResult.fileInfo.type.split('/')[1].toUpperCase()}`} size="small" />
                  {validationResult.fileInfo.duration && (
                    <Chip label={`时长: ${formatDuration(validationResult.fileInfo.duration)}`} size="small" />
                  )}
                  {validationResult.fileInfo.sampleRate && (
                    <Chip label={`采样率: ${validationResult.fileInfo.sampleRate}Hz`} size="small" />
                  )}
                  {validationResult.fileInfo.channels && (
                    <Chip label={`声道: ${validationResult.fileInfo.channels}`} size="small" />
                  )}
                  {validationResult.fileInfo.bitrate && (
                    <Chip 
                      label={`码率: ${(validationResult.fileInfo.bitrate / 1000).toFixed(0)}kbps`} 
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

      {/* 验证结果对话框 */}
      <Dialog 
        open={showValidationDialog} 
        onClose={() => setShowValidationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          音频验证结果
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
                    {audioFile?.name || '录音文件'}
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

export default AudioInput; 