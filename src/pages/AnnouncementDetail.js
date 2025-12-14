import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useAnnouncement } from '../context/AnnouncementContext';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

export default function AnnouncementDetail() {
  const { id } = useParams();
  const { getAnnouncementById, markNotificationAsRead } = useAnnouncement();
  const announcement = getAnnouncementById(id);
  
  // Derive detailPath from id (one source of truth)
  const detailPath = `/updates/${id}`;

  // Mark as read when viewing (must be called before any conditional returns)
  React.useEffect(() => {
    if (announcement) {
      markNotificationAsRead(id);
    }
  }, [id, announcement, markNotificationAsRead]);

  // Handle external link redirect (must be called before any conditional returns)
  // Always call this hook, but only redirect if conditions are met
  React.useEffect(() => {
    if (announcement && !announcement.body && announcement.externalLink) {
      window.location.href = announcement.externalLink;
    }
  }, [announcement]);

  // 404 if not found
  if (!announcement) {
    return (
      <div className="w-full text-brand-text">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Announcement Not Found</h1>
          <p className="text-brand-text/70 mb-4">The announcement you're looking for doesn't exist.</p>
          <Link to="/updates" className="text-opolis hover:text-opolis/80 underline">
            ← Back to Updates
          </Link>
        </div>
      </div>
    );
  }

  // If no body but has externalLink, show redirecting message
  if (!announcement.body && announcement.externalLink) {
    return (
      <div className="w-full text-brand-text">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-brand-text/70">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Vaultopolis - {announcement.title}</title>
        <meta name="description" content={announcement.snippet} />
        <link rel="canonical" href={`https://vaultopolis.com${detailPath}`} />
        <meta property="og:url" content={`https://vaultopolis.com${detailPath}`} />
      </Helmet>
      <div className="w-full text-brand-text">
        <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/updates"
          className="inline-flex items-center gap-2 text-brand-text/70 hover:text-brand-text mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Updates
        </Link>

        {/* Article */}
        <article className="bg-brand-secondary rounded-lg border border-brand-border p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-xs bg-brand-primary border border-brand-border rounded">
                {announcement.category}
              </span>
              <span className="text-sm text-brand-text/60">
                {new Date(announcement.date).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
              {announcement.title}
            </h1>
            {announcement.snippet && (
              <p className="text-lg text-brand-text/80">
                {announcement.snippet}
              </p>
            )}
          </div>

          {/* Body Content */}
          {announcement.body && (
            <div className="prose prose-invert max-w-none mb-8 prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline prose-headings:text-brand-text prose-p:text-brand-text/90">
              <div className="text-brand-text/90 leading-relaxed">
                {announcement.body}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {announcement.actions && announcement.actions.length > 0 && (
            <div className="mt-8 pt-6 border-t border-brand-border">
              <div className="flex flex-wrap gap-3">
                {announcement.actions
                  .filter(action => action && action.href) // Safety: filter out invalid actions
                  .map((action, idx) => {
                    const isExternal = action.href.startsWith('http://') || action.href.startsWith('https://');
                    
                    if (isExternal) {
                      return (
                        <a
                          key={idx}
                          href={action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                            className="inline-flex items-center gap-2"
                          >
                            {action.label}
                          </Button>
                        </a>
                      );
                    }
                    
                    return (
                      <Link
                        key={idx}
                        to={action.href}
                      >
                        <Button
                          variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                          className="inline-flex items-center gap-2"
                        >
                          {action.label}
                        </Button>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
    </>
  );
}

