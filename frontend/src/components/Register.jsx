import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Container,
} from '@chakra-ui/react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Check if registration actually succeeded
      if (result.success) {
        toast({
          title: 'Registration successful!',
          description: 'Welcome! Redirecting to dashboard...',
          status: 'success',
          duration: 3000,
        });
        // Navigate to dashboard instead of login since user is now authenticated
        navigate('/dashboard');
      } else {
        // Registration failed
        toast({
          title: 'Registration failed',
          description: result.error || 'Could not create account',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.response?.data?.error || error.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={20}>
      <Box
        bg="rgba(26, 31, 46, 0.8)"
        p={8}
        borderRadius="16px"
        border="1px solid"
        borderColor="rgba(0, 217, 255, 0.2)"
        backdropFilter="blur(10px)"
      >
        <VStack spacing={6} align="stretch">
          <Heading
            size="xl"
            textAlign="center"
            bgGradient="linear(to-r, #00d9ff, #7c3aed)"
            bgClip="text"
          >
            Create Account
          </Heading>
          <Text textAlign="center" color="gray.400">
            Start trading with ₹10,00,000 virtual cash
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Choose a username"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Create a password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm your password"
                />
              </FormControl>

              <Button
                type="submit"
                width="100%"
                size="lg"
                isLoading={loading}
                bgGradient="linear(to-r, #00d9ff, #7c3aed)"
                color="white"
                _hover={{
                  transform: 'scale(1.02)',
                  boxShadow: '0 4px 12px rgba(0, 217, 255, 0.4)',
                }}
              >
                Register
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" color="gray.400">
            Already have an account?{' '}
            <Link
              as={RouterLink}
              to="/login"
              color="brand.500"
              fontWeight="bold"
            >
              Login here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default Register;