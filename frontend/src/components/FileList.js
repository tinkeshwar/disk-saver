import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_HOST } from '../configs/constant';
import { Flex, Button, Text, Table } from '@radix-ui/themes';
import { ExitIcon } from "@radix-ui/react-icons"

function FileList({ token, onLogout }) {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentProcessed, setCurrentProcessed] = useState(null);

  useEffect(() => {
    fetchFiles();
    // const interval = setInterval(fetchProcessed, 5000);
    // return () => clearInterval(interval);
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_HOST}/api/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const fetchProcessed = async () => {
    try {
      const response = await axios.get(`${API_HOST}/api/processed`, {
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

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" align="center" p="3" style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#e1e1e1' }}>
        <Flex align="center" gap="2">
          <Text size="5" weight="bold">💾 Disk Saver</Text>
        </Flex>
        <Button onClick={onLogout} variant="soft" color="red"> <ExitIcon/> </Button>
      </Flex>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Path</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {files.map((file) => (
            <Table.Row key={file.id}>
              <Table.Cell>{file.name}</Table.Cell>
              <Table.Cell>{file.path}</Table.Cell>
              <Table.Cell>{file.size.toFixed(2)} MB</Table.Cell>
              <Table.Cell>
                
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {showConfirm && currentProcessed && (
        <Flex justify="center" align="center" p="3" style={{ borderTop: '1px solid #e5e7eb' }}>
          <Text size="4" weight="bold">Processing {currentProcessed.name}</Text>
          <Button onClick={() => { setShowConfirm(false); setCurrentProcessed(null); }}>Close</Button>
        </Flex>
      )}
    </Flex>  
  )
}

export default FileList;
