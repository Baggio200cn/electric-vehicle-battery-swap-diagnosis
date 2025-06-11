import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  Divider
} from '@mui/material';
import { DiagnosisResult as DiagnosisResultType, Statistics } from '../../types';

interface DiagnosisResultProps {
  result: DiagnosisResultType;
  statistics?: Statistics | null;
}

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ result, statistics }) => {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getSeverityText = (severity?: string) => {
    switch (severity) {
      case 'high': return '高危';
      case 'medium': return '中等';
      case 'low': return '轻微';
      default: return '一般';
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            🔍 诊断结果
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              故障类型
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={result.faultType} 
                color="primary" 
                size="medium"
              />
              {result.severity && (
                <Chip 
                  label={getSeverityText(result.severity)} 
                  color={getSeverityColor(result.severity) as any}
                  size="small"
                />
              )}
              <Chip 
                label={`置信度: ${(result.confidence * 100).toFixed(1)}%`} 
                color="info" 
                variant="outlined"
              />
            </Box>
          </Box>

          {result.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                详细描述
              </Typography>
              <Alert severity="info">
                {result.description}
              </Alert>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              建议解决方案
            </Typography>
            <List>
              {result.solutions.map((solution, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={`${index + 1}. ${solution}`}
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {result.recommendations && result.recommendations.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                预防建议
              </Typography>
              <List>
                {result.recommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={`• ${recommendation}`}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {statistics && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  分析统计
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`总帧数: ${statistics.totalFrames}`} 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`异常帧数: ${statistics.abnormalFrames}`} 
                    variant="outlined" 
                    color="warning"
                  />
                  <Chip 
                    label={`异常率: ${(statistics.abnormalRatio * 100).toFixed(1)}%`} 
                    variant="outlined" 
                    color="error"
                  />
                  {statistics.duration && (
                    <Chip 
                      label={`时长: ${statistics.duration.toFixed(1)}s`} 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DiagnosisResult; 