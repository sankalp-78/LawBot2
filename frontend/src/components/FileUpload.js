import React, { useState } from 'react';
import axios from 'axios';
import '../styles/FileUpload.css';

const FileUpload = ({ chatId, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError('');
  };

  const handleUpload = async () => {
    if (!files.length || !chatId) {
      setError('Please select at least one file and ensure a chat is active.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('chatId', chatId);

    setIsUploading(true);
    try {
      const res = await axios.post('http://localhost:4500/api/files/upload', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      setFiles([]);
      onUpload(res.data.messages || []); // Expect messages from backend
      setError('');
    } catch (err) {
      setError('Failed to upload files: ' + (err.response?.data?.msg || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button onClick={handleUpload} disabled={!files.length || !chatId || isUploading}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      {isUploading && (
        <div className="upload-progress">
          <span className="spinner"></span>
          <p>Uploading your file{files.length > 1 ? 's' : ''}...</p>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FileUpload;