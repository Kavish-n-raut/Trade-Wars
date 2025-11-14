import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter both username and password',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    const result = await login(formData.username, formData.password);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Login Successful! 🎉',
        description: 'Welcome back!',
        status: 'success',
        duration: 2000,
      });
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: result.error || 'Invalid credentials',
        status: 'error',
        duration: 4000,
      });
    }
  };

  return (
    <Container maxW="md" py={20}>
      <Box
        bg="rgba(26, 31, 46, 0.95)"
        p={8}
        borderRadius="16px"
        border="1px solid"
        borderColor="rgba(0, 217, 255, 0.3)"
        boxShadow="0 0 40px rgba(0, 217, 255, 0.2)"
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading
              size="xl"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
              mb={2}
            >
              Welcome Back
            </Heading>
            <Text color="gray.400">Login to your trading account</Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  size="lg"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                width="full"
                isLoading={loading}
                loadingText="Logging in..."
              >
                Login
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" color="gray.400">
            Don't have an account?{' '}
            <Link to="/register">
              <Text as="span" color="brand.400" fontWeight="bold">
                Register here
              </Text>
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default Login;