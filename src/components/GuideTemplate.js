import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaSpinner, FaCheckCircle, FaBookOpen } from "react-icons/fa";
import PageWrapper from "./PageWrapper";
import ContentPanel from "./ContentPanel";
import Card from "./Card";
import Button from "./Button";

// Extracted Step component for cleaner code
function Step({ step }) {
  return (
    <Card
      variant="elevated"
      padding="md"
      className="text-center"
      aria-labelledby={`step-${step.id}-title`}
      tabIndex={-1}
    >
      <div className="text-center mb-4">
        <div
          className="bg-opolis text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4"
          aria-hidden="true"
        >
          {step.id}
        </div>
        <h3
          id={`step-${step.id}-title`}
          className="text-lg font-semibold text-brand-text mb-3"
        >
          {step.title}
        </h3>
      </div>
      <div className="flex-1 text-brand-text/90 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-brand-accent [&_a]:underline">
        {step.content}
      </div>
    </Card>
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
    <PageWrapper padding="md">
      <Card variant="secondary" padding="lg">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-brand-text">
            Frequently Asked Questions
          </h3>
        </div>
        <div className="space-y-3">
          {faq.map((item, index) => (
            <details key={index} className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
              <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                {item.question}
                <span className="text-opolis group-open:rotate-180 transition-transform duration-200">
                  ▼
                </span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-white/80 leading-relaxed text-sm">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </Card>
    </PageWrapper>
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
      <div>
        {/* Loading State */}
        {isLoading && (
          <PageWrapper padding="md">
            <Card variant="secondary" padding="lg" className="text-center">
              <FaSpinner className="text-6xl text-brand-accent mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-semibold text-brand-text mb-2">Loading Guide...</h2>
              <p className="text-brand-text/70">Preparing your step-by-step instructions</p>
            </Card>
          </PageWrapper>
        )}

        {/* Error State */}
        {hasError && (
          <PageWrapper padding="md">
            <Card variant="secondary" padding="lg" className="border-red-600/30 bg-red-900/20">
              <div className="flex items-start space-x-4">
                <FaExclamationTriangle className="text-red-400 mt-1 flex-shrink-0 text-2xl" />
                <div>
                  <h3 className="text-lg font-semibold text-red-200 mb-2">Something went wrong</h3>
                  <p className="text-red-200/80 mb-4">We encountered an error while loading this guide. Please try refreshing the page.</p>
                  <Button 
                    variant="primary"
                    size="sm"
                    onClick={() => window.location.reload()}
                    aria-label="Refresh page to retry loading guide"
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </Card>
          </PageWrapper>
        )}

        {/* Main Content - Only show when not loading and no errors */}
        {!isLoading && !hasError && (
          <>
            {/* Breadcrumb Navigation */}
            <PageWrapper padding="sm">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-white/70">
                  <li>
                    <Link to="/guides" className="hover:text-opolis transition-colors flex items-center">
                      <FaBookOpen className="mr-1" size={14} />
                      Guides
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <span className="mx-2">/</span>
                    <span className="text-white">{title}</span>
                  </li>
                </ol>
              </nav>
            </PageWrapper>

            {/* Main Content */}
            <PageWrapper padding="md">
              <ContentPanel 
                title={title} 
                subtitle={description}
              >
                <div className="space-y-6">
                  {/* Prerequisites Section */}
                  {prerequisites && (
                    <Card variant="secondary" padding="md">
                      <h3 className="text-lg font-semibold text-brand-text mb-4">Prerequisites</h3>
                      <div className="text-brand-text/90">
                        {prerequisites}
                      </div>
                    </Card>
                  )}

                  {/* Step Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {steps.map((step) => (
                      <div key={step.id} ref={(el) => (stepRefs.current[step.id] = el)}>
                        <Step step={step} />
                      </div>
                    ))}
                  </div>

                  {/* Success Message */}
                  {successMessage && (
                    <Card variant="secondary" padding="md" className="border-green-400/30 bg-green-500/10">
                      <div className="flex items-start space-x-4">
                        <FaCheckCircle className="text-green-400 text-2xl mt-1 flex-shrink-0" />
                        <div className="text-green-200">{successMessage}</div>
                      </div>
                    </Card>
                  )}

                  {/* Official Documentation */}
                  {officialDocs && officialDocs.length > 0 && (
                    <Card variant="secondary" padding="md">
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
                    </Card>
                  )}

                  {/* Video Embed */}
                  {videoEmbed && (
                    <Card variant="secondary" padding="md">
                      <h4 className="font-semibold text-brand-accent mb-3">{videoEmbed.title}</h4>
                      <div className="aspect-video w-full mb-3">
                        <iframe
                          className="w-full h-full rounded-lg"
                          src={videoEmbed.src}
                          title={videoEmbed.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </Card>
                  )}
                </div>
              </ContentPanel>
            </PageWrapper>

            {/* FAQ Section */}
            <FAQ faq={faq} />
          </>
        )}
      </div>
    </>
  );
}

GuideTemplate.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  keywords: PropTypes.string.isRequired,
  canonicalUrl: PropTypes.string.isRequired,
  ogTitle: PropTypes.string.isRequired,
  ogDescription: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  difficulty: PropTypes.string,
  estimatedTime: PropTypes.string,
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
    src: PropTypes.string.isRequired
  }),
  lastUpdated: PropTypes.string,
  faq: PropTypes.arrayOf(PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired
  }))
};

export default GuideTemplate;