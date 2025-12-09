'use client';

/**
 * HelpProvider - Context provider for help system
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { HelpTopic, searchHelpTopics, getTopicById } from '@/lib/help/topics';

interface HelpContextType {
  // Current state
  currentTopicId: string | null;
  isPanelOpen: boolean;
  searchQuery: string;
  searchResults: HelpTopic[];
  recentTopics: string[];

  // Actions
  openTopic: (topicId: string) => void;
  closePanel: () => void;
  togglePanel: () => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  goBack: () => void;
  goForward: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

const MAX_RECENT_TOPICS = 10;
const RECENT_TOPICS_KEY = 'h2-tank-help-recent-topics';

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQueryState] = useState('');
  const [searchResults, setSearchResults] = useState<HelpTopic[]>([]);
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load recent topics from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_TOPICS_KEY);
      if (stored) {
        setRecentTopics(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent topics:', error);
    }
  }, []);

  // Save recent topics to localStorage
  const saveRecentTopics = useCallback((topics: string[]) => {
    try {
      localStorage.setItem(RECENT_TOPICS_KEY, JSON.stringify(topics));
    } catch (error) {
      console.error('Failed to save recent topics:', error);
    }
  }, []);

  // Open topic by ID
  const openTopic = useCallback(
    (topicId: string) => {
      const topic = getTopicById(topicId);
      if (!topic) {
        console.warn(`Topic not found: ${topicId}`);
        return;
      }

      setCurrentTopicId(topicId);
      setIsPanelOpen(true);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(topicId);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      // Add to recent topics (no duplicates, max 10)
      const newRecent = [topicId, ...recentTopics.filter((id) => id !== topicId)].slice(
        0,
        MAX_RECENT_TOPICS
      );
      setRecentTopics(newRecent);
      saveRecentTopics(newRecent);
    },
    [history, historyIndex, recentTopics, saveRecentTopics]
  );

  // Close panel
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  // Toggle panel
  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  // Set search query and update results
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    if (query.trim()) {
      const results = searchHelpTopics(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQueryState('');
    setSearchResults([]);
  }, []);

  // Go back in history
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentTopicId(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Go forward in history
  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentTopicId(history[newIndex]);
    }
  }, [history, historyIndex]);

  const value: HelpContextType = {
    currentTopicId,
    isPanelOpen,
    searchQuery,
    searchResults,
    recentTopics,
    openTopic,
    closePanel,
    togglePanel,
    setSearchQuery,
    clearSearch,
    goBack,
    goForward,
  };

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

/**
 * Hook to use help context
 */
export function useHelp() {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}
