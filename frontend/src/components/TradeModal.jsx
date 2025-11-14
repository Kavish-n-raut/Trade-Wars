import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react';
import { transactionAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TradeModal = ({ isOpen, onClose, stock, defaultTab = 0 }) => {
  const { user, loadUser } = useAuth();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(defaultTab);
  const [holding, setHolding] = useState(null);

  useEffect(() => {
    setTabIndex(defaultTab);
  }, [defaultTab]);

  // Fetch user's holding for this stock
  useEffect(() => {
    const fetchHolding = async () => {
      if (!stock || !isOpen) return;
      try {
        const response = await userAPI.getHoldings();
        const userHolding = response.data.find(h => h.stockId === stock.id);
        setHolding(userHolding || null);
      } catch (error) {
        console.error('Failed to fetch holding:', error);
      }
    };
    fetchHolding();
  }, [stock, isOpen]);

  const handleTrade = async (type) => {
    if (quantity <= 0) {
      toast({
        title: 'Invalid quantity',
        description: 'Please enter a valid quantity',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const totalAmount = stock.currentPrice * quantity;

    // Validation
    if (type === 'BUY' && totalAmount > user.balance) {
      toast({
        title: 'Insufficient balance',
        description: `You need ₹${totalAmount.toLocaleString('en-IN')} but have ₹${user.balance.toLocaleString('en-IN')}`,
        status: 'error',
        duration: 5000,
      });
      return;
    }

    try {
      setLoading(true);

      let response;
      if (type === 'BUY') {
        response = await transactionAPI.buy({
          stockId: stock.id,
          quantity,
          price: stock.currentPrice,
        });
      } else {
        response = await transactionAPI.sell({
          stockId: stock.id,
          quantity,
          price: stock.currentPrice,
        });
      }

      // Show detailed toast with P/L for sells
      const isProfit = type === 'SELL' && response.data.realizedProfitLoss >= 0;
      const plAmount = response.data.realizedProfitLoss;
      
      toast({
        title: `${type === 'BUY' ? 'Purchase' : 'Sale'} successful!`,
        description: type === 'SELL' && plAmount !== undefined
          ? `${quantity} shares of ${stock.symbol} sold at ₹${stock.currentPrice}. ${isProfit ? 'Profit' : 'Loss'}: ${plAmount >= 0 ? '+' : ''}₹${Math.abs(plAmount).toFixed(2)}`
          : `${quantity} shares of ${stock.symbol} ${type === 'BUY' ? 'bought' : 'sold'} at ₹${stock.currentPrice}`,
        status: type === 'SELL' ? (isProfit ? 'success' : 'warning') : 'success',
        duration: 5000,
      });

      // Reload user data
      await loadUser();

      // Close modal and reset
      onClose();
      setQuantity(1);
    } catch (error) {
      toast({
        title: `${type === 'BUY' ? 'Purchase' : 'Sale'} failed`,
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = stock ? stock.currentPrice * quantity : 0;
  
  // Calculate expected P/L for sell
  const expectedPL = holding 
    ? (stock.currentPrice - holding.averagePrice) * quantity 
    : 0;
  const plPercent = holding && holding.averagePrice > 0
    ? ((stock.currentPrice - holding.averagePrice) / holding.averagePrice) * 100
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent
        bg="rgba(26, 31, 46, 0.95)"
        border="1px solid"
        borderColor="rgba(0, 217, 255, 0.2)"
      >
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl">{stock?.symbol}</Text>
            <Text fontSize="sm" color="gray.400" fontWeight="normal">
              {stock?.name}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Circuit Breaker Warning */}
            {stock?.circuitTripped && (
              <Box
                p={4}
                bg="rgba(255, 0, 0, 0.1)"
                borderRadius="md"
                border="2px solid"
                borderColor="red.500"
              >
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Text fontSize="lg" fontWeight="bold" color="red.400">
                      🔴 TRADING HALTED
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.300">
                    {stock.circuitType} Circuit Breaker Triggered (±25% limit)
                  </Text>
                  <HStack spacing={4} fontSize="sm">
                    <Text>Open: ₹{stock.openPrice?.toFixed(2)}</Text>
                    <Text>Current: ₹{stock.currentPrice?.toFixed(2)}</Text>
                    <Text color={stock.changePercent >= 0 ? 'green.400' : 'red.400'}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            )}

            {/* Current Price */}
            <Box
              p={4}
              bg="rgba(0, 217, 255, 0.1)"
              borderRadius="md"
              border="1px solid"
              borderColor="rgba(0, 217, 255, 0.3)"
            >
              <Stat>
                <StatLabel>Current Price</StatLabel>
                <StatNumber>₹{stock?.currentPrice.toFixed(2)}</StatNumber>
                <StatHelpText color={stock?.changePercent >= 0 ? 'success.500' : 'error.500'}>
                  {stock?.changePercent >= 0 ? '+' : ''}{stock?.changePercent.toFixed(2)}% today
                </StatHelpText>
              </Stat>
            </Box>

            {/* Tabs */}
            <Tabs
              index={tabIndex}
              onChange={setTabIndex}
              colorScheme="brand"
              variant="enclosed"
            >
              <TabList>
                <Tab>Buy</Tab>
                <Tab>Sell</Tab>
              </TabList>

              <TabPanels>
                {/* BUY Tab */}
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Quantity</FormLabel>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setQuantity('');
                          } else {
                            setQuantity(parseInt(val) || '');
                          }
                        }}
                        onBlur={() => {
                          if (quantity === '' || quantity === 0) {
                            setQuantity(1);
                          }
                        }}
                      />
                    </FormControl>

                    <Box
                      w="100%"
                      p={4}
                      bg="rgba(0, 217, 255, 0.05)"
                      borderRadius="md"
                    >
                      <HStack justify="space-between">
                        <Text color="gray.400">Total Amount:</Text>
                        <Text fontSize="xl" fontWeight="bold">
                          ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" mt={2}>
                        <Text color="gray.400" fontSize="sm">Available Balance:</Text>
                        <Text fontSize="sm">₹{user?.balance?.toLocaleString('en-IN')}</Text>
                      </HStack>
                    </Box>

                    <Button
                      w="100%"
                      size="lg"
                      bgGradient="linear(to-r, #00d9ff, #00ffb3)"
                      color="white"
                      onClick={() => handleTrade('BUY')}
                      isLoading={loading}
                      isDisabled={totalAmount > user?.balance || stock?.circuitTripped}
                    >
                      {stock?.circuitTripped ? 'Trading Halted' : `Buy ${quantity} Shares`}
                    </Button>
                  </VStack>
                </TabPanel>

                {/* SELL Tab */}
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Quantity</FormLabel>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setQuantity('');
                          } else {
                            setQuantity(parseInt(val) || '');
                          }
                        }}
                        onBlur={() => {
                          if (quantity === '' || quantity === 0) {
                            setQuantity(1);
                          }
                        }}
                        isDisabled={stock?.circuitTripped}
                      />
                    </FormControl>

                    {holding && (
                      <Box
                        w="100%"
                        p={3}
                        bg="rgba(124, 58, 237, 0.1)"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(124, 58, 237, 0.3)"
                      >
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.400">You own:</Text>
                          <Text fontWeight="bold">{holding.quantity} shares</Text>
                        </HStack>
                        <HStack justify="space-between" fontSize="sm" mt={1}>
                          <Text color="gray.400">Avg. Price:</Text>
                          <Text>₹{holding.averagePrice.toFixed(2)}</Text>
                        </HStack>
                      </Box>
                    )}

                    <Box
                      w="100%"
                      p={4}
                      bg="rgba(255, 82, 82, 0.05)"
                      borderRadius="md"
                    >
                      <HStack justify="space-between">
                        <Text color="gray.400">Total Amount:</Text>
                        <Text fontSize="xl" fontWeight="bold">
                          ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Text>
                      </HStack>
                      
                      {holding && (
                        <>
                          <Divider my={2} />
                          <HStack justify="space-between">
                            <Text color="gray.400">Expected P/L:</Text>
                            <VStack align="end" spacing={0}>
                              <Text 
                                fontSize="lg" 
                                fontWeight="bold"
                                color={expectedPL >= 0 ? 'success.500' : 'error.500'}
                              >
                                {expectedPL >= 0 ? '+' : ''}₹{Math.abs(expectedPL).toFixed(2)}
                              </Text>
                              <Text 
                                fontSize="sm"
                                color={plPercent >= 0 ? 'success.500' : 'error.500'}
                              >
                                ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                              </Text>
                            </VStack>
                          </HStack>
                        </>
                      )}
                    </Box>

                    <Button
                      w="100%"
                      size="lg"
                      bg="rgba(255, 82, 82, 0.2)"
                      color="error.500"
                      border="1px solid"
                      borderColor="error.500"
                      _hover={{
                        bg: 'rgba(255, 82, 82, 0.3)',
                      }}
                      onClick={() => handleTrade('SELL')}
                      isLoading={loading}
                      isDisabled={!holding || quantity > holding.quantity || stock?.circuitTripped}
                    >
                      {stock?.circuitTripped ? 'Trading Halted' : `Sell ${quantity} Shares`}
                    </Button>
                    
                    {!holding && (
                      <Text fontSize="sm" color="gray.500" textAlign="center">
                        You don't own any shares of this stock
                      </Text>
                    )}
                    {holding && quantity > holding.quantity && (
                      <Text fontSize="sm" color="error.500" textAlign="center">
                        You only own {holding.quantity} shares
                      </Text>
                    )}
                    {stock?.circuitTripped && (
                      <Text fontSize="sm" color="red.400" textAlign="center" fontWeight="bold">
                        ⚠️ Trading is currently halted due to circuit breaker
                      </Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TradeModal;