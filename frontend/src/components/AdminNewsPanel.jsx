import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
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
  Badge,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useNews } from '../context/NewsContext';
import { newsAPI } from '../services/api';

const AdminNewsPanel = () => {
  const { news, refreshNews } = useNews();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
    source: '',
    symbol: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url || !formData.source) {
      toast({
        title: 'Missing Fields',
        description: 'Title, URL, and Source are required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await newsAPI.create(formData);

      toast({
        title: 'News Created ✅',
        description: 'News article added successfully',
        status: 'success',
        duration: 3000,
      });

      setFormData({
        title: '',
        description: '',
        url: '',
        imageUrl: '',
        source: '',
        symbol: '',
      });

      await refreshNews();
    } catch (error) {
      console.error('Create news error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create news',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      await newsAPI.delete(id);
      toast({
        title: 'Deleted ✅',
        description: 'News article deleted successfully',
        status: 'success',
        duration: 3000,
      });
      await refreshNews();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Add News Form */}
      <Box p={6} bg="gray.700" borderRadius="lg">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Add News Article
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <HStack w="full" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="News headline"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Source</FormLabel>
                <Input
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="e.g., Economic Times"
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description"
                rows={3}
              />
            </FormControl>

            <HStack w="full" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Article URL</FormLabel>
                <Input
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com/article"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Stock Symbol (Optional)</FormLabel>
              <Input
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="e.g., RELIANCE"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="brand"
              w="full"
              isLoading={loading}
            >
              Add News Article
            </Button>
          </VStack>
        </form>
      </Box>

      {/* News List */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Existing News Articles ({news?.length || 0})
        </Text>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Source</Th>
                <Th>Symbol</Th>
                <Th>Published</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {news?.map((article) => (
                <Tr key={article.id}>
                  <Td maxW="300px" isTruncated>{article.title}</Td>
                  <Td>
                    <Badge colorScheme="brand" fontSize="xs">{article.source}</Badge>
                  </Td>
                  <Td>
                    {article.symbol && (
                      <Badge colorScheme="purple" fontSize="xs">{article.symbol}</Badge>
                    )}
                  </Td>
                  <Td fontSize="xs">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </Td>
                  <Td>
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Button colorScheme="brand" onClick={refreshNews}>
        🔄 Refresh News List
      </Button>
    </VStack>
  );
};

export default AdminNewsPanel;