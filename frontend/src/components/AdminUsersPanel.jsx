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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { adminAPI } from '../services/api';

const AdminUsersPanel = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const handleOpenAdjustModal = (user) => {
    setSelectedUser(user);
    setAdjustAmount('');
    setAdjustReason('');
    onOpen();
  };

  const handleAdjustBalance = async () => {
    if (!adjustAmount || adjustAmount === '0') {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a non-zero amount',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setIsAdjusting(true);
      const response = await adminAPI.adjustUserBalance(selectedUser.id, {
        amount: parseFloat(adjustAmount),
        reason: adjustReason,
      });

      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 5000,
      });

      fetchUsers();
      onClose();
    } catch (error) {
      console.error('Adjust balance error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to adjust balance',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsAdjusting(false);
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
                      icon={<EditIcon />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleOpenAdjustModal(user)}
                      title="Adjust Balance"
                    />
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

      {/* Adjust Balance Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>
            Adjust Balance for {selectedUser?.username}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box
                w="100%"
                p={4}
                bg="gray.700"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.600"
              >
                <Text fontSize="sm" color="gray.400" mb={1}>
                  Current Balance
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="brand.400">
                  ₹{selectedUser?.balance?.toLocaleString('en-IN')}
                </Text>
              </Box>

              <FormControl isRequired>
                <FormLabel>Amount to Add/Deduct</FormLabel>
                <NumberInput
                  value={adjustAmount}
                  onChange={(valueString) => setAdjustAmount(valueString)}
                  min={-selectedUser?.balance || 0}
                >
                  <NumberInputField
                    placeholder="Enter amount (use - for deduction)"
                    bg="gray.700"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.400" mt={2}>
                  • Positive number to add money (e.g., 10000)
                  <br />
                  • Negative number to deduct money (e.g., -5000)
                </Text>
              </FormControl>

              {adjustAmount && (
                <Box
                  w="100%"
                  p={3}
                  bg={parseFloat(adjustAmount) >= 0 ? 'green.900' : 'red.900'}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={parseFloat(adjustAmount) >= 0 ? 'green.600' : 'red.600'}
                >
                  <Text fontSize="sm" color="gray.300">
                    New Balance:
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    ₹{((selectedUser?.balance || 0) + parseFloat(adjustAmount || 0)).toLocaleString('en-IN')}
                  </Text>
                </Box>
              )}

              <FormControl>
                <FormLabel>Reason (Optional)</FormLabel>
                <Textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Event prize, Penalty, Correction..."
                  bg="gray.700"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme={parseFloat(adjustAmount) >= 0 ? 'green' : 'red'}
              onClick={handleAdjustBalance}
              isLoading={isAdjusting}
              isDisabled={!adjustAmount || adjustAmount === '0'}
            >
              {parseFloat(adjustAmount) >= 0 ? '💰 Add Money' : '💸 Deduct Money'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminUsersPanel;