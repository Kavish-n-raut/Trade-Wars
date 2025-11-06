import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Spinner,
  Text,
  HStack,
  Button,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { adminAPI } from '../services/api';

const AdminUsersPanel = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminAPI.deleteUser(id);
      toast({
        title: 'Deleted',
        description: 'User deleted successfully',
        status: 'success',
        duration: 3000,
      });
      fetchUsers();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete user',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={2}>Loading users...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Total Users: {users.length}
        </Text>
        <Button size="sm" onClick={fetchUsers}>
          🔄 Refresh
        </Button>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th isNumeric>Balance</Th>
              <Th isNumeric>Portfolio Value</Th>
              <Th isNumeric>P/L</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td fontWeight="bold">{user.username}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Badge colorScheme={user.isAdmin ? 'purple' : 'gray'}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </Badge>
                </Td>
                <Td isNumeric>₹{user.balance?.toLocaleString('en-IN')}</Td>
                <Td isNumeric>₹{user.portfolioValue?.toLocaleString('en-IN')}</Td>
                <Td isNumeric color={user.profitLoss >= 0 ? 'green.400' : 'red.400'}>
                  ₹{user.profitLoss?.toLocaleString('en-IN')}
                </Td>
                <Td fontSize="sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      isDisabled={user.isAdmin}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AdminUsersPanel;