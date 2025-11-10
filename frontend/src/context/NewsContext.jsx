import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { newsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NewsContext = createContext();

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within NewsProvider');
  }
  return context;
};

export const NewsProvider = ({ children }) => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async (filters = {}) => {
    if (!user) return; // Don't fetch if not logged in

    try {
      setLoading(true);
      setError(null);
      // Fetch more news by default (up to 50)
      const response = await newsAPI.getAll({ limit: 50, ...filters });
      setNews(response.data);
      console.log('✅ News updated:', response.data.length, 'articles');
    } catch (err) {
      console.error('❌ Failed to fetch news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshNews = useCallback(async () => {
    await fetchNews();
  }, [fetchNews]);

  // Initial fetch when user logs in
  useEffect(() => {
    if (user) {
      fetchNews();
    } else {
      setNews([]);
    }
  }, [user, fetchNews]);

  // Auto-refresh every 30 minutes if user is logged in
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing news...');
      fetchNews();
    }, 1800000); // 30 minutes

    return () => clearInterval(interval);
  }, [user, fetchNews]);

  const value = {
    news,
    loading,
    error,
    fetchNews,
    refreshNews,
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};