import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeftRight,
  Box,
  Users,
  Shield,
  Upload,
  Package,
  ArrowRight,
  Trophy,
  Send,
  RefreshCw
} from 'lucide-react';
import Button from '../components/Button';
import { useHomepageStats } from '../hooks/useHomepageStats';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Presentational components
const HeroMosaicBackground = ({ loadingVaultMoments, vaultMoments }) => (
  <div className="pointer-events-none absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
    <div className="relative w-full h-full">
      {/* Gradient mask on top of mosaic */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary via-transparent to-brand-primary/90 z-10" />
      
      <div className="relative w-full h-full opacity-25">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-[2px] h-full">
          {loadingVaultMoments
            ? Array.from({ length: 120 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-sm bg-gradient-to-br from-white/10 to-white/5"
                />
              ))
            : vaultMoments.slice(0, 120).map((moment, i) => (
                <img
                  key={`mosaic-${i}`}
                  src={moment.imageUrl}
                  alt=""
                  className="w-full h-full object-cover rounded-sm"
                  style={{ filter: 'blur(4px) grayscale(0.8) saturate(0.7)' }}
                  loading="lazy"
                />
              ))}
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, value, label, index, shouldReduceMotion }) => {
  const cardVariants = shouldReduceMotion ? {} : {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.4, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <motion.div
      {...cardVariants}
      className="bg-brand-secondary rounded-xl p-1.5 sm:p-2 md:p-2.5 border border-white/20 text-center"
    >
      <div className="flex justify-center mb-0.5">
        <Icon className="text-opolis" size={18} />
      </div>
      <div className="text-base sm:text-lg md:text-xl font-bold text-opolis mb-0.5 tracking-tight">
        {value}
      </div>
      <div className="text-white/80 text-[10px] sm:text-xs">{label}</div>
    </motion.div>
  );
};

