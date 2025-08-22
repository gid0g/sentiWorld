import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileUpload.css';  // We'll create this file next

interface UploadStatus {
  task_id: string | null;
  status: string;
  progress: number;
  stage: string;
}

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    task_id: null,
    status: 'idle',
    progress: 0,
    stage: ''
  });

  // Function to fetch analysis results
  const fetchResults = async () => {
    try {
      console.log('Fetching analysis results...');
      
      const response = await axios.get('http://localhost:8000/api/v1/analyze/batch/results');
      console.log('Analysis Results:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  };

  // Function to process CSV file
  const processCSV = async (file: File) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;
        
        const rows = text.split('\n');
        const headers = rows[0].toLowerCase().split(',');
        const textColumnIndex = headers.findIndex(h => 
          ['text', 'review', 'feedback', 'content'].includes(h.trim())
        );
        
        if (textColumnIndex === -1) {
          console.error('No valid text column found in CSV');
          return;
        }

        const texts = rows.slice(1)
          .map(row => row.split(',')[textColumnIndex]?.trim())
          .filter(text => text && text.length > 0);

        console.log('Processing CSV file:', {
          totalRows: rows.length,
          validTexts: texts.length,
          textColumn: headers[textColumnIndex]
        });

        if (texts.length === 0) {
          console.error('No valid texts found in CSV');
          return;
        }

        const response = await axios.post('http://localhost:8000/api/v1/analyze/batch', {
          texts: texts
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Batch analysis response:', response.data);
        return response.data;
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw error;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      console.log('File selected:', {
        name: selectedFile.name,
        size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
        type: selectedFile.type
      });
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      console.log('Starting file processing...');
      setUploadStatus({
        task_id: null,
        status: 'processing',
        progress: 0,
        stage: 'Processing CSV file...'
      });

      const results = await processCSV(file);
      
      console.log('Processing complete:', results);
      setUploadStatus({
        task_id: null,
        status: 'complete',
        progress: 1,
        stage: 'Analysis complete'
      });

    } catch (error) {
      console.error('Upload/processing error:', error);
      setUploadStatus({
        task_id: null,
        status: 'error',
        progress: 0,
        stage: 'Error processing file'
      });
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload CSV File</h2>
      <div className="upload-form">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="file-input"
        />
        <button onClick={handleUpload} disabled={!file} className="upload-button">
          Upload and Analyze
        </button>
      </div>

      {/* Progress Display */}
      {uploadStatus.status !== 'idle' && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadStatus.progress * 100}%` }}
            />
          </div>
          <div className="status-text">
            <p>Status: {uploadStatus.status}</p>
            <p>Progress: {Math.round(uploadStatus.progress * 100)}%</p>
            <p>Stage: {uploadStatus.stage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 