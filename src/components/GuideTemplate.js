import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaSpinner, FaCheckCircle, FaHome, FaQuestionCircle } from "react-icons/fa";

// Extracted Step component for cleaner code
function Step({ step }) {
  return (
    <article
      className="bg-brand-primary rounded-xl p-6 border-2 border-brand-border flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300"
      aria-labelledby={`step-${step.id}-title`}
      tabIndex={-1}
    >
      <div className="text-center mb-4">
        <div
          className="bg-brand-accent text-brand-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto shadow-lg border-2 border-brand-accent/20"
          aria-hidden="true"
        >
          {step.id}
        </div>
        <h3
          id={`step-${step.id}-title`}
          className="text-lg font-semibold text-brand-text mt-3"
        >
          {step.title}
        </h3>
      </div>
      <div className="flex-1 text-brand-text/90 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-brand-accent [&_a]:underline">
        {step.content}
      </div>
    </article>
  );
}

Step.propTypes = {
  step: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired
  }).isRequired
 };

// FAQ Component for better SEO
function FAQ({ faq }) {
  if (!faq || faq.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-brand-primary rounded-xl p-6 border-2 border-brand-border shadow-lg">
        <div className="text-center mb-6">
          <div className="bg-brand-accent text-brand-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto shadow-lg border-2 border-brand-accent/20">
            <FaQuestionCircle />
          </div>
          <h3 className="text-xl font-semibold text-brand-text mt-3">
            Frequently Asked Questions
          </h3>
        </div>
        <div className="space-y-4">
          {faq.map((item, index) => (
            <details key={index} className="group">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between p-4 bg-brand-secondary rounded-lg hover:bg-brand-secondary/80 transition-colors">
                  <h4 className="font-semibold text-brand-text group-open:text-brand-accent">
                    {item.question}
                  </h4>
                  <span className="text-brand-accent group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </div>
              </summary>
              <div className="p-4 bg-brand-secondary/50 rounded-b-lg border-t border-brand-border">
                <p className="text-brand-text/90">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

FAQ.propTypes = {
  faq: PropTypes.arrayOf(PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired
  }))
};

function GuideTemplate({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogTitle, 
  ogDescription, 
  icon: Icon, 
  difficulty, 
  estimatedTime, 
  steps, 
  prerequisites,
  successMessage, 
  officialDocs, 
  videoEmbed,
  lastUpdated,
  faq
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError] = useState(false);
  
  // Use refs for DOM elements instead of document.querySelector
  const headingRef = useRef(null);
  const stepRefs = useRef({});

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation using refs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const backButton = document.querySelector('[aria-label="Return to all guides"]');
        if (backButton) {
          backButton.focus();
        }
      }
      
      if (e.key >= '1' && e.key <= '9') {
        const stepNumber = parseInt(e.key);
        const stepRef = stepRefs.current[stepNumber];
        if (stepRef) {
          e.preventDefault();
          stepRef.focus();
          stepRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steps.length]);

  // Focus management for accessibility - removed auto-focus to prevent unwanted text selection
  // useEffect(() => {
  //   if (!isLoading && !hasError && headingRef.current) {
  //     headingRef.current.focus();
  //   }
  // }, [isLoading, hasError]);

  // Enhanced structured data for HowTo content
  const howToStructuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "image": "https://vaultopolis.com/guide-hero.jpg",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "timeRequired": estimatedTime,
    "difficultyLevel": difficulty,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": step.id,
      "name": step.title,
      "text": typeof step.content === 'string' ? step.content : `Step ${step.id}: ${step.title}`,
      "url": `${canonicalUrl}#step-${step.id}`
    })),
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Flow Wallet",
        "url": "https://wallet.flow.com"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Vaultopolis Platform",
        "url": "https://vaultopolis.com"
      }
    ]
  };

  // FAQ structured data if available
  const faqStructuredData = faq && faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  } : null;

  return (
    <>
      {/* ─── SEO ─── */}
      <Helmet>
        <title>{title} | Vaultopolis Guides</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(howToStructuredData)}
        </script>
        {faqStructuredData && (
          <script type="application/ld+json">
            {JSON.stringify(faqStructuredData)}
          </script>
        )}
      </Helmet>

      {/* ─── PAGE BODY ─── */}
      <div className="w-full text-white space-y-8 mb-6">
        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-brand-primary rounded-xl p-8 border-2 border-brand-border">
              <FaSpinner className="text-6xl text-brand-accent mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-semibold text-brand-text mb-2">Loading Guide...</h2>
              <p className="text-brand-text/70">Preparing your step-by-step instructions</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-red-900/20 border border-red-600/30 p-6 rounded-xl">
              <div className="flex items-start space-x-4">
                <FaExclamationTriangle className="text-red-400 mt-1 flex-shrink-0 text-2xl" />
                <div>
                  <h3 className="text-lg font-semibold text-red-200 mb-2">Something went wrong</h3>
                  <p className="text-red-200/80 mb-4">We encountered an error while loading this guide. Please try refreshing the page.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    aria-label="Refresh page to retry loading guide"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Only show when not loading and no errors */}
        {!isLoading && !hasError && (
          <>
            {/* Skip to main content link for accessibility */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-accent text-white px-4 py-2 rounded z-50"
              aria-label="Skip to main content"
            >
              Skip to main content
            </a>
            
            {/* Breadcrumb Navigation */}
            <nav className="max-w-4xl mx-auto px-4 pt-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-brand-text/70">
                <li>
                  <Link to="/" className="hover:text-brand-accent transition-colors flex items-center">
                    <FaHome className="mr-1" size={14} />
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link to="/guides" className="hover:text-brand-accent transition-colors">
                    Guides
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="text-brand-text">{title}</span>
                </li>
              </ol>
            </nav>
            


            {/* Header Section - REFINED */}
            <header id="main-content" className="text-center space-y-4 max-w-4xl mx-auto px-4">
              <div className="flex justify-center">
                <Icon className="text-6xl text-brand-accent" aria-hidden="true" />
              </div>
              <h1 className="text-4xl font-bold text-brand-text" ref={headingRef}>
                {title}
              </h1>
              <p className="text-xl text-brand-text/80">{description}</p>
              <div className="flex justify-center flex-wrap gap-x-4 text-sm text-brand-text/60">
                <span>⏱ {estimatedTime}</span>
                <span className="hidden sm:inline">•</span>
                <span>{difficulty}</span>
                {lastUpdated && <><span className="hidden sm:inline">•</span><span>Last updated: {lastUpdated}</span></>}
              </div>
            </header>

            {/* Prerequisites Section - Only show if prerequisites exist */}
            {prerequisites && (
              <div className="max-w-4xl mx-auto px-4">
                <div className="bg-brand-primary rounded-xl p-6 border-2 border-brand-border shadow-lg">
                  <div className="text-center mb-4">
                    <div className="bg-brand-accent text-brand-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto shadow-lg border-2 border-brand-accent/20">
                      ⚙️
                    </div>
                    <h3 className="text-lg font-semibold text-brand-text mt-3">
                      Prerequisites
                    </h3>
                  </div>
                  <div className="text-brand-text/90">
                    {prerequisites}
                  </div>
                </div>
              </div>
            )}

            {/* Step-by-Step Guide - PERFECT */}
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {steps.map((step) => (
                  <div key={step.id} ref={(el) => (stepRefs.current[step.id] = el)}>
                    <Step step={step} />
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section - NEW */}
            <FAQ faq={faq} />

            {/* --- NEW: Success & Further Reading --- */}
            <div className="max-w-4xl mx-auto px-4 space-y-6">
              {successMessage && (
                <div className="bg-green-500/10 border border-green-400/30 p-6 rounded-xl flex items-start space-x-4">
                  <FaCheckCircle className="text-green-400 text-2xl mt-1 flex-shrink-0" />
                  <div>{successMessage}</div>
                </div>
              )}

              {officialDocs && officialDocs.length > 0 && (
                <div className="bg-brand-primary border-2 border-brand-border p-6 rounded-xl">
                                     <h4 className="text-xl font-semibold text-brand-text mb-4">Official Documentation</h4>
                  <ul className="space-y-2">
                    {officialDocs.map((doc) => (
                      <li key={doc.url} className="flex items-start">
                        <span className="text-brand-accent mr-2 mt-1">›</span>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-brand-text/90 hover:text-brand-accent transition-colors"
                        >
                          {doc.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Video Embed */}
            {videoEmbed && (
              <div className="max-w-4xl mx-auto px-4">
                <div className="bg-brand-primary p-4 rounded-lg border border-brand-border">
                  <h4 className="font-semibold text-brand-accent mb-3">{videoEmbed.title}</h4>
                  <div className="aspect-video w-full mb-3">
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={videoEmbed.src}
                      title={videoEmbed.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      aria-label={`Video tutorial: ${videoEmbed.title}`}
                    ></iframe>
                  </div>
                  <p className="text-sm text-brand-text/60 text-center">{videoEmbed.description}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// PropTypes for type safety
GuideTemplate.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  keywords: PropTypes.string.isRequired,
  canonicalUrl: PropTypes.string.isRequired,
  ogTitle: PropTypes.string.isRequired,
  ogDescription: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  difficulty: PropTypes.string.isRequired,
  estimatedTime: PropTypes.string.isRequired,
  steps: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired
  })).isRequired,
  prerequisites: PropTypes.node,
  successMessage: PropTypes.node,
  officialDocs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  })),
  videoEmbed: PropTypes.shape({
    title: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }),
  lastUpdated: PropTypes.string,
  faq: PropTypes.arrayOf(PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired
  }))
};

export default GuideTemplate; 