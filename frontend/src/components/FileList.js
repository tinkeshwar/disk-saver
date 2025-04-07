import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_HOST } from '../configs/constant';
import { Flex, Button, Text, Table, Box, Heading } from '@radix-ui/themes';
import { CheckIcon, Cross2Icon, ExitIcon } from "@radix-ui/react-icons"

function FileList({ token, onLogout }) {
  const [files, setFiles] = useState([]);
  const [processingFiles, setProcessingFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
    fetchProcessingFiles();
    const interval = setInterval(fetchProcessed, 10000);
    return () => clearInterval(interval);
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

  const fetchProcessingFiles = async () => {
    try {
      const response = await axios.get(`${API_HOST}/api/queue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProcessingFiles(response.data);
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
    } catch (err) {
      console.error('Error fetching processed files:', err);
    }
  };

  const handleQueue = async (id) => {
    try {
      await axios.post(
        `${API_HOST}/api/queue`,
        { fileIds: [id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Files queued for processing');
      fetchFiles();
      fetchProcessingFiles();
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

      {(files.length > 0) && <Box p="4">
        <Heading>New Scanned Files</Heading>
        <Table.Root size="1">
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
                  <Flex gap="2">
                    <Button size="1" color="green" onClick={() => handleQueue(file.id)}><CheckIcon/></Button>
                    <Button size="1" color="red" onClick={() => handleQueue(file.id)}><Cross2Icon/></Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>}

      {(processingFiles.length > 0) && <Box p="4">
        <Heading>Files In Queue</Heading>
        <Table.Root size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Path</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {processingFiles.map((file) => (
              <Table.Row key={file.id}>
                <Table.Cell>{file.name}</Table.Cell>
                <Table.Cell>{file.path}</Table.Cell>
                <Table.Cell>{file.size.toFixed(2)} MB</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>}

      {(processedFiles.length > 0) && <Box p="4">
        <Heading>File Ready To Move</Heading>
        <Table.Root size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Path</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Old Size</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>New Size</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {processedFiles.map((file) => (
              <Table.Row key={file.id}>
                <Table.Cell>{file.name}</Table.Cell>
                <Table.Cell>{file.path}</Table.Cell>
                <Table.Cell>{file.size.toFixed(2)} MB</Table.Cell>
                <Table.Cell>{file.size.toFixed(2)} MB</Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button size="1" color="green" onClick={() => handleQueue(file.id)}><CheckIcon/></Button>
                    <Button size="1" color="red" onClick={() => handleQueue(file.id)}><Cross2Icon/></Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>}
    </Flex>  
  )
}

export default FileList;
