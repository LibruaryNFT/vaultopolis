import React, { createContext, useContext, useState } from 'react';

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
      id: 'tshot-rewards-oct25',
      title: '🎁 12-Week TSHOT Rewards Program',
      snippet: 'Earn massive weekly rewards for holding $TSHOT on Flow EVM. 22,500 FLOW distributed over 12 weeks.',
      link: '/tshot?scroll=rewards',
      date: new Date('2025-10-21'),
      featured: false, // Notification center only
      category: 'Campaign'
    },
    {
      id: 'allday-grail-bounties-launch',
      title: '🏈 NFL AllDay Grail Bounties Now Live',
      snippet: 'We\'ve launched Grail Bounties for NFL AllDay moments! Browse and accept offers for high-end AllDay moments from the vault.',
      link: '/bounties/allday',
      date: new Date('2025-11-15'),
      featured: false, // Disabled banner - shows in notification center only
      category: 'Launch'
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
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('readNotifications') || '[]');
    } catch {
      return [];
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

  const value = {
    announcements: getVisibleAnnouncements(), // Filtered for notification center
    allAnnouncements: announcements, // All announcements for the full page
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

