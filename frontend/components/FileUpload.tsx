
import React, { useRef, useState } from 'react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelect: (file: FileData) => void;
  isLoading: boolean;
}

  const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
    onFileSelect({
      name: file.name,
      type: file.type,
      file: file
    });
  };


  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative group h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer ${
        dragActive 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/80'
      } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={inputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.mp3,.wav,.mp4"
      />
      
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold mb-1">
        {isLoading ? 'Processing Meeting...' : 'Upload Meeting Source'}
      </h3>
      <p className="text-slate-400 text-sm max-w-xs text-center px-4">
        Support for Text Transcripts, PDFs, Word, Video, or Audio recordings.
      </p>

      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/40 rounded-3xl flex items-center justify-center backdrop-blur-[2px]">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
