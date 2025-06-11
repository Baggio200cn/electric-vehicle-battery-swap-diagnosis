import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { VideoInputProps } from '../types';

const VideoInput: React.FC<VideoInputProps> = ({ onVideoUpload, onFrameCapture }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      await onVideoUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onVideoUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const captureFrame = useCallback(() => {
    if (videoRef.current && onFrameCapture) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        onFrameCapture(imageData);
      }
    }
  }, [onFrameCapture]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleTimeUpdate = () => {
        captureFrame();
      };
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [captureFrame]);

  return (
    <Box className="w-full max-w-2xl mx-auto">
      <Box
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        
        <Typography variant="h6" className="mb-4">
          上传视频文件或使用摄像头
        </Typography>

        <Box className="flex justify-center space-x-4">
          <Button
            variant="contained"
            startIcon={<FileUploadIcon />}
            onClick={handleButtonClick}
          >
            选择视频文件
          </Button>

          <Button
            variant="contained"
            startIcon={<VideocamIcon />}
            onClick={() => {
              // 这里可以添加打开摄像头的功能
            }}
          >
            打开摄像头
          </Button>
        </Box>

        <Typography variant="body2" className="mt-2 text-gray-500">
          支持拖放视频文件到此处
        </Typography>

        <video
          ref={videoRef}
          className="mt-4 w-full hidden"
          autoPlay
          playsInline
        />
      </Box>
    </Box>
  );
};

export default VideoInput; 