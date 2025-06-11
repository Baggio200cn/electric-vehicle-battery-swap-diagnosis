import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface TextInputProps {
  onSubmit: (text: string) => Promise<void>;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
    } catch (error) {
      console.error('提交文本时出错:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="w-full max-w-2xl mx-auto">
      <Typography variant="h6" className="mb-4">
        故障描述
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="请输入故障现象描述..."
        variant="outlined"
        className="mb-4"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={!text.trim() || isSubmitting}
        startIcon={<SendIcon />}
      >
        提交分析
      </Button>
    </Box>
  );
};

export default TextInput; 