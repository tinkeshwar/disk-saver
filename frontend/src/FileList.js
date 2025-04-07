import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileList({ token, onLogout }) {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentProcessed, setCurrentProcessed] = useState(null);

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchProcessed, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/files', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const fetchProcessed = async () => {
    try {
      const response = await axios.get('/api/processed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newProcessed = response.data;
      setProcessedFiles(newProcessed);
      if (newProcessed.length > 0 && !showConfirm) {
        setCurrentProcessed(newProcessed[0]);
        setShowConfirm(true);
      }
    } catch (err) {
      console.error('Error fetching processed files:', err);
    }
  };

  const handleSelect = (id) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleQueue = async () => {
    try {
      await axios.post(
        '/api/queue',
        { fileIds: selectedFiles },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Files queued for processing');
      setSelectedFiles([]);
      fetchFiles();
    } catch (err) {
      console.error('Error queuing files:', err);
    }
  };

  const handleConfirm = async (action) => {
    try {
      await axios.post(
        '/api/confirm',
        { 
          id: currentProcessed.id, 
          action, 
          tempPath: currentProcessed.tempPath, 
          newSize: currentProcessed.newSize, 
          path: currentProcessed.path 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProcessedFiles((prev) => prev.slice(1));
      setShowConfirm(false);
      setCurrentProcessed(processedFiles.length > 1 ? processedFiles[1] : null);
      if (processedFiles.length > 1) setShowConfirm(true);
      fetchFiles(); // Refresh pending files
    } catch (err) {
      console.error('Error confirming action:', err);
    }
  };

  return (
    <div>
      <h2>Video Files</h2>
      <button onClick={onLogout}>Logout</button>
      <h3>Pending Files</h3>
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <input
              type="checkbox"
              checked={selectedFiles.includes(file.id)}
              onChange={() => handleSelect(file.id)}
            />
            {file.path} ({file.size.toFixed(2)} MB)
          </li>
        ))}
      </ul>
      <button onClick={handleQueue} disabled={!selectedFiles.length}>
        Optimize Selected
      </button>

      {showConfirm && currentProcessed && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Confirm Optimization</h3>
          <p>File: {currentProcessed.path}</p>
          <p>Original Size: {currentProcessed.oldSize.toFixed(2)} MB</p>
          <p>New Size: {currentProcessed.newSize.toFixed(2)} MB</p>
          <button onClick={() => handleConfirm('replace')}>Replace</button>
          <button onClick={() => handleConfirm('discard')} style={{ marginLeft: '10px' }}>
            Discard
          </button>
        </div>
      )}
    </div>
  );
}

export default FileList;