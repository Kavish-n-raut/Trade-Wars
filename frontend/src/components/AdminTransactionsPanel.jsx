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
  Text,
  Spinner,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { adminAPI } from '../services/api';

const AdminTransactionsPanel = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="cyan.400" />
        <Text mt={4}>Loading transactions...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="bold">
          Recent Transactions ({transactions.length})
        </Text>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>User</Th>
              <Th>Stock</Th>
              <Th>Type</Th>
              <Th isNumeric>Quantity</Th>
              <Th isNumeric>Price</Th>
              <Th isNumeric>Total</Th>
              <Th isNumeric>P/L</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.map((transaction) => (
              <Tr key={transaction.id}>
                <Td>{transaction.id}</Td>
                <Td>
                  <Text fontSize="sm" fontWeight="bold">
                    {transaction.user.username}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {transaction.user.email}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" fontWeight="bold">
                    {transaction.stock.symbol}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {transaction.stock.companyName}
                  </Text>
                </Td>
                <Td>
                  <Badge
                    colorScheme={transaction.type === 'BUY' ? 'green' : 'red'}
                  >
                    {transaction.type}
                  </Badge>
                </Td>
                <Td isNumeric>{transaction.quantity}</Td>
                <Td isNumeric>₹{transaction.price.toFixed(2)}</Td>
                <Td isNumeric>₹{transaction.totalAmount.toFixed(2)}</Td>
                <Td isNumeric>
                  <Text
                    color={
                      transaction.profitLoss > 0
                        ? 'green.400'
                        : transaction.profitLoss < 0
                        ? 'red.400'
                        : 'gray.400'
                    }
                  >
                    ₹{transaction.profitLoss?.toFixed(2) || '0.00'}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="xs">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {transactions.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text color="gray.400">No transactions found</Text>
        </Box>
      )}
    </VStack>
  );
};

export default AdminTransactionsPanel;
