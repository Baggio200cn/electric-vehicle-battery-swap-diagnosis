import React, { useState } from 'react';
import './App.css';
import TextInput from './components/TextInput';
import VideoInput from './components/VideoInput';
import { analyzeText, analyzeVideo } from './api/faultAnalysis';
import DiagnosisResult from './components/DiagnosisResult';
import { CircularProgress, Alert } from '@mui/material';
import type { DiagnosisResult as DiagnosisResultType, Statistics } from './types';

const App: React.FC = () => {
  const [activeInput, setActiveInput] = useState<'video' | 'text'>('video');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResultType | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  const handleVideoUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyzeVideo(file);
      setDiagnosisResult(result);
      setStatistics(result.statistics || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (text: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyzeText(text);
      setDiagnosisResult(result);
      setStatistics(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="input-selector">
        <button
          className={`input-button ${activeInput === 'video' ? 'active' : ''}`}
          onClick={() => setActiveInput('video')}
        >
          视频输入
        </button>
        <button
          className={`input-button ${activeInput === 'text' ? 'active' : ''}`}
          onClick={() => setActiveInput('text')}
        >
          文本输入
        </button>
      </div>

      {activeInput === 'video' ? (
        <VideoInput onUpload={handleVideoUpload} />
      ) : (
        <TextInput onSubmit={handleTextSubmit} />
      )}

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {diagnosisResult && <DiagnosisResult result={diagnosisResult} statistics={statistics} />}
    </div>
  );
};

export default App; 