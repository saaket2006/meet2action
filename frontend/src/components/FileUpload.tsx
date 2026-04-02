import React, { useState, useId } from 'react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelect: (file: FileData) => void;
  isLoading: boolean;
  onAuthRequired?: () => void;
  maxWidth?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading, onAuthRequired, maxWidth }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputId = useId();

  const handleFileLocal = (file: File) => {
    onFileSelect({
      name: file.name,
      type: file.type,
      file: file
    });

    // Reset file input value to permit re-uploading the same file if needed
    const input = document.getElementById(fileInputId) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
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
    e.stopPropagation();
    setDragActive(false);

    if (onAuthRequired) {
      onAuthRequired();
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileLocal(e.dataTransfer.files[0]);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onAuthRequired) {
      e.preventDefault();
      onAuthRequired();
    }
  };

  return (
    <div className="relative w-full" style={{ maxWidth: maxWidth || '280px' }}>
      <input
        type="file"
        id={fileInputId}
        onChange={(e) => e.target.files?.[0] && handleFileLocal(e.target.files[0])}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.mp3,.wav,.mp4"
      />

      <label
        htmlFor={fileInputId}
        className={`relative group border border-dashed rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer overflow-hidden ${dragActive
          ? 'border-blue-500 bg-blue-500/10 shadow-sm'
          : 'border-slate-700 bg-[#111827] hover:bg-slate-800 hover:border-slate-500 hover:shadow-sm'
          } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
        style={{ height: '44px', width: '100%', padding: '0 20px' }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleClick}
      >
        <div className="flex items-center justify-center gap-3 w-full">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shrink-0"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 shrink-0 transition-colors ${dragActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          )}
          <span className={`text-sm font-medium transition-colors ${dragActive ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>
            {isLoading ? 'Processing...' : 'Upload Meeting Source'}
          </span>
        </div>
      </label>
    </div>
  );
};

export default FileUpload;


