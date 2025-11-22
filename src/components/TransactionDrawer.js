// src/components/TransactionDrawer.js
// Global transaction drawer component that subscribes to TransactionCenterContext
import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTransactionCenter } from '../context/TransactionCenterContext';
import TransactionModal from './TransactionModal';

/**
 * Global Transaction Drawer component
 * 
 * This component:
 * - Subscribes to TransactionCenterContext
 * - Displays the selected transaction in a drawer
 * - Auto-opens for REVEAL_SWAP transactions
 * - Can be opened/closed from any page via context
 */
export default function TransactionDrawer() {
  const {
    isDrawerOpen,
    selectedTransactionId,
    getSelectedTransaction,
    closeTransactionDrawer,
    activeTransactions,
    shouldAutoOpenDrawer,
  } = useTransactionCenter();

  // Auto-open drawer for REVEAL_SWAP transactions
  useEffect(() => {
    // Check if any active transaction should auto-open
    const shouldOpen = activeTransactions.find((tx) => {
      // Only auto-open if drawer is not already open
      if (isDrawerOpen) return false;
      // Check if this transaction should auto-open
      return shouldAutoOpenDrawer(tx);
    });

    if (shouldOpen) {
      // Set this transaction as selected and open drawer
      // This will be handled by the context's auto-open logic
      // For now, we'll rely on pages calling openTransactionDrawer
      // when shouldAutoOpenDrawer returns true
    }
  }, [activeTransactions, shouldAutoOpenDrawer, isDrawerOpen]);

  // Get the transaction to display
  const selectedTransaction = selectedTransactionId ? getSelectedTransaction() : null;

  // Show transactions in drawer:
  // 1. Explicitly selected transaction (via NotificationCenter or manual open)
  // 2. Most recent active transaction if drawer is open
  // Note: Auto-open behavior (only for REVEAL_SWAP) is handled in handleTransactionStart
  const displayTransaction = selectedTransaction || 
    (isDrawerOpen && activeTransactions.length > 0 
      ? activeTransactions[activeTransactions.length - 1] 
      : null);

  // Don't render if drawer is closed or no transaction to display
  if (!isDrawerOpen || !displayTransaction) return null;

  return (
    <AnimatePresence>
      {isDrawerOpen && displayTransaction && (
        <TransactionModal
          {...displayTransaction}
          onClose={closeTransactionDrawer}
        />
      )}
    </AnimatePresence>
  );
}

