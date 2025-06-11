import React, { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { VideoInputProps } from '../../types';

const VideoInput: React.FC<VideoInputProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      onUpload(file);
    }
  };

  return (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        p: 3,
        textAlign: 'center',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="video/*"
        style={{ display: 'none' }}
      />
      <Typography variant="h6" gutterBottom>
        拖放视频文件到此处或点击上传
      </Typography>
      <Typography variant="body2" color="text.secondary">
        支持的格式: MP4, AVI, MOV
      </Typography>
    </Box>
  );
};

export default VideoInput; 