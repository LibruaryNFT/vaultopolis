import React, { createContext, useContext, useState } from 'react';
import { currentCampaign } from '../config/rewardsCampaign';

const AnnouncementContext = createContext();

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncement must be used within AnnouncementProvider');
  }
  return context;
};

export const AnnouncementProvider = ({ children }) => {
  // Announcements list - this would typically come from an API or config file
  const [announcements] = useState([
    {
      id: currentCampaign.id,
      title: 'TSHOT Incentives Program (Limited Time)',
      snippet: 'Optional program with discretionary distributions; eligibility and terms apply.',
      date: new Date(currentCampaign.startDateISO),
      featured: false,
      category: 'Campaign',
      // Content
      body: (
        <>
          <p className="mb-4 text-brand-text/90">
            Vaultopolis is running a limited-time incentives program for holders of $TSHOT on Flow EVM. 
            The program may include discretionary distributions subject to eligibility criteria.
          </p>
          <p className="mb-4 text-brand-text/90">
            <strong>Program Summary:</strong> {currentCampaign.totalRewards.toLocaleString()} FLOW distributed over {currentCampaign.durationWeeks} weeks 
            ({currentCampaign.startDate} – {currentCampaign.endDate}). Weekly distributions are typically {currentCampaign.baseWeeklyAmount.toLocaleString()} FLOW, 
            with {currentCampaign.superchargedAmount.toLocaleString()} FLOW on supercharged weeks.
          </p>
          <p className="mb-4 text-brand-text/90">
            <strong>Eligibility:</strong> Hold $TSHOT on Flow EVM (no staking required). Certain addresses (including team/treasury/LP or other program-excluded wallets) may be ineligible. 
            Eligibility calculations and distribution mechanics may be administered via third-party infrastructure (e.g., Merkl).
          </p>
          <p className="mb-4 text-brand-text/90">
            <strong>Important:</strong> This program is optional, may change or end at any time, and is not a guarantee of future distributions. 
            Nothing on this site constitutes an offer or solicitation to buy or sell any asset. This is not investment advice, and this program is not "yield", "interest", or an "APY".
          </p>
        </>
      ),
      // Navigation
      canonicalPath: '/rewards/tshot', // For compliance-heavy programs (program-level canonical)
      // detailPath is derived from id: `/updates/${id}` (not stored to avoid drift)
      externalLink: null,
      // Actions
      actions: [
        { label: 'View Disclosures', href: '/rewards/tshot', variant: 'primary' },
        { label: 'How to Participate', href: '/guides/tshot-rewards', variant: 'secondary' },
      ],
    },
    {
      id: 'allday-grail-bounties-launch',
      title: '🏈 NFL AllDay Grail Bounties Now Live',
      snippet: 'We\'ve launched Grail Bounties for NFL AllDay moments! Browse and accept offers for high-end AllDay moments from the vault.',
      date: new Date('2025-11-15'),
      featured: false,
      category: 'Launch',
      body: (
        <>
          <p className="mb-4 text-brand-text/90">
            We're excited to announce that Grail Bounties are now available for NFL AllDay moments! 
            This expands our bounty program to include premium NFL AllDay moments from the Vaultopolis treasury.
          </p>
          <p className="mb-4 text-brand-text/90">
            <strong>What are Grail Bounties?</strong> Grail Bounties are premium offers from the Vaultopolis treasury 
            for high-end moments. When you accept a bounty, you trade your matching moment for FLOW tokens at a premium price.
          </p>
          <p className="mb-4 text-brand-text/90">
            <strong>How it works:</strong>
          </p>
          <ul className="mb-4 text-brand-text/90 space-y-2 list-disc list-inside ml-4">
            <li>Browse available Grail Bounties for NFL AllDay moments</li>
            <li>Check if you own any matching moments in your collection</li>
            <li>Accept the bounty to trade your moment for FLOW at the offered price</li>
            <li>Complete the transaction on-chain</li>
          </ul>
          <p className="mb-4 text-brand-text/90">
            Head to the Bounties page to see all available offers and start trading!
          </p>
        </>
      ),
      // Navigation
      // detailPath is derived from id: `/updates/${id}` (not stored)
      externalLink: null,
      actions: [
        { label: 'Browse AllDay Bounties', href: '/bounties/allday', variant: 'primary' },
      ],
    }
    // Add more announcements here as needed
  ]);

  // Track dismissed banners in localStorage
  const [dismissedBanners, setDismissedBanners] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissedBanners') || '[]');
    } catch {
      return [];
    }
  });

  // Track individually read notifications
  // Pre-mark certain announcements as read (e.g., older announcements that shouldn't show as "new")
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      // Pre-mark the AllDay Grail Bounties launch as read (it's an older announcement)
      const preReadIds = ['allday-grail-bounties-launch'];
      const combined = [...new Set([...stored, ...preReadIds])];
      // Only update localStorage if we added new IDs
      if (combined.length > stored.length) {
        localStorage.setItem('readNotifications', JSON.stringify(combined));
      }
      return combined;
    } catch {
      return ['allday-grail-bounties-launch']; // Default to marking it as read
    }
  });

  // Track dismissed notifications
  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
    } catch {
      return [];
    }
  });

  // Get the featured announcement (first one with featured: true)
  const getFeaturedAnnouncement = () => {
    return announcements.find(ann => ann.featured) || null;
  };

  // Check if featured banner should be shown
  const shouldShowFeaturedBanner = () => {
    const featured = getFeaturedAnnouncement();
    if (!featured) return false;
    
    // Check if user has dismissed this specific banner
    return !dismissedBanners.includes(featured.id);
  };

  // Dismiss a banner
  const dismissBanner = (announcementId) => {
    const updated = [...dismissedBanners, announcementId];
    setDismissedBanners(updated);
    localStorage.setItem('dismissedBanners', JSON.stringify(updated));
  };

  // Mark announcements as read (legacy function, keeping for compatibility)
  const markAsRead = () => {
    // This is now handled by individual markNotificationAsRead
  };

  // Get visible announcements (not dismissed)
  const getVisibleAnnouncements = () => {
    return announcements.filter(ann => !dismissedNotifications.includes(ann.id));
  };

  // Check if there are unread announcements
  const hasUnreadAnnouncements = () => {
    const visible = getVisibleAnnouncements();
    return visible.some(ann => !readNotifications.includes(ann.id));
  };

  // Get unread count
  const getUnreadCount = () => {
    const visible = getVisibleAnnouncements();
    return visible.filter(ann => !readNotifications.includes(ann.id)).length;
  };

  // Mark individual notification as read
  const markNotificationAsRead = (notificationId) => {
    if (!readNotifications.includes(notificationId)) {
      const updated = [...readNotifications, notificationId];
      setReadNotifications(updated);
      localStorage.setItem('readNotifications', JSON.stringify(updated));
    }
  };

  // Check if a specific notification is read
  const isNotificationRead = (notificationId) => {
    return readNotifications.includes(notificationId);
  };

  // Dismiss a notification
  const dismissNotification = (notificationId) => {
    if (!dismissedNotifications.includes(notificationId)) {
      const updated = [...dismissedNotifications, notificationId];
      setDismissedNotifications(updated);
      localStorage.setItem('dismissedNotifications', JSON.stringify(updated));
      // Also mark as read
      markNotificationAsRead(notificationId);
    }
  };

  // Helper to get announcement by ID
  const getAnnouncementById = (id) => {
    return announcements.find(ann => ann.id === id) || null;
  };

  const value = {
    announcements: getVisibleAnnouncements(), // Filtered for notification center
    allAnnouncements: announcements, // All announcements for the full page
    getAnnouncementById, // Get single announcement by ID
    featuredAnnouncement: getFeaturedAnnouncement(),
    shouldShowFeaturedBanner: shouldShowFeaturedBanner(),
    dismissBanner,
    hasUnreadAnnouncements: hasUnreadAnnouncements(),
    getUnreadCount,
    markAsRead,
    markNotificationAsRead,
    isNotificationRead,
    dismissNotification
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
};

