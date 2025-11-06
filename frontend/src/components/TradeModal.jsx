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
} from '@chakra-ui/react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TradeModal = ({ isOpen, onClose, stock, defaultTab = 0 }) => {
  const { user, loadUser } = useAuth();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(defaultTab);

  useEffect(() => {
    setTabIndex(defaultTab);
  }, [defaultTab]);

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

      if (type === 'BUY') {
        await transactionAPI.buy({
          stockId: stock.id,
          quantity,
          price: stock.currentPrice,
        });
      } else {
        await transactionAPI.sell({
          stockId: stock.id,
          quantity,
          price: stock.currentPrice,
        });
      }

      toast({
        title: `${type === 'BUY' ? 'Purchase' : 'Sale'} successful!`,
        description: `${quantity} shares of ${stock.symbol} ${type === 'BUY' ? 'bought' : 'sold'} at ₹${stock.currentPrice}`,
        status: 'success',
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
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
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
                      isDisabled={totalAmount > user?.balance}
                    >
                      Buy {quantity} Shares
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
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>

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
                    >
                      Sell {quantity} Shares
                    </Button>
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