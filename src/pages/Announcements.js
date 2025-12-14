import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAnnouncement } from '../context/AnnouncementContext';
import { X } from 'lucide-react';

export default function Announcements() {
  const { allAnnouncements, isNotificationRead, markNotificationAsRead, dismissNotification } = useAnnouncement();
  const [dismissingId, setDismissingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'new', 'past', or 'all' - default to 'all' to show everything

  // Get dismissed items from localStorage to filter them out
  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
    } catch {
      return [];
    }
  });

  // Sync with localStorage changes (e.g., from other tabs/components)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
        setDismissedNotifications(dismissed);
      } catch {
        setDismissedNotifications([]);
      }
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on mount/update
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Filter out dismissed items and currently dismissing item (for New/All tabs)
  // Safety check: ensure allAnnouncements is an array
  const visibleAnnouncements = (Array.isArray(allAnnouncements) ? allAnnouncements : []).filter(ann => 
    ann && ann.id && !dismissedNotifications.includes(ann.id) && ann.id !== dismissingId
  );
  
  // Enhanced dismiss handler that updates local state
  const handleDismiss = (id) => {
    setDismissingId(id);
    dismissNotification(id);
    // Update local dismissed list
    setDismissedNotifications(prev => {
      const updated = [...prev, id];
      return updated;
    });
    // Clear dismissing state after animation
    setTimeout(() => setDismissingId(null), 300);
  };

  // Separate into new (unread) and past (read) updates
  // New updates: only non-dismissed, unread items
  const newUpdates = visibleAnnouncements.filter(ann => !isNotificationRead(ann.id));
  
  // Past updates: ALL read items (including dismissed ones) - exclude only currently dismissing
  const pastUpdates = (Array.isArray(allAnnouncements) ? allAnnouncements : []).filter(ann => 
    ann && ann.id && isNotificationRead(ann.id) && ann.id !== dismissingId
  );
  
  // Auto-switch to 'all' tab if user is on 'new' but there are no new updates
  useEffect(() => {
    if (activeTab === 'new' && newUpdates.length === 0 && visibleAnnouncements.length > 0) {
      setActiveTab('all');
    }
  }, [newUpdates.length, visibleAnnouncements.length, activeTab]);
  
  // Get items to display based on active tab
  const getDisplayItems = () => {
    switch (activeTab) {
      case 'new':
        return newUpdates;
      case 'past':
        return pastUpdates;
      case 'all':
        return visibleAnnouncements;
      default:
        return newUpdates;
    }
  };


  // Render function for announcement card
  const renderAnnouncementCard = (ann) => {
              const isRead = isNotificationRead(ann.id);
    
    // Determine click target for the card
    const detailPath = `/updates/${ann.id}`;
    let cardClickTarget;
    if (ann.actions?.length && ann.actions[0]?.href) {
      cardClickTarget = (ann.body ? detailPath : null) || ann.actions[0].href;
    } else if (ann.body) {
      cardClickTarget = detailPath;
    } else if (ann.externalLink) {
      cardClickTarget = ann.externalLink;
    } else {
      cardClickTarget = detailPath;
    }
    
    const isExternalLink = cardClickTarget?.startsWith('http://') || cardClickTarget?.startsWith('https://');
    
              return (
      <div
        key={ann.id}
        className={`bg-brand-secondary rounded-lg border border-brand-border p-6 shadow-md hover:border-brand-accent/50 hover:shadow-lg transition-all relative group cursor-pointer ${
          !isRead ? 'border-l-2 border-opolis/60' : 'border-l-2 border-transparent'
        }`}
      >
                  <div className="flex items-start gap-4">
          {/* Main content area */}
                    <div className="flex-1">
            {/* Clickable header area (title, date, snippet) */}
            {isExternalLink ? (
              <a
                href={cardClickTarget}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => markNotificationAsRead(ann.id)}
                className="block cursor-pointer"
              >
                <CardHeader ann={ann} isRead={isRead} />
              </a>
            ) : (
              <Link
                to={cardClickTarget}
                onClick={() => markNotificationAsRead(ann.id)}
                className="block cursor-pointer"
              >
                <CardHeader ann={ann} isRead={isRead} />
              </Link>
            )}
            
            {/* Card body with actions - NOT nested in link to avoid <a> inside <a> */}
            <CardContent ann={ann} isRead={isRead} markNotificationAsRead={markNotificationAsRead} />
          </div>
          
          {/* Dismiss Button - only show for unread (new) updates */}
          {!isRead && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDismiss(ann.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all flex-shrink-0"
              aria-label="Dismiss"
              title="Dismiss this update"
            >
              <X size={20} className="text-brand-text/70 hover:text-red-400" />
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Card header component (clickable area)
  const CardHeader = ({ ann, isRead }) => {
    return (
      <>
                      <div className="flex items-center gap-2 mb-2">
                        {!isRead && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
          <h3 className={`text-lg font-semibold group-hover:text-brand-accent transition-colors ${
            isRead ? 'text-brand-text/80' : 'text-brand-text'
                        }`}>
                          {ann.title}
                        </h3>
          <span className="px-2 py-0.5 text-xs bg-brand-primary border border-brand-border rounded">
                          {ann.category}
                        </span>
                      </div>
        <div className="flex items-center gap-4 text-sm text-brand-text/60 mb-3">
          <span>{new Date(ann.date).toLocaleDateString()}</span>
        </div>
        <p className={`mb-4 ${
          isRead ? 'text-brand-text/60' : 'text-brand-text/80'
                      }`}>
                        {ann.snippet}
                      </p>
      </>
    );
  };
  
  // Card content component - only shows "View Full Details" button, no action buttons
  const CardContent = ({ ann, isRead, markNotificationAsRead }) => {
    // Derive detailPath from id (one source of truth)
    const detailPath = `/updates/${ann.id}`;
    const hasBody = !!ann.body;
    const isExternal = ann.externalLink && (ann.externalLink.startsWith('http://') || ann.externalLink.startsWith('https://'));
    
    // Only show "View Full Details" button if there's a body or detail page to view
    // Don't show action buttons on cards - those are only on the detail page
    if (!hasBody && !ann.externalLink) {
      return null; // No content to view
    }
    
    const linkTarget = hasBody ? detailPath : (ann.externalLink || detailPath);
    const buttonLabel = 'View Full Details →';
    
    const buttonClasses = `
      font-semibold rounded-lg transition-all duration-200 select-none
      focus:outline-none focus:ring-2 focus:ring-brand-accent/50
      px-3 py-2 text-sm
      bg-brand-primary text-brand-text border border-brand-border hover:bg-brand-primary/80
    `.trim();
    
    if (isExternal) {
      return (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <a
            href={ann.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              markNotificationAsRead(ann.id);
            }}
            className={buttonClasses}
          >
            {buttonLabel}
          </a>
        </div>
      );
    }
    
    return (
      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
        <Link
          to={linkTarget}
          onClick={(e) => {
            e.stopPropagation();
            markNotificationAsRead(ann.id);
          }}
          className={buttonClasses}
        >
          {buttonLabel}
        </Link>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Vaultopolis - Updates</title>
        <meta name="description" content="Product announcements and updates from Vaultopolis. Stay informed about new features, campaigns, and important information." />
        <meta name="keywords" content="vaultopolis updates, announcements, news, product updates, flow blockchain, nft updates" />
        <link rel="canonical" href="https://vaultopolis.com/updates" />
        <meta property="og:title" content="Vaultopolis - Updates" />
        <meta property="og:description" content="Product announcements and updates from Vaultopolis" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/updates" />
      </Helmet>
      <div className="w-full text-brand-text">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Updates</h1>
            <p className="text-brand-text/70">
              Product announcements and updates from Vaultopolis
            </p>
          </div>

          {/* Tabs - Always show tabs if we have announcements (even if all dismissed) */}
          {Array.isArray(allAnnouncements) && allAnnouncements.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-1 bg-brand-primary rounded-lg p-1 border border-brand-border">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${activeTab === 'all'
                      ? "bg-brand-secondary text-brand-text shadow-md"
                      : "text-brand-text/70 hover:text-brand-text hover:bg-brand-primary/50"
                    }
                  `}
                >
                  All Updates
                  <span className="ml-2 text-xs text-brand-text/60">
                    ({visibleAnnouncements.length})
                  </span>
                </button>
                {newUpdates.length > 0 && (
                  <button
                    onClick={() => setActiveTab('new')}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative
                      ${activeTab === 'new'
                        ? "bg-brand-secondary text-brand-text shadow-md"
                        : "text-brand-text/70 hover:text-brand-text hover:bg-brand-primary/50"
                      }
                    `}
                  >
                    New Updates
                    <span className="ml-2 h-2 w-2 bg-blue-500 rounded-full inline-block" />
                    <span className="ml-2 text-xs text-brand-text/60">
                      ({newUpdates.length})
                    </span>
                  </button>
                )}
                    <button
                  onClick={() => setActiveTab('past')}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${activeTab === 'past'
                      ? "bg-brand-secondary text-brand-text shadow-md"
                      : "text-brand-text/70 hover:text-brand-text hover:bg-brand-primary/50"
                    }
                    ${pastUpdates.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  disabled={pastUpdates.length === 0}
                  title={pastUpdates.length === 0 ? "No past updates yet. Click on an update to mark it as read." : "View past updates"}
                >
                  Past Updates
                  <span className="ml-2 text-xs text-brand-text/60">
                    ({pastUpdates.length})
                  </span>
                    </button>
                  </div>
            </div>
          )}

          {/* Tab Content */}
          {Array.isArray(allAnnouncements) && allAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {getDisplayItems().length > 0 ? (
                getDisplayItems().map((ann) => renderAnnouncementCard(ann))
              ) : (
                <div className="text-center py-12 bg-brand-secondary rounded-lg border border-brand-border p-8">
                  <p className="text-brand-text/70 mb-2">
                    {activeTab === 'new' && 'No new updates.'}
                    {activeTab === 'past' && (
                      <>
                        No past updates yet.
                        <br />
                        <span className="text-sm text-brand-text/50 mt-2 block">
                          Click on any update to mark it as read, then it will appear here.
                        </span>
                      </>
                    )}
                    {activeTab === 'all' && 'No updates available.'}
                  </p>
                </div>
          )}
        </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-brand-text/70">No announcements available.</p>
            </div>
          )}
        </div>
      </div>
    </> 
  );
}