const StepCard = ({ stepNumber, icon, title, description, index, shouldReduceMotion }) => {
  const cardVariants = shouldReduceMotion ? {} : {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <motion.div
      {...cardVariants}
      className="flex-1 max-w-[200px] min-w-0"
    >
      <div className="flex flex-col h-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/20 w-full relative min-h-[180px]">
        <div className="absolute -top-3 -left-3 w-10 h-10 bg-opolis rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold z-10 shadow-lg">
          {stepNumber}
        </div>
        <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white mb-1 text-center">{title}</h3>
        <p className="text-xs sm:text-sm text-white/80 text-center">{description}</p>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({ to, icon, title, description, children, variant = "primary", buttonText, index, shouldReduceMotion }) => {
  const cardVariants = shouldReduceMotion ? {} : {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }
  };

  const baseClasses = variant === "highlight" 
    ? "bg-gradient-to-br from-brand-primary to-opolis/5 rounded-2xl p-5 sm:p-6 border-2 border-opolis/40 hover:border-opolis hover:shadow-2xl hover:shadow-opolis/30"
    : "bg-brand-primary rounded-2xl p-5 sm:p-6 border border-brand-border hover:border-opolis/60 hover:shadow-xl";

  return (
    <motion.div {...cardVariants} className="flex h-full">
      <Link 
        to={to} 
        className={`${baseClasses} transition-all duration-300 flex flex-col cursor-pointer group relative overflow-hidden h-full w-full`}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-opolis/0 to-opolis/0 group-hover:from-opolis/5 group-hover:to-opolis/0 transition-all duration-300 pointer-events-none" />
        
        {/* Feature badge */}
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-opolis/20 flex items-center justify-center text-xs font-bold text-opolis opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {index + 1}
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-brand-text text-center mb-2">
            {title}
          </h3>
          <div className="min-h-[3rem] mb-4 flex items-center justify-center">
            <p className="text-sm text-brand-text/70 text-center">
              {description}
            </p>
          </div>
          <div className="flex-grow flex items-start justify-center">
            {children}
          </div>
          <div className="mt-auto pt-2">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            >
              <Button variant={variant === "highlight" ? "opolis" : variant === "secondary" ? "secondary" : "primary"} size="md" className="w-full inline-flex items-center justify-center gap-2 bg-opolis/20 border-2 border-opolis/40 hover:bg-opolis/30 hover:border-opolis text-white transition-all duration-300">
                {buttonText}
                <ArrowRight className="h-4 w-4 transition-transform duration-300" />
              </Button>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Home = () => {
  const { vaultSummary, analyticsData, loading } = useHomepageStats();
  const shouldReduceMotion = useReducedMotion();
  // Hardcoded moment ID 1337 for mosaic
  const MOMENT_ID = 1337;
  const MOMENT_IMAGE_URL = `https://assets.nbatopshot.com/media/${MOMENT_ID}/image?width=60&quality=40`;
  const loadingVaultMoments = false;
  const vaultMoments = Array.from({ length: 120 }, (_, i) => ({
    id: MOMENT_ID,
    imageUrl: MOMENT_IMAGE_URL
  }));
  

  const sectionVariants = shouldReduceMotion ? {} : {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <>
      <Helmet>
        <title>Vaultopolis</title>
        <meta
          name="description"
          content="Vaultopolis is a smart-contract platform unlocking liquidity and utility for digital collectibles. TSHOT is our first live token, giving Top Shot collectors instant liquidity."
        />
        <meta name="keywords" content="vaultopolis, digital collectibles, nft liquidity, flow blockchain, tshot, nba top shot, defi" />
        <link rel="canonical" href="https://vaultopolis.com" />
        
        <meta property="og:title" content="Vaultopolis - Unlock Liquidity for Digital Collectibles" />
        <meta property="og:description" content="A decentralized protocol that unlocks liquidity and utility for digital collectibles. TSHOT is our first live token for Top Shot collectors." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png" />
      </Helmet>

      <div className="w-full text-brand-text">
        {/* 1. HERO SECTION */}
        <motion.div 
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary pt-4 sm:pt-6 pb-6 sm:pb-12 overflow-hidden"
        >
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Radial gradient glow behind stats */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-opolis/10 rounded-full blur-3xl opacity-50" />
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
            </div>

          {/* Vault mosaic spans full hero - behind both columns and buttons */}
          <HeroMosaicBackground loadingVaultMoments={loadingVaultMoments} vaultMoments={vaultMoments} />
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
              
            {/* Desktop: 2-column layout, Mobile: stacked */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
              {/* LEFT: Headline / copy with background */}
              <div className="text-center md:text-left relative flex flex-col gap-6 sm:gap-8 min-h-0">
                {/* Title and tagline */}
                <div className="relative bg-brand-secondary border border-white/15 rounded-2xl p-3 sm:p-5 shadow-2xl w-full">
                  <motion.div {...(shouldReduceMotion ? {} : fadeInUp)}>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 max-w-3xl mx-auto md:mx-0 leading-tight">
                      Your Collection, Unlocked.
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto md:mx-0 leading-relaxed">
                      A platform that unlocks liquidity and new ways to use your digital collectibles.
                    </p>
                  </motion.div>
                </div>
                
                {/* Hero CTA - separate area */}
                <motion.div 
                  {...(shouldReduceMotion ? {} : { ...fadeInUp, transition: { ...fadeInUp.transition, delay: 0.3 } })}
                  className="flex justify-center"
                >
                  <Link to="/swap">
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    >
                      <Button
                        variant="primary"
                        size="lg"
                        className="inline-flex items-center gap-2 rounded-full px-8 py-3 bg-opolis/20 border-2 border-opolis/40 hover:bg-opolis/30 hover:border-opolis text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        Start Swapping
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
              
              {/* RIGHT: Stats */}
              <div className="relative mt-6 md:mt-0">
                {/* TSHOT Intro with logo - above stats */}
                <motion.div 
                  {...(shouldReduceMotion ? {} : { ...fadeInUp, transition: { ...fadeInUp.transition, delay: 0.15 } })}
                  className="mb-4"
                >
                  <div className="bg-brand-secondary rounded-2xl px-4 py-2 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img
                        src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                        alt="TSHOT"
                        className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                      />
                      <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-xl text-left">
                        TSHOT is our first live token, giving Top Shot collectors instant liquidity.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Stats grid */}
                <motion.div
                  {...(shouldReduceMotion ? {} : { ...staggerContainer, ...fadeInUp, transition: { ...fadeInUp.transition, delay: 0.25 } })}
                  className="grid grid-cols-2 gap-3 sm:gap-4"
                >
                  <StatCard
                    icon={Box}
                    value={loading ? "..." : vaultSummary?.total ? vaultSummary.total.toLocaleString() : "..."}
                    label="Moments in Vault"
                    index={0}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <StatCard
                    icon={ArrowLeftRight}
                    value={loading ? "..." : analyticsData?.totalMomentsExchanged ? analyticsData.totalMomentsExchanged.toLocaleString() : "..."}
                    label="Moments Swapped"
                    index={1}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <StatCard
                    icon={Shield}
                    value="1:1"
                    label="Fully Backed"
                    index={2}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                  <StatCard
                    icon={Users}
                    value="500+"
                    label="Active Users"
                    index={3}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. TSHOT + HOW IT WORKS - GROUPED TOGETHER */}
        <motion.section 
          {...sectionVariants}
          className="relative bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary py-10 sm:py-12 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-opolis/5 rounded-full blur-2xl opacity-70" />
            </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            {/* How It Works */}
            <motion.h2 
              {...(shouldReduceMotion ? {} : { ...fadeInUp })}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white text-center mb-4 sm:mb-6"
            >
              How TSHOT Works
            </motion.h2>
            
            {/* 4-Step Flow - Desktop: Horizontal with arrows */}
            <div className="hidden md:block">
              <motion.div 
                {...(shouldReduceMotion ? {} : staggerContainer)}
                className="flex items-stretch justify-center gap-2 sm:gap-4 max-w-5xl mx-auto"
              >
                <StepCard
                  stepNumber="1"
                  icon={<Upload className="w-8 h-8 text-opolis" />}
                  title="Deposit"
                  description="Add Moments you want to trade"
                  index={0}
                  shouldReduceMotion={shouldReduceMotion}
                />

              {/* Arrow 1 */}
                <div className="flex-shrink-0 flex items-center">
                  <ArrowRight className="w-6 h-6 text-opolis" />
                </div>

                <StepCard
                  stepNumber="2"
                  icon={<img src="https://storage.googleapis.com/vaultopolis/TSHOT.png" alt="TSHOT" className="w-10 h-10 object-contain" />}
                  title="Mint TSHOT"
                  description="Get 1 TSHOT per Moment"
                  index={1}
                  shouldReduceMotion={shouldReduceMotion}
                />

              {/* Arrow 2 */}
                <div className="flex-shrink-0 flex items-center">
                  <ArrowRight className="w-6 h-6 text-opolis" />
                </div>

                <StepCard
                  stepNumber="3"
                  icon={<Package className="w-8 h-8 text-opolis" />}
                  title="Redeem"
                  description="Redeem TSHOT for a random vault Moment — no fees"
                  index={2}
                  shouldReduceMotion={shouldReduceMotion}
                />

                {/* Arrow 3 */}
                <div className="flex-shrink-0 flex items-center">
                  <ArrowRight className="w-6 h-6 text-opolis" />
                </div>

                <StepCard
                  stepNumber="4"
                  icon={<RefreshCw className="w-8 h-8 text-opolis" />}
                  title="Keep or Recycle"
                  description="Keep your favorites, deposit the rest, and repeat"
                  index={3}
                  shouldReduceMotion={shouldReduceMotion}
                />
              </motion.div>

              {/* Loop Arrow: Step 4 → Step 1 (curved) */}
              <motion.div 
                className="hidden md:block relative max-w-5xl mx-auto mt-3"
                style={{ height: '50px' }}
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  <defs>
                    <marker id="arrowhead-loop" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#00D9FF" />
                    </marker>
                  </defs>
                  <motion.path
                    d="M 85 10 Q 50 35, 15 10"
                    stroke="#00D9FF"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead-loop)"
                    className="opacity-80"
                    initial={shouldReduceMotion ? {} : { pathLength: 0, opacity: 0 }}
                    whileInView={shouldReduceMotion ? {} : { pathLength: 1, opacity: 0.8 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeInOut" }}
                  />
                </svg>
              </motion.div>

              {/* View Vault and Learn More buttons - Desktop */}
              <div className="mt-2 flex justify-center gap-4 flex-wrap">
                {/* View Vault Button */}
                <motion.div 
                  {...(shouldReduceMotion ? {} : { ...fadeInUp, transition: { ...fadeInUp.transition, delay: 0.7 } })}
                >
                  <Link to="/vault-contents" className="block">
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                      className="flex flex-col bg-opolis/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-opolis/40 relative cursor-pointer hover:bg-opolis/30 hover:border-opolis shadow-xl hover:shadow-2xl min-w-[320px]"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Box className="w-6 h-6 text-opolis flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-bold text-white">View Vault</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 text-left">See all Moments in the TSHOT vault</p>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Learn More Button */}
                <motion.div 
                  {...(shouldReduceMotion ? {} : { ...fadeInUp, transition: { ...fadeInUp.transition, delay: 0.8 } })}
                >
                  <Link to="/tshot" className="block">
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                      className="flex flex-col bg-opolis/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-opolis/40 relative cursor-pointer hover:bg-opolis/30 hover:border-opolis shadow-xl hover:shadow-2xl min-w-[320px]"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowRight className="w-6 h-6 text-opolis flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-bold text-white">Learn More About TSHOT</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 text-left">Discover how TSHOT works and get started</p>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
              </div>

            {/* 4-Step Flow - Mobile: Vertical with arrows */}
            <div className="md:hidden space-y-3 sm:space-y-4 max-w-sm mx-auto">
              {[
                { step: "1", icon: <Upload className="w-8 h-8 text-opolis" />, title: "Deposit", desc: "Add Moments you want to trade" },
                { step: "2", icon: <img src="https://storage.googleapis.com/vaultopolis/TSHOT.png" alt="TSHOT" className="w-10 h-10 object-contain" />, title: "Mint TSHOT", desc: "Get 1 TSHOT per Moment" },
                { step: "3", icon: <Package className="w-8 h-8 text-opolis" />, title: "Redeem", desc: "Redeem TSHOT for a random vault Moment — no fees" },
                { step: "4", icon: <RefreshCw className="w-8 h-8 text-opolis" />, title: "Keep or Recycle", desc: "Keep your favorites, deposit the rest, and repeat" }
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <motion.div
                    {...(shouldReduceMotion ? {} : {
                      initial: { opacity: 0, y: 20 },
                      whileInView: { opacity: 1, y: 0 },
                      viewport: { once: true, margin: "-50px" },
                      transition: { duration: 0.4, delay: idx * 0.1 }
                    })}
                    className="flex flex-col items-center text-center w-full"
                  >
                    <div className="flex flex-col h-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/20 w-full relative">
                      <div className="absolute -top-3 -left-3 w-10 h-10 bg-opolis rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold z-10 shadow-lg">
                        {step.step}
                      </div>
                  <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                        {step.icon}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-white/80">{step.desc}</p>
                  </div>
                  </motion.div>
                  {idx < 3 && (
                    <div className="flex items-center justify-center py-0.5">
                      <div className="text-opolis text-3xl sm:text-4xl font-bold">↓</div>
                </div>
                  )}
                </React.Fragment>
              ))}

              {/* View Vault and Learn More buttons - Mobile */}
              <div className="mt-2 flex justify-center gap-4 flex-wrap">
                {/* View Vault Button */}
                <motion.div 
                  {...(shouldReduceMotion ? {} : { ...fadeInUp, transition: { ...fadeInUp.transition, delay: 0.7 } })}
                >
                  <Link to="/vault-contents" className="block">
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                      className="flex flex-col bg-opolis/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-opolis/40 relative cursor-pointer hover:bg-opolis/30 hover:border-opolis shadow-xl hover:shadow-2xl min-w-[320px]"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Box className="w-6 h-6 text-opolis flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-bold text-white">View Vault</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 text-left">See all Moments in the TSHOT vault</p>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Learn More Button */}
                <motion.div 
                  {...(shouldReduceMotion ? {} : { ...fadeInUp, transition: { ...fadeInUp.transition, delay: 0.8 } })}
                >
                  <Link to="/tshot" className="block">
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                      className="flex flex-col bg-opolis/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-opolis/40 relative cursor-pointer hover:bg-opolis/30 hover:border-opolis shadow-xl hover:shadow-2xl min-w-[320px]"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowRight className="w-6 h-6 text-opolis flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-bold text-white">Learn More About TSHOT</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 text-left">Discover how TSHOT works and get started</p>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </div>
            
          </div>
        </motion.section>

        {/* 4. PLATFORM FEATURES SECTION */}
        <motion.section 
          {...sectionVariants}
          className="relative bg-gradient-to-b from-brand-background via-brand-background/95 to-brand-primary/20 py-8 sm:py-12 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-opolis/5 rounded-full blur-3xl opacity-30" />
            {/* Subtle grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
            </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <motion.h2 
              {...(shouldReduceMotion ? {} : fadeInUp)}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-brand-text text-center mb-3 sm:mb-4"
            >
              Three Ways to Use Vaultopolis
            </motion.h2>
            <motion.p 
              {...(shouldReduceMotion ? {} : { ...fadeInUp, transition: { ...fadeInUp.transition, delay: 0.1 } })}
              className="text-sm text-brand-text/70 text-center max-w-2xl mx-auto mb-4 sm:mb-6"
            >
              TSHOT liquidity, grail bounties, and bulk transfer — built for NBA Top Shot and NFL All Day collectors.
            </motion.p>
            
            {/* Feature Cards Grid */}
            <motion.div 
              {...(shouldReduceMotion ? {} : { ...staggerContainer, ...fadeInUp, transition: { ...fadeInUp.transition, delay: 0.2 } })}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch"
            >
              <FeatureCard
                to="/tshot" 
                icon={<img src="https://storage.googleapis.com/vaultopolis/TSHOT.png" alt="TSHOT" className="w-10 h-10 object-contain" />}
                title="TSHOT Liquidity"
                description="Swap Moments ↔ TSHOT. Redeem anytime."
                variant="primary"
                buttonText="Launch Swap"
                index={0}
                shouldReduceMotion={shouldReduceMotion}
              >
                {/* Vault Count Stat */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-opolis/20">
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-text">
                      {loading ? "..." : vaultSummary?.total ? vaultSummary.total.toLocaleString() : "..."}
                    </div>
                    <div className="text-xs text-brand-text/70">Moments in Vault</div>
                  </div>
                </div>
              </FeatureCard>

              <FeatureCard
                to="/bounties/topshot"
                icon={<Trophy className="w-10 h-10 text-opolis" />}
                title="Sell Grails for Premium"
                description="Treasury-backed offers for high-end Moments."
                variant="primary"
                buttonText="Browse Bounties"
                index={1}
                shouldReduceMotion={shouldReduceMotion}
              >
                {/* Grails Acquired Stat */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-opolis/20">
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-text">$60,000+</div>
                    <div className="text-xs text-brand-text/70">Grails Acquired for Treasury</div>
                  </div>
                </div>
              </FeatureCard>

              <FeatureCard
                to="/transfer"
                icon={<Send className="w-10 h-10 text-opolis" />}
                title="Bulk Transfer"
                description="Move up to 280 Moments instantly."
                variant="primary"
                buttonText="Open Transfer Tool"
                index={2}
                shouldReduceMotion={shouldReduceMotion}
              >
                {/* Bulk Transfer Stats */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-opolis/20">
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-text">90,000+</div>
                    <div className="text-xs text-brand-text/70">Moments Transferred</div>
                  </div>
                </div>
              </FeatureCard>
            </motion.div>
          </div>
        </motion.section>

      </div>
    </>
  );
};

export default Home;
