import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Image,
  VStack,
  Badge,
  Spinner,
  Button,
} from '@chakra-ui/react';
import { useNews } from '../context/NewsContext';

const News = () => {
  const { news, loading, error, refreshNews } = useNews();

  useEffect(() => {
    console.log('📰 News component mounted, articles:', news.length);
  }, [news]);

  if (loading && news.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={12}>
          <Spinner size="xl" color="brand.500" />
          <Text mt={4} color="gray.400">Loading news...</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Heading size="xl" mb={2}>
              📰 Market News
            </Heading>
            <Text color="gray.400">Stay updated with the latest market trends</Text>
          </Box>
          <Button
            colorScheme="brand"
            onClick={refreshNews}
            isLoading={loading}
          >
            🔄 Refresh
          </Button>
        </Box>

        {error && (
          <Box bg="red.900" p={4} borderRadius="md">
            <Text color="red.200">Error loading news: {error}</Text>
          </Box>
        )}

        {/* News Grid */}
        {news.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="xl" color="gray.400">No news articles available</Text>
            <Text color="gray.500" mt={2}>Check back later for updates</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {news.map((article) => (
              <Box
                key={article.id}
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
                  />
                )}
                <VStack align="stretch" p={6} spacing={3}>
                  <Badge colorScheme="brand" alignSelf="flex-start">
                    {article.source}
                  </Badge>
                  {article.symbol && (
                    <Badge colorScheme="purple" alignSelf="flex-start">
                      {article.symbol}
                    </Badge>
                  )}
                  <Heading size="md" noOfLines={2}>
                    {article.title}
                  </Heading>
                  <Text color="gray.400" noOfLines={3}>
                    {article.description}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {article.url && (
                    <Button
                      as="a"
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      colorScheme="brand"
                      size="sm"
                      mt={2}
                    >
                      Read More
                    </Button>
                  )}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        )}

        <Text textAlign="center" color="gray.500" fontSize="sm">
          Showing {news.length} articles
        </Text>
      </VStack>
    </Container>
  );
};

export default News;