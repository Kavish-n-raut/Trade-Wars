import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { stockAPI } from '../services/api';
import { useAuth } from './AuthContext';

const StockContext = createContext();

export const useStocks = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStocks must be used within StockProvider');
  }
  return context;
};

export const StockProvider = ({ children }) => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchStocks = useCallback(async () => {
    if (!user) return; // Don't fetch if not logged in

    try {
      setLoading(true);
      setError(null);
      const response = await stockAPI.getAll();
      setStocks(response.data);
      setLastUpdate(new Date());
      console.log('✅ Stocks updated:', response.data.length);
    } catch (err) {
      console.error('❌ Failed to fetch stocks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshStocks = useCallback(async () => {
    await fetchStocks();
  }, [fetchStocks]);

  // Initial fetch when user logs in
  useEffect(() => {
    if (user) {
      fetchStocks();
    } else {
      setStocks([]);
      setLastUpdate(null);
    }
  }, [user, fetchStocks]);

  // Auto-refresh every 5 minutes if user is logged in
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing stocks...');
      fetchStocks();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, fetchStocks]);

  const value = {
    stocks,
    loading,
    error,
    lastUpdate,
    refreshStocks,
    fetchStocks,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};