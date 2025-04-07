import React, { useState } from 'react';
import axios from 'axios';
import { API_HOST } from '../configs/constant';
import { Button, Card, Flex, Heading, Text, TextField } from '@radix-ui/themes';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_HOST}/api/login`, { username, password });
      onLogin(response.data.token);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
      <Card size="3" style={{ width: '100%', maxWidth: '400px' }}>
        <Heading size="5" mb="4" align="center">Login</Heading>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <TextField.Root
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
            
            <TextField.Root
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <Button type="submit" size="3">
              Login
            </Button>
          </Flex>
        </form>
        {error && <Text color="red" mt="3">{error}</Text>}
      </Card>
    </Flex>
  );
}

export default Login;
