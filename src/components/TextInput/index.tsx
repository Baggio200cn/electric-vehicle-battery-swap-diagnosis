import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent
} from '@mui/material';

interface TextInputProps {
  onSubmit: (text: string) => Promise<void>;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (text.trim()) {
      await onSubmit(text);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            📝 文字描述诊断
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            请详细描述您遇到的设备故障现象，我们将为您提供专业的诊断建议
          </Typography>
          
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="请描述故障现象，例如：变压器出现异常响声，电压不稳定..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!text.trim()}
            fullWidth
            size="large"
          >
            开始故障诊断
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TextInput; 