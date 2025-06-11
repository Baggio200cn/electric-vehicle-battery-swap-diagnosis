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
  IconButton
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface AudioInputProps {
  onAudioSubmit: (audioFile: File) => Promise<void>;
}

const AudioInput: React.FC<AudioInputProps> = ({ onAudioSubmit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
      if (validTypes.includes(file.type)) {
        setUploadedFile(file);
        setError(null);
      } else {
        setError('请上传有效的音频文件 (WAV, MP3, OGG)');
      }
    }
  };

  const handleSubmit = async () => {
    let audioFile: File | null = null;

    if (recordedAudio) {
      audioFile = new File([recordedAudio], `recorded_audio_${Date.now()}.wav`, {
        type: 'audio/wav'
      });
    } else if (uploadedFile) {
      audioFile = uploadedFile;
    }

    if (audioFile) {
      try {
        await onAudioSubmit(audioFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : '音频处理失败');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            🎤 音频故障诊断
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            您可以录制设备运行声音或上传音频文件进行故障分析
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 录音区域 */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>实时录音</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {!isRecording ? (
                <Button
                  variant="contained"
                  startIcon={<MicIcon />}
                  onClick={startRecording}
                  disabled={!!recordedAudio}
                  color="error"
                >
                  开始录音
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<StopIcon />}
                  onClick={stopRecording}
                  color="secondary"
                >
                  停止录音
                </Button>
              )}

              {isRecording && (
                <Box sx={{ flex: 1 }}>
                  <LinearProgress color="error" />
                  <Typography variant="caption" sx={{ color: 'error.main' }}>
                    录音中... {formatTime(recordingTime)}
                  </Typography>
                </Box>
              )}
            </Box>

            {recordedAudio && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Chip 
                  label={`录音时长: ${formatTime(recordingTime)}`}
                  color="success"
                />
                <IconButton
                  size="small"
                  onClick={() => setRecordedAudio(null)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* 文件上传区域 */}
          <Box sx={{ mb: 3, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>上传音频文件</Typography>
            
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={!!uploadedFile}
            >
              选择音频文件
            </Button>

            {uploadedFile && (
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${uploadedFile.name} (${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)`}
                  color="info"
                  onDelete={() => setUploadedFile(null)}
                />
              </Box>
            )}
          </Box>

          {/* 提交按钮 */}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!recordedAudio && !uploadedFile}
            fullWidth
            size="large"
          >
            开始诊断
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AudioInput; 