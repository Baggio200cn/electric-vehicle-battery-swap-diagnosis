import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import type { TextInputProps } from '../../types';

const TextInput: React.FC<TextInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      await onSubmit(text);
      setText('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="请输入故障描述..."
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!text.trim()}
      >
        分析
      </Button>
    </Box>
  );
};

export default TextInput; 