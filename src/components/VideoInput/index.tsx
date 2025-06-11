import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface VideoInputProps {
  onVideoUpload: (file: File) => Promise<void>;
}

const VideoInput: React.FC<VideoInputProps> = ({ onVideoUpload }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('请选择有效的视频文件');
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onVideoUpload(selectedFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : '视频上传失败');
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
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

          {selectedFile && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2">
                已选择: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile}
            fullWidth
            size="large"
          >
            开始视频分析
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VideoInput; 