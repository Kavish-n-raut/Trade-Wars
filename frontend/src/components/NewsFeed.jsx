import React, { useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Image,
  VStack,
  Badge,
  Spinner,
  Button,
  Heading,
} from '@chakra-ui/react';
import { useNews } from '../context/NewsContext';
import './NewsFeed.css';

const NewsFeed = () => {
  const { news, loading, error, refreshNews } = useNews();

  useEffect(() => {
    console.log('📰 NewsFeed mounted, articles:', news?.length || 0);
  }, [news]);

  if (loading && (!news || news.length === 0)) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4} color="gray.400">Loading news...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="error.500" fontSize="xl">Failed to load news</Text>
        <Text color="gray.400" mt={2}>{error}</Text>
        <Button mt={4} colorScheme="brand" onClick={refreshNews}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Box textAlign="center" py={12}>
        <Text fontSize="xl" color="gray.400">No news articles available</Text>
        <Text color="gray.500" mt={2}>Check back later for updates</Text>
      </Box>
    );
  }

  return (
    <Box className="news-feed">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Text color="gray.400">{news.length} articles</Text>
        <Button
          colorScheme="brand"
          size="sm"
          onClick={refreshNews}
          isLoading={loading}
        >
          🔄 Refresh
        </Button>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {news.map((article) => (
          <Box
            key={article.id}
            className="news-card"
            bg="rgba(26, 31, 46, 0.8)"
            borderRadius="16px"
            border="1px solid"
            borderColor="rgba(0, 217, 255, 0.2)"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 30px rgba(0, 217, 255, 0.3)',
            }}
          >
            {article.imageUrl && (
              <Image
                src={article.imageUrl}
                alt={article.title}
                h="200px"
                w="full"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/400x200?text=No+Image"
              />
            )}
            <VStack align="stretch" p={6} spacing={3}>
              <Box>
                <Badge colorScheme="brand" fontSize="xs" mr={2}>
                  {article.source}
                </Badge>
                {article.symbol && (
                  <Badge colorScheme="purple" fontSize="xs">
                    {article.symbol}
                  </Badge>
                )}
              </Box>
              <Heading size="sm" noOfLines={2}>
                {article.title}
              </Heading>
              {article.description && (
                <Text color="gray.400" fontSize="sm" noOfLines={4}>
                  {article.description}
                </Text>
              )}
              <Text fontSize="xs" color="gray.500">
                {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {/* REMOVED "Read More" Button */}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default NewsFeed;