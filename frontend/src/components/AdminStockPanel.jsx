import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Badge,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useStocks } from '../context/StockContext';
import { stockAPI, adminAPI } from '../services/api';
import './AdminStockPanel.css';

const AdminStockPanel = () => {
  const { stocks, refreshStocks } = useStocks();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    sector: '',
    currentPrice: '',
  });
  const [editingStock, setEditingStock] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector || '',
      currentPrice: stock.currentPrice.toString(),
    });
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.symbol || !formData.name || !formData.currentPrice) {
      toast({
        title: 'Missing Fields',
        description: 'Symbol, Name, and Price are required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const price = parseFloat(formData.currentPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Price must be a positive number',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      if (editingStock) {
        // Update existing stock
        await stockAPI.update(editingStock.id, {
          symbol: formData.symbol.trim().toUpperCase(),
          name: formData.name.trim(),
          sector: formData.sector ? formData.sector.trim() : null,
          currentPrice: price,
        });

        toast({
          title: 'Stock Updated ✅',
          description: `${formData.symbol.toUpperCase()} updated successfully`,
          status: 'success',
          duration: 3000,
        });
      } else {
        // Create new stock
        await stockAPI.create({
          symbol: formData.symbol.trim().toUpperCase(),
          name: formData.name.trim(),
          sector: formData.sector ? formData.sector.trim() : null,
          currentPrice: price,
        });

        toast({
          title: 'Stock Added ✅',
          description: `${formData.symbol.toUpperCase()} added successfully`,
          status: 'success',
          duration: 3000,
        });
      }

      setFormData({
        symbol: '',
        name: '',
        sector: '',
        currentPrice: '',
      });
      setEditingStock(null);
      onClose();
      await refreshStocks();
    } catch (error) {
      console.error('Stock operation error:', error);
      const errorMsg = error.response?.data?.error || 'Operation failed';
      toast({
        title: editingStock ? 'Update Failed' : 'Creation Failed',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, symbol) => {
    if (!window.confirm(`⚠️ FORCE DELETE: This will permanently delete ${symbol} and remove it from ALL user portfolios.\n\nThis action cannot be undone. Continue?`)) return;

    try {
      setLoading(true);
      const response = await adminAPI.deleteStock(id);
      toast({
        title: 'Stock Forcefully Deleted ✅',
        description: `${symbol} deleted: ${response.data.deletedHoldings} holdings removed, ${response.data.deletedTransactions} transactions removed`,
        status: 'success',
        duration: 5000,
      });
      await refreshStocks();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to delete stock';
      toast({
        title: 'Delete Failed',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingStock(null);
    setFormData({
      symbol: '',
      name: '',
      sector: '',
      currentPrice: '',
    });
    onOpen();
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Add/Edit Button */}
      <Button colorScheme="brand" onClick={handleAddNew}>
        ➕ Add New Stock
      </Button>

      {/* Stock List */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Listed Stocks ({stocks?.length || 0})
        </Text>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Symbol</Th>
                <Th>Company</Th>
                <Th>Sector</Th>
                <Th isNumeric>Price</Th>
                <Th isNumeric>Change %</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stocks?.map((stock) => (
                <Tr key={stock.id}>
                  <Td fontWeight="bold">{stock.symbol}</Td>
                  <Td>{stock.name}</Td>
                  <Td>
                    <Badge colorScheme="purple" fontSize="xs">
                      {stock.sector || 'N/A'}
                    </Badge>
                  </Td>
                  <Td isNumeric>₹{stock.currentPrice?.toFixed(2)}</Td>
                  <Td
                    isNumeric
                    color={stock.changePercent >= 0 ? 'green.400' : 'red.400'}
                  >
                    {stock.changePercent >= 0 ? '+' : ''}
                    {stock.changePercent?.toFixed(2)}%
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleEdit(stock)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(stock.id, stock.symbol)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>
            {editingStock ? `Edit ${editingStock.symbol}` : 'Add New Stock'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <HStack w="full" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Symbol</FormLabel>
                    <Input
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleChange}
                      placeholder="e.g., RELIANCE"
                      isDisabled={editingStock !== null}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Current Price</FormLabel>
                    <Input
                      name="currentPrice"
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={handleChange}
                      placeholder="e.g., 2500.50"
                    />
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Company Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Reliance Industries Ltd."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Sector</FormLabel>
                  <Input
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    placeholder="e.g., Energy, Technology"
                  />
                </FormControl>

                <HStack w="full" spacing={4}>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    w="full"
                    isLoading={loading}
                  >
                    {editingStock ? 'Update Stock' : 'Add Stock'}
                  </Button>
                  <Button w="full" onClick={onClose}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Button colorScheme="brand" onClick={refreshStocks}>
        🔄 Refresh Stock List
      </Button>
    </VStack>
  );
};

export default AdminStockPanel;