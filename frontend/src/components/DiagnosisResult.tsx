import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { DiagnosisResultProps } from '../types';

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ result, statistics }) => {
  return (
    <Paper elevation={3} className="p-6 mt-8">
      <Typography variant="h5" className="mb-4">
        诊断结果
      </Typography>
      
      <Typography variant="body1" className="mb-4 whitespace-pre-line">
        {result}
      </Typography>

      <Box className="mt-4">
        <Typography variant="h6" className="mb-2">
          分析统计
        </Typography>
        <Box className="grid grid-cols-2 gap-4">
          {statistics.totalFrames !== undefined && (
            <Typography>总帧数: {statistics.totalFrames}</Typography>
          )}
          {statistics.analyzedFrames !== undefined && (
            <Typography>已分析帧数: {statistics.analyzedFrames}</Typography>
          )}
          {statistics.abnormalFrames !== undefined && (
            <Typography>异常帧数: {statistics.abnormalFrames}</Typography>
          )}
          {statistics.abnormalRatio !== undefined && (
            <Typography>异常比例: {(statistics.abnormalRatio * 100).toFixed(2)}%</Typography>
          )}
          {statistics.duration !== undefined && (
            <Typography>视频时长: {statistics.duration.toFixed(2)}秒</Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default DiagnosisResult; 