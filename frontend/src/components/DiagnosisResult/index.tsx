import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { DiagnosisResultProps } from '../../types';

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ result, statistics }) => {
  if (!result) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        诊断结果
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        故障类型: {result.faultType}
      </Typography>

      <Typography variant="body1" gutterBottom>
        置信度: {(result.confidence * 100).toFixed(2)}%
      </Typography>

      <Typography variant="h6" gutterBottom>
        解决方案:
      </Typography>
      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
        {result.solutions.map((solution, index) => (
          <Box component="li" key={index}>
            <Typography variant="body1">{solution}</Typography>
          </Box>
        ))}
      </Box>

      {statistics && (
        <>
          <Typography variant="h6" gutterBottom>
            分析统计:
          </Typography>
          <Box sx={{ pl: 3 }}>
            <Typography variant="body1">
              总帧数: {statistics.totalFrames}
            </Typography>
            <Typography variant="body1">
              已分析帧数: {statistics.analyzedFrames}
            </Typography>
            <Typography variant="body1">
              异常帧数: {statistics.abnormalFrames}
            </Typography>
            <Typography variant="body1">
              异常比例: {(statistics.abnormalRatio * 100).toFixed(2)}%
            </Typography>
            <Typography variant="body1">
              分析时长: {statistics.duration.toFixed(2)}秒
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default DiagnosisResult; 