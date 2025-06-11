import React, { useState, useRef } from 'react';

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        onAudioRecorded(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('无法访问麦克风，请确保已授予权限。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="audio-recorder">
      <div className="controls">
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? '停止录音' : '开始录音'}
        </button>
      </div>
      {audioURL && (
        <div className="audio-preview">
          <audio src={audioURL} controls />
          <button 
            className="retry-button"
            onClick={() => {
              setAudioURL(null);
              audioChunksRef.current = [];
            }}
          >
            重新录制
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder; 