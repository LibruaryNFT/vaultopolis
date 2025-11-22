// src/context/TransactionCenterContext.js
// UI-only transaction center context - does NOT modify UserContext or transaction logic
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TransactionCenterContext = createContext();

export const useTransactionCenter = () => {
  const context = useContext(TransactionCenterContext);
  if (!context) {
    throw new Error('useTransactionCenter must be used within TransactionCenterProvider');
  }
  return context;
};

// Storage keys for UI-level persistence
const STORAGE_KEY_ACTIVE = 'vaultopolis_transactions_active';
const STORAGE_KEY_RECENT = 'vaultopolis_transactions_recent';

// Maximum age for recent transactions (24 hours in ms)
const RECENT_TX_MAX_AGE = 24 * 60 * 60 * 1000;

/**
 * Generate a unique transaction ID for UI tracking.
 * Uses txId if available, otherwise generates one.
 */
const generateTransactionId = (txData) => {
  if (txData.txId) {
    return `tx_${txData.txId}`;
  }
  // Generate ID based on transaction data to ensure uniqueness
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const action = txData.transactionAction || txData.swapType || 'unknown';
  return `ui_${action}_${timestamp}_${random}`;
};

/**
 * Clean up old transactions from recent list
 */
const cleanupOldTransactions = (recentTransactions) => {
  const now = Date.now();
  return recentTransactions.filter((tx) => {
    const txTimestamp = tx.timestamp || tx._uiTimestamp || 0;
    return now - txTimestamp < RECENT_TX_MAX_AGE;
  });
};

/**
 * Load transactions from localStorage
 */
const loadFromStorage = () => {
  try {
    const activeRaw = localStorage.getItem(STORAGE_KEY_ACTIVE);
    const recentRaw = localStorage.getItem(STORAGE_KEY_RECENT);
    
    const active = activeRaw ? JSON.parse(activeRaw) : [];
    const recent = recentRaw ? JSON.parse(recentRaw) : [];
    
    // Clean up old transactions
    const cleanedRecent = cleanupOldTransactions(recent);
    if (cleanedRecent.length !== recent.length) {
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(cleanedRecent));
    }
    
    return { active, recent: cleanedRecent };
  } catch (error) {
    console.warn('[TransactionCenter] Failed to load from storage:', error);
    return { active: [], recent: [] };
  }
};

/**
 * Save transactions to localStorage
 */
const saveToStorage = (activeTransactions, recentTransactions) => {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeTransactions));
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentTransactions));
  } catch (error) {
    console.warn('[TransactionCenter] Failed to save to storage:', error);
  }
};

