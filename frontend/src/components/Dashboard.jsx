import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  VStack,
  HStack,
  useToast,
  Badge,
  Grid,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStocks } from '../context/StockContext';
import { stockAPI } from '../services/api';
import StockList from './StockList';
import TradeModal from './TradeModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { stocks, loading, lastUpdate, refreshStocks } = useStocks();
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedStock, setSelectedStock] = useState(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [trendingStocks, setTrendingStocks] = useState({ mostBought: [], mostSold: [] });

  // Fetch trending stocks
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await stockAPI.getTrending();
        setTrendingStocks(response.data);
      } catch (error) {
        console.error('Failed to fetch trending stocks:', error);
      }
    };
    fetchTrending();
    // Refresh trending stocks every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    setIsTradeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTradeModalOpen(false);
    setSelectedStock(null);
  };

  const handleRefresh = () => {
    refreshStocks();
    toast({
      title: 'Refreshing stocks...',
      status: 'info',
      duration: 2000,
    });
  };

  // Calculate portfolio stats
  const totalInvested = user?.portfolioValue - user?.balance || 0;
  const profitLoss = user?.profitLoss || 0;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  // Market stats
  const gainers = stocks.filter(s => s.changePercent > 0).length;
  const losers = stocks.filter(s => s.changePercent < 0).length;
  const totalStocks = stocks.length;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Welcome back, {user?.username}! 👋
          </Heading>
          <Text color="gray.400">
            Track live stock prices and manage your portfolio
          </Text>
        </Box>

        {/* Portfolio Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Stat
            bg="rgba(26, 31, 46, 0.8)"
            p={6}
            borderRadius="16px"
            border="1px solid"
            borderColor="rgba(0, 217, 255, 0.2)"
          >
            <StatLabel>Portfolio Value</StatLabel>
            <StatNumber>₹{user?.portfolioValue?.toLocaleString('en-IN')}</StatNumber>
            <StatHelpText>Total holdings + cash</StatHelpText>
          </Stat>

          <Stat
            bg="rgba(26, 31, 46, 0.8)"
            p={6}
            borderRadius="16px"
            border="1px solid"
            borderColor="rgba(0, 217, 255, 0.2)"
          >
            <StatLabel>Available Cash</StatLabel>
            <StatNumber>₹{user?.balance?.toLocaleString('en-IN')}</StatNumber>
            <StatHelpText>Ready to invest</StatHelpText>
          </Stat>

          <Stat
            bg="rgba(26, 31, 46, 0.8)"
            p={6}
            borderRadius="16px"
            border="1px solid"
            borderColor={profitLoss >= 0 ? 'rgba(0, 255, 179, 0.2)' : 'rgba(255, 82, 82, 0.2)'}
          >
            <StatLabel>Profit/Loss</StatLabel>
            <StatNumber color={profitLoss >= 0 ? 'success.500' : 'error.500'}>
              {profitLoss >= 0 ? '+' : ''}₹{Math.abs(profitLoss).toLocaleString('en-IN')}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={profitLoss >= 0 ? 'increase' : 'decrease'} />
              {profitLossPercent.toFixed(2)}%
            </StatHelpText>
          </Stat>

          <Stat
            bg="rgba(26, 31, 46, 0.8)"
            p={6}
            borderRadius="16px"
            border="1px solid"
            borderColor="rgba(124, 58, 237, 0.2)"
          >
            <StatLabel>Market Overview</StatLabel>
            <StatNumber fontSize="lg">
              <HStack spacing={2}>
                <Text color="success.500">↑{gainers}</Text>
                <Text color="gray.400">/</Text>
                <Text color="error.500">↓{losers}</Text>
              </HStack>
            </StatNumber>
            <StatHelpText>{totalStocks} total stocks</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Trending Stocks Section */}
        {(trendingStocks.mostBought.length > 0 || trendingStocks.mostSold.length > 0) && (
          <Box>
            <Heading size="md" mb={4}>
              🔥 Trending Stocks (Last 24h)
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Most Bought */}
              {trendingStocks.mostBought.length > 0 && (
                <Box
                  bg="rgba(26, 31, 46, 0.8)"
                  p={6}
                  borderRadius="16px"
                  border="1px solid"
                  borderColor="rgba(0, 255, 179, 0.3)"
                >
                  <HStack mb={4}>
                    <Text fontSize="lg" fontWeight="bold" color="success.500">
                      📈 Most Bought
                    </Text>
                  </HStack>
                  <VStack align="stretch" spacing={3}>
                    {trendingStocks.mostBought.map((stock, index) => (
                      <Flex
                        key={stock.id}
                        justify="space-between"
                        align="center"
                        p={3}
                        bg="rgba(0, 255, 179, 0.05)"
                        borderRadius="8px"
                        _hover={{ bg: 'rgba(0, 255, 179, 0.1)', cursor: 'pointer' }}
                        onClick={() => handleSelectStock(stock)}
                      >
                        <HStack>
                          <Badge colorScheme="green">{index + 1}</Badge>
                          <Box>
                            <Text fontWeight="bold">{stock.symbol}</Text>
                            <Text fontSize="xs" color="gray.400">
                              {stock.totalQuantity} shares bought
                            </Text>
                          </Box>
                        </HStack>
                        <Box textAlign="right">
                          <Text fontWeight="bold">₹{stock.currentPrice.toFixed(2)}</Text>
                          <Text
                            fontSize="sm"
                            color={stock.changePercent >= 0 ? 'success.500' : 'error.500'}
                          >
                            {stock.changePercent >= 0 ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </Text>
                        </Box>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Most Sold */}
              {trendingStocks.mostSold.length > 0 && (
                <Box
                  bg="rgba(26, 31, 46, 0.8)"
                  p={6}
                  borderRadius="16px"
                  border="1px solid"
                  borderColor="rgba(255, 82, 82, 0.3)"
                >
                  <HStack mb={4}>
                    <Text fontSize="lg" fontWeight="bold" color="error.500">
                      📉 Most Sold
                    </Text>
                  </HStack>
                  <VStack align="stretch" spacing={3}>
                    {trendingStocks.mostSold.map((stock, index) => (
                      <Flex
                        key={stock.id}
                        justify="space-between"
                        align="center"
                        p={3}
                        bg="rgba(255, 82, 82, 0.05)"
                        borderRadius="8px"
                        _hover={{ bg: 'rgba(255, 82, 82, 0.1)', cursor: 'pointer' }}
                        onClick={() => handleSelectStock(stock)}
                      >
                        <HStack>
                          <Badge colorScheme="red">{index + 1}</Badge>
                          <Box>
                            <Text fontWeight="bold">{stock.symbol}</Text>
                            <Text fontSize="xs" color="gray.400">
                              {stock.totalQuantity} shares sold
                            </Text>
                          </Box>
                        </HStack>
                        <Box textAlign="right">
                          <Text fontWeight="bold">₹{stock.currentPrice.toFixed(2)}</Text>
                          <Text
                            fontSize="sm"
                            color={stock.changePercent >= 0 ? 'success.500' : 'error.500'}
                          >
                            {stock.changePercent >= 0 ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </Text>
                        </Box>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}
            </SimpleGrid>
          </Box>
        )}

        {/* Quick Actions */}
        <HStack spacing={4}>
          <Button
            size="lg"
            bgGradient="linear(to-r, #00d9ff, #7c3aed)"
            color="white"
            _hover={{
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(0, 217, 255, 0.4)',
            }}
            onClick={() => navigate('/portfolio')}
          >
            📊 View Portfolio
          </Button>
          <Button
            size="lg"
            variant="outline"
            borderColor="brand.500"
            color="brand.500"
            _hover={{
              bg: 'rgba(0, 217, 255, 0.1)',
            }}
            onClick={() => navigate('/news')}
          >
            📰 Market News
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={handleRefresh}
            isLoading={loading}
          >
            🔄 Refresh
          </Button>
        </HStack>

        {/* Stock List */}
        <Box>
          <StockList onSelectStock={handleSelectStock} />
        </Box>

        {/* Last Update Info */}
        {lastUpdate && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </Text>
        )}
      </VStack>

      {/* Trade Modal */}
      {selectedStock && (
        <TradeModal
          isOpen={isTradeModalOpen}
          onClose={handleCloseModal}
          stock={selectedStock}
        />
      )}
    </Container>
  );
};

export default Dashboard;