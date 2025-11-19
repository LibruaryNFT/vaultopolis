import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnnouncement } from '../context/AnnouncementContext';

export default function NotificationCenter() {
  const { announcements, hasUnreadAnnouncements, getUnreadCount, markAsRead, markNotificationAsRead, isNotificationRead, dismissNotification } = useAnnouncement();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpen = () => {
    if (!isOpen) {
      markAsRead(); // Mark as read when opening
    }
    setIsOpen(!isOpen);
  };

  const unreadCount = getUnreadCount();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-brand-primary/20 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-brand-text" />
        {hasUnreadAnnouncements && unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fixed top-[68px] right-0 sm:right-4 w-80 max-w-[calc(100vw-0.5rem)] sm:max-w-[calc(100vw-2rem)] bg-brand-secondary border border-brand-border rounded-lg shadow-xl z-50 max-h-[calc(100vh-80px)] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-brand-border">
            <h3 className="text-lg font-semibold text-brand-text">News & Updates</h3>
            <p className="text-sm text-brand-text/70">Recent announcements</p>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {announcements.length === 0 ? (
              <div className="p-4 text-center text-brand-text/70 text-sm">
                No announcements
              </div>
            ) : (
              <div className="divide-y divide-brand-border">
                {announcements.map((ann) => {
                  const isRead = isNotificationRead(ann.id);
                  return (
                    <div
                      key={ann.id}
                      className="group relative"
                    >
                      <a
                        href={ann.link}
                        onClick={(e) => {
                          markNotificationAsRead(ann.id);
                          setIsOpen(false);
                        }}
                        className={`block p-4 hover:bg-brand-primary transition-colors ${
                          isRead ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {!isRead && (
                                <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                              <div className={`text-sm font-medium mb-1 ${
                                isRead ? 'text-brand-text/70' : 'text-brand-text'
                              }`}>
                                {ann.title}
                              </div>
                            </div>
                            <p className={`text-sm line-clamp-2 ${
                              isRead ? 'text-brand-text/50' : 'text-brand-text/70'
                            }`}>
                              {ann.snippet}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-brand-text/60">
                              <span>{ann.category}</span>
                              <span>•</span>
                              <span>{new Date(ann.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                      {/* Dismiss Button - Shows on Hover */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dismissNotification(ann.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                        aria-label="Dismiss"
                      >
                        <X size={16} className="text-brand-text/70 hover:text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {(announcements.length > 0 || announcements.length === 0) && (
            <div className="p-3 border-t border-brand-border bg-brand-primary/20">
              <Link
                to="/news"
                className="text-sm text-brand-accent hover:text-brand-blue text-center block"
                onClick={() => setIsOpen(false)}
              >
                View All News →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