export const TransactionCenterProvider = ({ children }) => {
  // Load initial state from localStorage
  const initialData = loadFromStorage();
  
  const [activeTransactions, setActiveTransactions] = useState(initialData.active);
  const [recentTransactions, setRecentTransactions] = useState(initialData.recent);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    saveToStorage(activeTransactions, recentTransactions);
  }, [activeTransactions, recentTransactions]);

  /**
   * Add or update a transaction
   * This is the main entry point for pages to report transaction state
   */
  const addOrUpdateTransaction = useCallback((txData) => {
    // Generate UI ID and timestamp if not present
    const uiId = txData._uiId || generateTransactionId(txData);
    const timestamp = txData.timestamp || txData._uiTimestamp || Date.now();
    
    const enrichedTx = {
      ...txData,
      _uiId: uiId,
      _uiTimestamp: timestamp,
    };

    setActiveTransactions((prev) => {
      // Check if transaction already exists
      // First, try to match by _uiId (most reliable)
      let existingIndex = prev.findIndex((tx) => tx._uiId === uiId);
      
      // If not found by _uiId and we have a txId, try to match by txId
      // (but only if the txId exists and no _uiId match was found)
      if (existingIndex < 0 && enrichedTx.txId) {
        existingIndex = prev.findIndex((tx) => tx.txId === enrichedTx.txId);
      }
      
      if (existingIndex >= 0) {
        // Update existing transaction
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...enrichedTx };
        return updated;
      } else {
        // Add new transaction
        return [...prev, enrichedTx];
      }
    });

    // Return the UI ID so callers can reference it
    return uiId;
  }, []);

  /**
   * Mark a transaction as complete (move to recent)
   */
  const completeTransaction = useCallback((txId) => {
    setActiveTransactions((prev) => {
      const tx = prev.find((t) => t._uiId === txId || t.txId === txId);
      if (!tx) return prev;

      // Move to recent
      setRecentTransactions((recent) => {
        const updated = [...recent, { ...tx, _uiCompletedAt: Date.now() }];
        // Keep only last 50 recent transactions
        return updated.slice(-50);
      });

      // Remove from active
      return prev.filter((t) => t._uiId !== txId && t.txId !== txId);
    });
  }, []);

  /**
   * Remove a transaction (user dismissal)
   */
  const removeTransaction = useCallback((txId) => {
    setActiveTransactions((prev) => prev.filter((t) => t._uiId !== txId && t.txId !== txId));
    setRecentTransactions((prev) => prev.filter((t) => t._uiId !== txId && t.txId !== txId));
  }, []);

  /**
   * Open the transaction drawer
   * If txId provided, selects that transaction
   */
  const openTransactionDrawer = useCallback((txId = null) => {
    if (txId) {
      setSelectedTransactionId(txId);
    }
    setIsDrawerOpen(true);
  }, []);

  /**
   * Close the transaction drawer
   */
  const closeTransactionDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    // Optionally clear selection after a delay
    setTimeout(() => setSelectedTransactionId(null), 300);
  }, []);

  /**
   * Get the selected transaction for drawer display
   */
  const getSelectedTransaction = useCallback(() => {
    if (!selectedTransactionId) return null;
    
    const active = activeTransactions.find(
      (tx) => tx._uiId === selectedTransactionId || tx.txId === selectedTransactionId
    );
    if (active) return active;
    
    const recent = recentTransactions.find(
      (tx) => tx._uiId === selectedTransactionId || tx.txId === selectedTransactionId
    );
    return recent || null;
  }, [selectedTransactionId, activeTransactions, recentTransactions]);

  /**
   * Check if transaction should auto-open drawer
   * Only REVEAL_SWAP auto-opens
   */
  const shouldAutoOpenDrawer = useCallback((txData) => {
    return txData.transactionAction === 'REVEAL_SWAP' || 
           (txData.swapType === 'TSHOT_TO_NFT' && txData.status === 'Pending' && txData.revealedNFTDetails);
  }, []);

  /**
   * Clear all recent transactions
   */
  const clearRecentTransactions = useCallback(() => {
    setRecentTransactions([]);
    localStorage.removeItem(STORAGE_KEY_RECENT);
  }, []);

  /**
   * Get active transactions count
   */
  const getActiveCount = useCallback(() => {
    return activeTransactions.length;
  }, [activeTransactions]);

  /**
   * Get transactions grouped by commit/reveal relationship
   * Groups transactions that share a parentTxId or are linked
   */
  const getGroupedTransactions = useCallback(() => {
    const all = [...activeTransactions, ...recentTransactions];
    const grouped = [];
    const processed = new Set();

    all.forEach((tx) => {
      if (processed.has(tx._uiId)) return;

      // Check if this is a reveal with a parent
      if (tx.transactionAction === 'REVEAL_SWAP' && tx.parentTxId) {
        const parent = all.find((t) => t.txId === tx.parentTxId || t._uiId === tx.parentTxId);
        if (parent) {
          grouped.push({ type: 'group', transactions: [parent, tx] });
          processed.add(parent._uiId);
          processed.add(tx._uiId);
          return;
        }
      }

      // Check if this is a commit with children
      const children = all.filter((t) => t.parentTxId === tx.txId || t.parentTxId === tx._uiId);
      if (children.length > 0) {
        grouped.push({ type: 'group', transactions: [tx, ...children] });
        processed.add(tx._uiId);
        children.forEach((c) => processed.add(c._uiId));
        return;
      }

      // Standalone transaction
      grouped.push({ type: 'single', transaction: tx });
      processed.add(tx._uiId);
    });

    return grouped;
  }, [activeTransactions, recentTransactions]);

  const value = {
    // State
    activeTransactions,
    recentTransactions,
    selectedTransactionId,
    isDrawerOpen,
    
    // Actions
    addOrUpdateTransaction,
    completeTransaction,
    removeTransaction,
    openTransactionDrawer,
    closeTransactionDrawer,
    getSelectedTransaction,
    shouldAutoOpenDrawer,
    clearRecentTransactions,
    setSelectedTransactionId,
    
    // Utilities
    getActiveCount,
    getGroupedTransactions,
  };

  return (
    <TransactionCenterContext.Provider value={value}>
      {children}
    </TransactionCenterContext.Provider>
  );
};

