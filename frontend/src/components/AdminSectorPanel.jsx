import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  useToast,
  Text,
  Radio,
  RadioGroup,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { adminAPI } from '../services/api';
import { useStocks } from '../context/StockContext';

const AdminSectorPanel = () => {
  const toast = useToast();
  const { refreshStocks } = useStocks();
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      const response = await adminAPI.getSectors();
      setSectors(response.data);
    } catch (error) {
      console.error('Failed to fetch sectors:', error);
    }
  };

  const handleAdjustPrices = async () => {
    if (!selectedSector || !adjustmentValue) {
      toast({
        title: 'Missing Information',
        description: 'Please select a sector and enter adjustment value',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const value = parseFloat(adjustmentValue);
    if (isNaN(value)) {
      toast({
        title: 'Invalid Value',
        description: 'Please enter a valid number',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Warn for large adjustments
    if (adjustmentType === 'percentage' && Math.abs(value) > 50) {
      if (!window.confirm(`Are you sure you want to adjust prices by ${value}%? This is a large change.`)) {
        return;
      }
    }

    try {
      setLoading(true);
      const response = await adminAPI.adjustSectorPrices({
        sector: selectedSector,
        adjustmentType,
        adjustmentValue: value,
      });

      toast({
        title: 'Prices Adjusted ✅',
        description: `${response.data.stocksUpdated} stocks in ${selectedSector} sector updated`,
        status: 'success',
        duration: 5000,
      });

      setAdjustmentValue('');
      await refreshStocks();
    } catch (error) {
      console.error('Adjust prices error:', error);
      toast({
        title: 'Adjustment Failed',
        description: error.response?.data?.error || 'Failed to adjust prices',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Sector-Based Price Adjustment
        </Text>
        <Alert status="info" mb={4}>
          <AlertIcon />
          Adjust prices for all stocks in a specific sector at once
        </Alert>
      </Box>

      <VStack spacing={4} align="stretch">
        {/* Sector Selection */}
        <FormControl isRequired>
          <FormLabel>Select Sector</FormLabel>
          <Select
            placeholder="Choose a sector"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Adjustment Type */}
        <FormControl isRequired>
          <FormLabel>Adjustment Type</FormLabel>
          <RadioGroup value={adjustmentType} onChange={setAdjustmentType}>
            <Stack direction="row" spacing={5}>
              <Radio value="percentage">Percentage (%)</Radio>
              <Radio value="absolute">Absolute Value (₹)</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        {/* Adjustment Value */}
        <FormControl isRequired>
          <FormLabel>
            Adjustment Value {adjustmentType === 'percentage' ? '(%)' : '(₹)'}
          </FormLabel>
          <Input
            type="number"
            step="0.01"
            placeholder={
              adjustmentType === 'percentage'
                ? 'e.g., -5 for 5% decrease, 10 for 10% increase'
                : 'e.g., -50 for ₹50 decrease, 100 for ₹100 increase'
            }
            value={adjustmentValue}
            onChange={(e) => setAdjustmentValue(e.target.value)}
          />
          <Text fontSize="sm" color="gray.400" mt={2}>
            {adjustmentType === 'percentage'
              ? 'Use negative values to decrease prices (e.g., -10 for 10% decrease)'
              : 'Use negative values to decrease prices (e.g., -50 for ₹50 decrease)'}
          </Text>
        </FormControl>

        {/* Preview */}
        {adjustmentValue && !isNaN(parseFloat(adjustmentValue)) && (
          <Box
            p={4}
            bg="rgba(0, 217, 255, 0.1)"
            borderRadius="md"
            border="1px solid"
            borderColor="rgba(0, 217, 255, 0.3)"
          >
            <Stat>
              <StatLabel>Preview</StatLabel>
              <StatNumber>
                {adjustmentType === 'percentage'
                  ? `${parseFloat(adjustmentValue) > 0 ? '+' : ''}${parseFloat(adjustmentValue)}%`
                  : `${parseFloat(adjustmentValue) > 0 ? '+' : ''}₹${Math.abs(parseFloat(adjustmentValue))}`}
              </StatNumber>
              <Text fontSize="sm" color="gray.400" mt={2}>
                Example: A stock at ₹1000 will become{' '}
                <strong>
                  ₹
                  {adjustmentType === 'percentage'
                    ? (1000 * (1 + parseFloat(adjustmentValue) / 100)).toFixed(2)
                    : (1000 + parseFloat(adjustmentValue)).toFixed(2)}
                </strong>
              </Text>
            </Stat>
          </Box>
        )}

        {/* Apply Button */}
        <Button
          colorScheme="brand"
          size="lg"
          onClick={handleAdjustPrices}
          isLoading={loading}
          isDisabled={!selectedSector || !adjustmentValue}
        >
          Apply Adjustment to {selectedSector || 'Selected Sector'}
        </Button>

        {/* Instructions */}
        <Box
          p={4}
          bg="rgba(255, 255, 255, 0.05)"
          borderRadius="md"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
        >
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            📌 Instructions:
          </Text>
          <VStack align="start" spacing={1} fontSize="sm" color="gray.400">
            <Text>• Select a sector to adjust all its stocks</Text>
            <Text>• Choose percentage (%) or absolute value (₹)</Text>
            <Text>• Enter positive value to increase, negative to decrease</Text>
            <Text>• Prices cannot go below ₹1</Text>
            <Text>• Changes apply immediately and update the database</Text>
          </VStack>
        </Box>
      </VStack>
    </VStack>
  );
};

export default AdminSectorPanel;
