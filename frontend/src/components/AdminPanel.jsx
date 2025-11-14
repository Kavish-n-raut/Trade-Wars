import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import AdminStockPanel from './AdminStockPanel';
import AdminUsersPanel from './AdminUsersPanel';
import AdminNewsPanel from './AdminNewsPanel';
import AdminSectorPanel from './AdminSectorPanel';
import AdminTransactionsPanel from './AdminTransactionsPanel';
import { adminAPI } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2}>
            👑 Admin Panel
          </Heading>
          <Text color="gray.400">Manage stocks, news, and users</Text>
        </Box>

        {/* Stats Overview */}
        {stats && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Stat
              bg="rgba(26, 31, 46, 0.8)"
              p={6}
              borderRadius="16px"
              border="1px solid"
              borderColor="rgba(0, 217, 255, 0.2)"
            >
              <StatLabel>Total Users</StatLabel>
              <StatNumber>{stats.totalUsers || 0}</StatNumber>
              <StatHelpText>Registered traders</StatHelpText>
            </Stat>

            <Stat
              bg="rgba(26, 31, 46, 0.8)"
              p={6}
              borderRadius="16px"
              border="1px solid"
              borderColor="rgba(0, 217, 255, 0.2)"
            >
              <StatLabel>Total Stocks</StatLabel>
              <StatNumber>{stats.totalStocks || 0}</StatNumber>
              <StatHelpText>Listed companies</StatHelpText>
            </Stat>

            <Stat
              bg="rgba(26, 31, 46, 0.8)"
              p={6}
              borderRadius="16px"
              border="1px solid"
              borderColor="rgba(0, 217, 255, 0.2)"
            >
              <StatLabel>Total Transactions</StatLabel>
              <StatNumber>{stats.totalTransactions || 0}</StatNumber>
              <StatHelpText>Buy & Sell orders</StatHelpText>
            </Stat>

            <Stat
              bg="rgba(26, 31, 46, 0.8)"
              p={6}
              borderRadius="16px"
              border="1px solid"
              borderColor="rgba(0, 217, 255, 0.2)"
            >
              <StatLabel>News Articles</StatLabel>
              <StatNumber>{stats.totalNews || 0}</StatNumber>
              <StatHelpText>Published articles</StatHelpText>
            </Stat>
          </SimpleGrid>
        )}

        {/* Admin Tabs */}
        <Box
          bg="rgba(26, 31, 46, 0.8)"
          borderRadius="16px"
          border="1px solid"
          borderColor="rgba(0, 217, 255, 0.2)"
          p={6}
        >
                    <Tabs colorScheme="brand" variant="enclosed">
            <TabList>
              <Tab>📊 Stocks</Tab>
              <Tab>🏢 Sectors</Tab>
              <Tab>📰 News</Tab>
              <Tab>👥 Users</Tab>
              <Tab>💰 Transactions</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <AdminStockPanel />
              </TabPanel>

              <TabPanel>
                <AdminSectorPanel />
              </TabPanel>

              <TabPanel>
                <AdminNewsPanel />
              </TabPanel>

              <TabPanel>
                <AdminUsersPanel />
              </TabPanel>

              <TabPanel>
                <AdminTransactionsPanel />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
};

export default AdminPanel;