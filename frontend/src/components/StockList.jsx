import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Text,
  Badge,
  Spinner,
  Select,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { useStocks } from '../context/StockContext';
import './StockList.css';

const StockList = ({ onSelectStock }) => {
  const { user } = useAuth();
  const { stocks, loading, error } = useStocks();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('symbol');

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4} color="gray.400">Loading stocks...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="error.500" fontSize="xl">Failed to load stocks</Text>
        <Text color="gray.400" mt={2}>{error}</Text>
      </Box>
    );
  }

  // Get unique sectors
  const sectors = ['ALL', ...new Set(stocks.map(s => s.sector).filter(Boolean))];

  // Filter stocks
  let filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || stock.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  // Sort stocks
  filteredStocks.sort((a, b) => {
    switch (sortBy) {
      case 'symbol':
        return a.symbol.localeCompare(b.symbol);
      case 'price':
        return b.currentPrice - a.currentPrice;
      case 'change':
        return b.changePercent - a.changePercent;
      default:
        return 0;
    }
  });

  return (
    <VStack spacing={6} align="stretch" className="stock-list-container">
      <Box>
        <Heading size="lg" mb={4}>
          📊 Live Stock Prices
        </Heading>

        {/* Filters */}
        <HStack spacing={4} mb={4} flexWrap="wrap" className="filters-section">
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            maxW="200px"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </Select>

          <Select
            maxW="200px"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="symbol">Symbol</option>
            <option value="price">Price</option>
            <option value="change">Change %</option>
          </Select>
        </HStack>
      </Box>

      {/* Stock Table */}
      <Box className="stock-table-container">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Symbol</Th>
              <Th>Company</Th>
              <Th>Sector</Th>
              <Th isNumeric>Current Price</Th>
              <Th isNumeric>Change</Th>
              <Th isNumeric>Change %</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredStocks.map((stock) => (
              <Tr
                key={stock.id}
                className="stock-row"
                cursor="pointer"
                opacity={stock.circuitTripped ? 0.6 : 1}
              >
                <Td fontWeight="bold" className="stock-symbol">
                  {stock.symbol}
                </Td>
                <Td>{stock.name}</Td>
                <Td>
                  <Badge colorScheme="purple" fontSize="xs">
                    {stock.sector || 'N/A'}
                  </Badge>
                </Td>
                <Td isNumeric fontWeight="bold">
                  ₹{stock.currentPrice?.toFixed(2) || '0.00'}
                </Td>
                <Td isNumeric className={stock.change >= 0 ? 'price-positive' : 'price-negative'}>
                  {stock.change >= 0 ? '+' : ''}₹{stock.change?.toFixed(2) || '0.00'}
                </Td>
                <Td isNumeric className={stock.changePercent >= 0 ? 'price-positive' : 'price-negative'}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%
                </Td>
                <Td>
                  {stock.circuitTripped ? (
                    <Badge colorScheme="red" fontSize="xs">
                      🔴 {stock.circuitType} CIRCUIT
                    </Badge>
                  ) : (
                    <Badge colorScheme="green" fontSize="xs">
                      ✅ ACTIVE
                    </Badge>
                  )}
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="brand"
                    className="trade-button"
                    onClick={() => onSelectStock && onSelectStock(stock)}
                    isDisabled={stock.circuitTripped}
                  >
                    {stock.circuitTripped ? 'Halted' : 'Trade'}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {filteredStocks.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color="gray.400">No stocks found</Text>
          </Box>
        )}
      </Box>

      <Text fontSize="sm" color="gray.500" textAlign="center">
        Showing {filteredStocks.length} of {stocks.length} stocks
      </Text>
    </VStack>
  );
};

export default StockList;