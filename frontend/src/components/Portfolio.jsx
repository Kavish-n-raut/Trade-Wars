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
  Text,
  Spinner,
  Badge,
  Button,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Portfolio = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getHoldings();
      setHoldings(response.data);
    } catch (error) {
      console.error('Portfolio fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={12}>
          <Spinner size="xl" color="brand.500" />
          <Text mt={4} color="gray.400">Loading portfolio...</Text>
        </Box>
      </Container>
    );
  }

  // Calculate portfolio metrics
  const totalInvested = holdings.reduce((sum, h) => sum + (h.averagePrice * h.quantity), 0);
  const currentValue = holdings.reduce((sum, h) => sum + (h.stock.currentPrice * h.quantity), 0);
  const totalProfitLoss = currentValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2}>
            💼 My Portfolio
          </Heading>
          <Text color="gray.400">Track your holdings and performance</Text>
        </Box>

        {/* Portfolio Summary */}
        <HStack spacing={8} flexWrap="wrap">
          <Stat
            bg="rgba(26, 31, 46, 0.8)"
            p={6}
            borderRadius="16px"
            border="1px solid"
            borderColor="rgba(0, 217, 255, 0.2)"
            minW="250px"
          >
            <StatLabel>Available Balance</StatLabel>
            <StatNumber>₹{user?.balance?.toLocaleString('en-IN') || '0'}</StatNumber>
          </Stat>

          <Stat
            bg="rgba(26, 31, 46, 0.8)"
            p={6}
            borderRadius="16px"
            border="1px solid"
            borderColor="rgba(0, 217, 255, 0.2)"
            minW="250px"
          >
            <StatLabel>Holdings Value</StatLabel>
            <StatNumber>₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</StatNumber>
          </Stat>

          <Stat
            bg="rgba(26, 31, 46, 0.8)"
            p={6}
            borderRadius="16px"
            border="1px solid"
            borderColor="rgba(0, 217, 255, 0.2)"
            minW="250px"
          >
            <StatLabel>Total Profit/Loss</StatLabel>
            <StatNumber color={totalProfitLoss >= 0 ? 'success.500' : 'error.500'}>
              ₹{totalProfitLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={totalProfitLoss >= 0 ? 'increase' : 'decrease'} />
              {totalProfitLossPercent.toFixed(2)}%
            </StatHelpText>
          </Stat>

          <Stat
            bg="rgba(26, 31, 46, 0.8)"
            p={6}
            borderRadius="16px"
            border="1px solid"
            borderColor="rgba(0, 217, 255, 0.2)"
            minW="250px"
          >
            <StatLabel>Portfolio Value</StatLabel>
            <StatNumber>₹{user?.portfolioValue?.toLocaleString('en-IN') || '0'}</StatNumber>
          </Stat>
        </HStack>

        {/* Holdings Table */}
        <Box
          bg="rgba(26, 31, 46, 0.8)"
          borderRadius="16px"
          border="1px solid"
          borderColor="rgba(0, 217, 255, 0.2)"
          overflowX="auto"
        >
          {holdings.length === 0 ? (
            <Box textAlign="center" py={12}>
              <Text fontSize="xl" color="gray.400">No holdings yet</Text>
              <Text color="gray.500" mt={2}>Start trading to build your portfolio</Text>
            </Box>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Symbol</Th>
                  <Th>Company</Th>
                  <Th>Sector</Th>
                  <Th isNumeric>Quantity</Th>
                  <Th isNumeric>Avg Price</Th>
                  <Th isNumeric>Current Price</Th>
                  <Th isNumeric>Total Invested</Th>
                  <Th isNumeric>Current Value</Th>
                  <Th isNumeric>Profit/Loss</Th>
                  <Th isNumeric>Return %</Th>
                </Tr>
              </Thead>
              <Tbody>
                {holdings.map((holding) => {
                  const invested = holding.averagePrice * holding.quantity;
                  const currentVal = holding.stock.currentPrice * holding.quantity;
                  const profitLoss = currentVal - invested;
                  const returnPercent = (profitLoss / invested) * 100;

                  return (
                    <Tr key={holding.id} _hover={{ bg: 'rgba(0, 217, 255, 0.05)' }}>
                      <Td fontWeight="bold" fontFamily="monospace">
                        {holding.stock.symbol}
                      </Td>
                      <Td>{holding.stock.name}</Td>
                      <Td>
                        <Badge colorScheme="purple" fontSize="xs">
                          {holding.stock.sector}
                        </Badge>
                      </Td>
                      <Td isNumeric>{holding.quantity}</Td>
                      <Td isNumeric>₹{holding.averagePrice.toFixed(2)}</Td>
                      <Td isNumeric fontWeight="bold">
                        ₹{holding.stock.currentPrice.toFixed(2)}
                      </Td>
                      <Td isNumeric>₹{invested.toFixed(2)}</Td>
                      <Td isNumeric>₹{currentVal.toFixed(2)}</Td>
                      <Td isNumeric color={profitLoss >= 0 ? 'success.500' : 'error.500'}>
                        {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toFixed(2)}
                      </Td>
                      <Td isNumeric color={returnPercent >= 0 ? 'success.500' : 'error.500'}>
                        {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </Box>

        {/* Refresh Button */}
        <Box textAlign="center">
          <Button
            colorScheme="brand"
            onClick={fetchPortfolioData}
            isLoading={loading}
          >
            🔄 Refresh Portfolio
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default Portfolio;