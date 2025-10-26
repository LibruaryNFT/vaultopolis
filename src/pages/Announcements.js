import React from 'react';
import { Link } from 'react-router-dom';
import { useAnnouncement } from '../context/AnnouncementContext';
import { X } from 'lucide-react';

export default function Announcements() {
  const { allAnnouncements, isNotificationRead, markNotificationAsRead, dismissNotification } = useAnnouncement();

  return (
    <div className="w-full text-brand-text">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">News & Updates</h1>
          <p className="text-brand-text/70">
            All announcements and updates from Vaultopolis
          </p>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {allAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brand-text/70">No announcements available.</p>
            </div>
          ) : (
            allAnnouncements.map((ann) => {
              const isRead = isNotificationRead(ann.id);
              return (
                <div
                  key={ann.id}
                  className="bg-brand-primary rounded-lg border border-brand-border p-6 hover:border-brand-accent/50 transition-colors relative group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {!isRead && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        <h3 className={`text-lg font-semibold ${
                          isRead ? 'text-brand-text/70' : 'text-brand-text'
                        }`}>
                          {ann.title}
                        </h3>
                        <span className="px-2 py-0.5 text-xs bg-brand-secondary border border-brand-border rounded">
                          {ann.category}
                        </span>
                      </div>
                      <p className={`mb-3 ${
                        isRead ? 'text-brand-text/50' : 'text-brand-text/70'
                      }`}>
                        {ann.snippet}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-brand-text/60 mb-3">
                        <span>{new Date(ann.date).toLocaleDateString()}</span>
                      </div>
                      {ann.link && (
                        <Link
                          to={ann.link}
                          className="inline-flex items-center gap-2 text-brand-accent hover:text-brand-blue font-medium text-sm"
                          onClick={() => markNotificationAsRead(ann.id)}
                        >
                          Read More →
                        </Link>
                      )}
                    </div>
                    {/* Dismiss Button */}
                    <button
                      onClick={() => dismissNotification(ann.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all flex-shrink-0"
                      aria-label="Dismiss"
                    >
                      <X size={20} className="text-brand-text/70 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-brand-border">
          <Link
            to="/"
            className="text-brand-accent hover:text-brand-blue font-medium inline-flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

