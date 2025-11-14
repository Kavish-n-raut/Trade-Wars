import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Badge,
  Text,
  VStack,
  HStack,
  Spinner,
  Button,
  useToast,
} from '@chakra-ui/react';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getTop(50); // Changed from .get to .getTop
      setTraders(response.data);
    } catch (error) {
      console.error('❌ Leaderboard error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={12}>
          <Spinner size="xl" color="brand.500" />
          <Text mt={4} color="gray.400">Loading leaderboard...</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2}>
            🏆 Leaderboard
          </Heading>
          <Text color="gray.400">Top traders by portfolio value</Text>
        </Box>

        {/* Leaderboard Table */}
        <Box
          bg="rgba(26, 31, 46, 0.8)"
          borderRadius="16px"
          border="1px solid"
          borderColor="rgba(0, 217, 255, 0.2)"
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>Trader</Th>
                <Th isNumeric>Portfolio Value</Th>
                <Th isNumeric>P/L</Th>
                <Th isNumeric>P/L %</Th>
              </Tr>
            </Thead>
            <Tbody>
              {traders.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Text color="gray.400">No traders yet</Text>
                  </Td>
                </Tr>
              ) : (
                traders.map((trader, index) => {
                  const isCurrentUser = trader.id === user?.id;
                  // Calculate P/L percentage based on initial capital (1000000)
                  const initialCapital = 1000000;
                  const plPercent = ((trader.profitLoss / initialCapital) * 100).toFixed(2);
                  
                  return (
                    <Tr
                      key={trader.id}
                      bg={isCurrentUser ? 'rgba(0, 217, 255, 0.1)' : 'transparent'}
                      fontWeight={isCurrentUser ? 'bold' : 'normal'}
                    >
                      <Td>
                        <HStack>
                          {index < 3 && (
                            <Text fontSize="2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </Text>
                          )}
                          <Text>{index + 1}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack>
                          <Avatar size="sm" name={trader.username} />
                          <Box>
                            <Text fontWeight="bold">
                              {trader.username}
                              {isCurrentUser && (
                                <Badge ml={2} colorScheme="brand" fontSize="xs">
                                  You
                                </Badge>
                              )}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td isNumeric fontWeight="bold">
                        ₹{trader.portfolioValue?.toLocaleString('en-IN')}
                      </Td>
                      <Td
                        isNumeric
                        color={trader.profitLoss >= 0 ? 'success.500' : 'error.500'}
                        fontWeight="bold"
                      >
                        {trader.profitLoss >= 0 ? '+' : ''}₹
                        {trader.profitLoss?.toLocaleString('en-IN')}
                      </Td>
                      <Td
                        isNumeric
                        color={trader.profitLoss >= 0 ? 'success.500' : 'error.500'}
                      >
                        {plPercent >= 0 ? '+' : ''}{plPercent}%
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>

        <Button colorScheme="brand" onClick={fetchLeaderboard}>
          🔄 Refresh Leaderboard
        </Button>
      </VStack>
    </Container>
  );
};

export default Leaderboard;