import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { SEO_HUBS_DATA } from '../data/seoHubs';
import { HeroWaterRipple, HeroWaterRippleRef } from './HeroWaterRipple';
import { ScrollRevealSection } from './ScrollRevealSection';
import { SearchConsoleSection } from './SearchConsoleSection';

// Image Assets
import heroDroneBg from '../assets/images/african_market_drone_1786362850717.jpg';
import howItWorksImg from '../assets/images/how_it_works_nigerian_pro_1786366015890.jpg';
import forBuyersImg from '../assets/images/for_buyers_market_1786366029279.jpg';
import forMerchantsImg from '../assets/images/for_merchants_owner_1786366041084.jpg';
import featuresImg from '../assets/images/features_businessman_phone_1786366731614.jpg';
import trustImg from '../assets/images/trust_entrepreneur_1786366061571.jpg';
import whatsappImg from '../assets/images/whatsapp_phones_1786366073933.jpg';

interface LandingPageProps {
  onStartDemo?: () => void;
  onLogin?: () => void;
  onSelectHub?: (slug: string) => void;
  onNavigatePage?: (page: 'PRIVACY' | 'TERMS' | 'ABOUT') => void;
}

const TELEGRAM_BOT_URL = "https://wa.me/message/YYWEZAZZIXBRF1";
const WHATSAPP_BOT_URL = "https://wa.me/message/YYWEZAZZIXBRF1";
const REGISTER_BUSINESS_URL = "https://wa.me/message/YYWEZAZZIXBRF1?text=REGISTER_BUSINESS";
const CLAIM_BUSINESS_URL = "https://wa.me/message/YYWEZAZZIXBRF1?text=CLAIM_BUSINESS";
const TWITTER_URL = "https://x.com/Floatehq";

export default function LandingPage({ onSelectHub, onNavigatePage }: LandingPageProps) {
  const waterRippleRef = useRef<HeroWaterRippleRef | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState<'BUYERS' | 'MERCHANTS'>('BUYERS');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (waterRippleRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      waterRippleRef.current.triggerRipple(x, y, 750, 9);
    }
    setTimeout(() => {
      window.open(TELEGRAM_BOT_URL, '_blank', 'noopener,noreferrer');
    }, 600);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    {
      question: "What is FLOATE AI?",
      answer: "FLOATE AI is an AI assistant and conversational commerce engine for African businesses and buyers. Delivered directly through Telegram and WhatsApp Business, FLOATE AI connects buyers searching for products in natural language with verified local merchants."
    },
    {
      question: "How do buyers search for products on FLOATE AI?",
      answer: "Buyers type plain natural language prompts or send voice notes describing what they need. FLOATE AI instantly recommends verified local vendors near them."
    },
    {
      question: "Is FLOATE AI free for local businesses?",
      answer: "Yes. Business registration and product indexing on FLOATE AI are 100% free. Merchants receive starter credits and pay only per qualified lead."
    },
    {
      question: "What happens after a buyer gets matched with a seller?",
      answer: "When FLOATE AI recommends a matching business, it opens a direct Telegram or WhatsApp conversation so the buyer and merchant can confirm stock, negotiate, and complete the transaction directly."
    },
    {
      question: "How do I access FLOATE AI on Telegram?",
      answer: "You can chat with FLOATE AI directly on Telegram by opening t.me/Floatebusinessbot or clicking 'Launch Telegram Bot'. No app download or account setup is required."
    },
    {
      question: "Is FLOATE AI safe and legitimate?",
      answer: "Yes. FLOATE AI is developed and operated by FLOATE AFRICA LTD (RC: 9365804). We verify vendor registrations to ensure businesses are authentic."
    }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#2C2C2C] font-sans antialiased selection:bg-[#F7F4FB] selection:text-[#5C2D91] relative overflow-x-hidden">
      
      {/* SECTION 1: FIXED NAVIGATION BAR (Height: 72px) */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 flex items-center ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80' 
            : 'bg-transparent text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full flex items-center justify-between">
          
          {/* Left: Brand Logo + Mobile Hamburger Button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 cursor-pointer focus:outline-none"
            >
              <span className={`h-[2px] w-5 transition-all ${scrolled ? 'bg-[#2C2C2C]' : 'bg-white'}`} />
              <span className={`h-[2px] w-5 transition-all ${scrolled ? 'bg-[#2C2C2C]' : 'bg-white'}`} />
              <span className={`h-[2px] w-5 transition-all ${scrolled ? 'bg-[#2C2C2C]' : 'bg-white'}`} />
            </button>

            <a href="#" className="flex items-center space-x-2.5 group">
              <img 
                src="https://i.postimg.cc/nzQ7WvPK/20260807-223513.jpg" 
                alt="FLOATE AI Logo" 
                className="h-8 w-auto object-contain rounded-md shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span className="text-[18px] font-semibold tracking-[3px] uppercase font-display">
                <span className={scrolled ? 'text-[#2C2C2C]' : 'text-white'}>FLOATE </span>
                <span className="text-[#E8B923]">AI</span>
              </span>
            </a>
          </div>

          {/* Right Links & CTA */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <nav className="hidden md:flex items-center space-x-8 text-[13px] uppercase tracking-[1px] font-medium">
              <a 
                href="#how-it-works" 
                onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}
                className={`${scrolled ? 'text-[#2C2C2C]' : 'text-white'} hover:underline`}
              >
                How It Works
              </a>
              <a 
                href="#solutions" 
                onClick={(e) => { e.preventDefault(); setActiveRoleTab('BUYERS'); scrollToSection('solutions'); }}
                className={`${scrolled ? 'text-[#2C2C2C]' : 'text-white'} hover:underline`}
              >
                For Buyers
              </a>
              <a 
                href="#solutions" 
                onClick={(e) => { e.preventDefault(); setActiveRoleTab('MERCHANTS'); scrollToSection('solutions'); }}
                className={`${scrolled ? 'text-[#2C2C2C]' : 'text-white'} hover:underline`}
              >
                For Merchants
              </a>
              <a 
                href="#features" 
                onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}
                className={`${scrolled ? 'text-[#2C2C2C]' : 'text-white'} hover:underline`}
              >
                Features
              </a>
              <a 
                href="#faq" 
                onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
                className={`${scrolled ? 'text-[#2C2C2C]' : 'text-white'} hover:underline`}
              >
                FAQ
              </a>
            </nav>

            <a 
              href={CLAIM_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden lg:inline-block text-[11px] uppercase tracking-[1px] font-bold ${scrolled ? 'text-[#5C2D91]' : 'text-[#E8B923]'} hover:underline`}
            >
              Claim Shop
            </a>

            <a 
              href={REGISTER_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E8B923] text-[#3B1A5C] px-4 sm:px-5 py-2.5 text-[11px] sm:text-[12px] uppercase tracking-[1.5px] font-bold transition-all hover:bg-[#F5E6A3] rounded-md shadow-xs shrink-0"
            >
              REGISTER YOUR BUSINESS
            </a>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[72px] left-0 right-0 bg-[#2C2C2C] text-white p-8 space-y-6 text-[13px] uppercase tracking-[1.5px] border-b border-white/10 shadow-2xl"
            >
              <a 
                href="#how-it-works" 
                onClick={() => { setMobileMenuOpen(false); scrollToSection('how-it-works'); }} 
                className="block hover:text-[#E8B923]"
              >
                How It Works
              </a>
              <a 
                href="#solutions" 
                onClick={() => { setMobileMenuOpen(false); setActiveRoleTab('BUYERS'); scrollToSection('solutions'); }} 
                className="block hover:text-[#E8B923]"
              >
                For Buyers
              </a>
              <a 
                href="#solutions" 
                onClick={() => { setMobileMenuOpen(false); setActiveRoleTab('MERCHANTS'); scrollToSection('solutions'); }} 
                className="block hover:text-[#E8B923]"
              >
                For Merchants
              </a>
              <a 
                href="#features" 
                onClick={() => { setMobileMenuOpen(false); scrollToSection('features'); }} 
                className="block hover:text-[#E8B923]"
              >
                Features
              </a>
              <a 
                href="#faq" 
                onClick={() => { setMobileMenuOpen(false); scrollToSection('faq'); }} 
                className="block hover:text-[#E8B923]"
              >
                FAQ
              </a>
              <a 
                href={CLAIM_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center border border-[#E8B923] text-[#E8B923] py-2.5 text-xs uppercase tracking-[1.5px] font-bold rounded-md"
              >
                Claim Existing Shop
              </a>
              <a 
                href={REGISTER_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-[#E8B923] text-[#3B1A5C] py-3 text-xs uppercase tracking-[1.5px] font-bold rounded-md"
              >
                REGISTER YOUR BUSINESS
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SECTION 2: HERO (ALREADY BUILT — PRESERVED EXPLICITLY) */}
      <section id="hero" className="min-h-screen relative flex flex-col justify-center items-center text-center px-4 sm:px-8 pt-20 pb-12 overflow-hidden bg-[#12051E]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Mobile Background: Rich Dark Purple & Black Gradient */}
          <div className="block md:hidden absolute inset-0 bg-gradient-to-b from-[#3B1A5C] via-[#24103B] to-[#12051E]" />

          {/* Desktop Background: Image with Water Ripple Effect */}
          <div className="hidden md:block absolute inset-0">
            <HeroWaterRipple ref={waterRippleRef} imageSrc={heroDroneBg} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#2C2C2C]/80 via-[#3B1A5C]/75 to-[#2C2C2C]/90 pointer-events-none" />
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-6 my-auto py-6 relative z-10 flex flex-col items-center justify-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] font-display max-w-3xl mx-auto drop-shadow-lg">
            Stop scrolling.{' '}
            <span className="bg-gradient-to-r from-[#E8B923] via-[#F5E6A3] to-[#E8B923] bg-clip-text text-transparent">
              Start finding.
            </span>
          </h1>

          <div className="w-full pt-2">
            <SearchConsoleSection />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer group z-10" onClick={() => scrollToSection('how-it-works')}>
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-[3px] group-hover:text-[#E8B923] transition">
            Scroll to explore
          </span>
          <div className="w-2 h-2 border-b-2 border-r-2 border-[#E8B923] transform rotate-45 animate-bounce" />
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS (SOLID Muted Gold #E8B923, Padding: 240px) */}
      <ScrollRevealSection id="how-it-works" wipeColor="#E8B923" className="bg-[#E8B923] text-[#3B1A5C] py-[160px] lg:py-[240px] px-6 sm:px-12 relative">
        <div className="max-w-6xl mx-auto space-y-24">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto reveal-item">
            <span className="block text-[12px] uppercase tracking-[3px] font-medium opacity-60">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-5xl font-medium font-display leading-[1.15]">
              Three steps from search to sold.
            </h2>
          </div>

          {/* Three Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-[1000px] mx-auto items-start relative">
            
            {/* Step 1 */}
            <div className="space-y-4 relative pr-4 reveal-item">
              <span className="block font-display text-[72px] font-extralight text-[#3B1A5C]/30 leading-none">
                01
              </span>
              <h3 className="font-display text-[24px] font-medium text-[#3B1A5C]">
                Search
              </h3>
              <p className="text-[16px] leading-[1.7] text-[#3B1A5C]/80 font-sans max-w-[280px]">
                Type what you want in plain English. Our AI finds verified sellers near you.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 relative pr-4 md:border-l md:border-[#3B1A5C]/20 md:pl-8 reveal-item">
              <span className="block font-display text-[72px] font-extralight text-[#3B1A5C]/30 leading-none">
                02
              </span>
              <h3 className="font-display text-[24px] font-medium text-[#3B1A5C]">
                Connect
              </h3>
              <p className="text-[16px] leading-[1.7] text-[#3B1A5C]/80 font-sans max-w-[280px]">
                Get matched on Telegram. No app download needed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 relative md:border-l md:border-[#3B1A5C]/20 md:pl-8 reveal-item">
              <span className="block font-display text-[72px] font-extralight text-[#3B1A5C]/30 leading-none">
                03
              </span>
              <h3 className="font-display text-[24px] font-medium text-[#3B1A5C]">
                Buy
              </h3>
              <p className="text-[16px] leading-[1.7] text-[#3B1A5C]/80 font-sans max-w-[280px]">
                Talk directly with the seller. Close the deal your way.
              </p>
            </div>

          </div>

          {/* Editorial Lifestyle Photograph */}
          <div className="max-w-4xl mx-auto pt-8 reveal-item">
            <div className="overflow-hidden shadow-2xl rounded-xs">
              <img 
                src={howItWorksImg} 
                alt="Young Nigerian professional typing on smartphone"
                referrerPolicy="no-referrer"
                className="w-full h-[400px] sm:h-[520px] object-cover object-center filter saturate-[0.95]"
              />
            </div>
          </div>

        </div>
      </ScrollRevealSection>

      {/* SECTION 4: FOR BUYERS / FOR MERCHANTS (SOLID Soft Lavender White #F7F4FB, Padding: 240px) */}
      <ScrollRevealSection id="solutions" wipeColor="#F7F4FB" className="bg-[#F7F4FB] text-[#2C2C2C] py-[160px] lg:py-[240px] px-6 sm:px-12 relative">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Toggle Tabs */}
          <div className="flex justify-center space-x-6 border-b border-[#2C2C2C]/10 pb-6 max-w-xs mx-auto reveal-item">
            <button
              type="button"
              onClick={() => setActiveRoleTab('BUYERS')}
              className={`text-[12px] uppercase tracking-[1.5px] py-2 transition-all ${
                activeRoleTab === 'BUYERS'
                  ? 'bg-[#3B1A5C] text-white px-6 font-semibold'
                  : 'text-[#2C2C2C] hover:opacity-80'
              }`}
            >
              For Buyers
            </button>
            <button
              type="button"
              onClick={() => setActiveRoleTab('MERCHANTS')}
              className={`text-[12px] uppercase tracking-[1.5px] py-2 transition-all ${
                activeRoleTab === 'MERCHANTS'
                  ? 'bg-[#3B1A5C] text-white px-6 font-semibold'
                  : 'text-[#2C2C2C] hover:opacity-80'
              }`}
            >
              For Merchants
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeRoleTab === 'BUYERS' ? (
              <motion.div
                key="buyers"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-[1100px] mx-auto reveal-item"
              >
                <div className="lg:col-span-7 space-y-6">
                  <span className="block text-[12px] uppercase tracking-[3px] font-medium text-[#5C2D91]">
                    FOR BUYERS
                  </span>

                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.15] text-[#2C2C2C]">
                    Find exactly what you want, <span className="text-[#5C2D91]">near you</span>, from real people.
                  </h2>

                  <p className="text-[16px] leading-[1.7] text-[#2C2C2C]/70 max-w-[420px]">
                    Type naturally — like you are texting a friend. Our AI understands Nigerian Pidgin, Yoruba, and plain English. Filter by location, budget, and urgency.
                  </p>

                  <div className="space-y-3 pt-4">
                    {[
                      "Natural language search",
                      "Geo-filtered results by state and city",
                      "Verified merchants only",
                      "Direct Telegram connection"
                    ].map((item, idx) => (
                      <div key={idx} className="border-l-2 border-[#5C2D91] pl-4 py-1 text-[15px] text-[#2C2C2C] font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="overflow-hidden shadow-[0_40px_80px_rgba(92,45,145,0.08)]">
                    <img 
                      src={forBuyersImg} 
                      alt="Bustling Nigerian open air market scene"
                      referrerPolicy="no-referrer"
                      className="w-full h-[450px] object-cover object-center"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="merchants"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-[1100px] mx-auto reveal-item"
              >
                <div className="lg:col-span-7 space-y-6">
                  <span className="block text-[12px] uppercase tracking-[3px] font-medium text-[#E8B923]">
                    FOR MERCHANTS
                  </span>

                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.15] text-[#2C2C2C]">
                    List your stock by <span className="text-[#E8B923]">talking, snapping, or typing</span>. We handle the rest.
                  </h2>

                  <p className="text-[16px] leading-[1.7] text-[#2C2C2C]/70 max-w-[420px]">
                    No forms. No spreadsheets. Send a voice note, a photo, or a quick message. Our AI structures it into a live, searchable listing.
                  </p>

                  <div className="space-y-3 pt-4">
                    {[
                      "AI parses voice, photos, and text",
                      "Instant publishing to live catalog",
                      "Pay only for qualified leads",
                      "Free credits to start",
                      "Real-time lead notifications"
                    ].map((item, idx) => (
                      <div key={idx} className="border-l-2 border-[#E8B923] pl-4 py-1 text-[15px] text-[#2C2C2C] font-medium">
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <a 
                      href={REGISTER_BUSINESS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#5C2D91] hover:bg-[#3B1A5C] text-white px-6 py-3.5 text-xs uppercase tracking-[1.5px] font-extrabold rounded-xl shadow-md transition transform hover:scale-[1.02]"
                    >
                      <span>Register Your Business</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="overflow-hidden shadow-[0_40px_80px_rgba(92,45,145,0.08)]">
                    <img 
                      src={forMerchantsImg} 
                      alt="Nigerian small business owner smiling with smartphone"
                      referrerPolicy="no-referrer"
                      className="w-full h-[450px] object-cover object-center"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </ScrollRevealSection>

      {/* SECTION 5: FEATURES (SOLID Deep Plum #3B1A5C, Padding: 240px) */}
      <ScrollRevealSection id="features" wipeColor="#3B1A5C" className="bg-[#3B1A5C] text-white py-[160px] lg:py-[240px] px-6 sm:px-12 relative">
        <div className="max-w-6xl mx-auto space-y-20">
          
          <div className="space-y-4 max-w-xl reveal-item">
            <h2 className="font-display text-3xl sm:text-5xl font-medium leading-[1.15] text-white">
              Built for how Africans actually buy and sell.
            </h2>
            <p className="text-[17px] text-white/50 leading-[1.7]">
              Every feature designed for the realities of informal commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            
            <div className="space-y-3 reveal-item">
              <span className="block font-display text-[48px] font-extralight text-[#E8B923]/40 leading-none">
                01
              </span>
              <h3 className="font-display text-[20px] font-medium text-white">
                Voice, Photo and Text Listings
              </h3>
              <p className="text-[15px] leading-[1.7] text-white/60 max-w-[320px]">
                Merchants send voice notes, photos, or casual text. Gemini AI extracts product name, price, location, and stock automatically.
              </p>
            </div>

            <div className="space-y-3 reveal-item">
              <span className="block font-display text-[48px] font-extralight text-[#E8B923]/40 leading-none">
                02
              </span>
              <h3 className="font-display text-[20px] font-medium text-white">
                Demand-Supply Lead Radar
              </h3>
              <p className="text-[15px] leading-[1.7] text-white/60 max-w-[320px]">
                The moment you list stock, our radar scans for buyers who searched for that item in your area and alerts them instantly.
              </p>
            </div>

            <div className="space-y-3 reveal-item">
              <span className="block font-display text-[48px] font-extralight text-[#E8B923]/40 leading-none">
                03
              </span>
              <h3 className="font-display text-[20px] font-medium text-white">
                Spam-Free AI Qualification
              </h3>
              <p className="text-[15px] leading-[1.7] text-white/60 max-w-[320px]">
                Every buyer is qualified by our Telegram bot before you ever see them. Budget, location, urgency, confirmed.
              </p>
            </div>

            <div className="space-y-3 reveal-item">
              <span className="block font-display text-[48px] font-extralight text-[#E8B923]/40 leading-none">
                04
              </span>
              <h3 className="font-display text-[20px] font-medium text-white">
                Merchant Privacy Shield
              </h3>
              <p className="text-[15px] leading-[1.7] text-white/60 max-w-[320px]">
                Your phone number stays hidden until you approve the lead. No scrapers. No spam. Just real buyers.
              </p>
            </div>

            <div className="space-y-3 reveal-item">
              <span className="block font-display text-[48px] font-extralight text-[#E8B923]/40 leading-none">
                05
              </span>
              <h3 className="font-display text-[20px] font-medium text-white">
                Telegram and WhatsApp Native
              </h3>
              <p className="text-[15px] leading-[1.7] text-white/60 max-w-[320px]">
                No app to download. Buyers and sellers stay in the messaging apps they already use every day.
              </p>
            </div>

            <div className="space-y-3 reveal-item">
              <span className="block font-display text-[48px] font-extralight text-[#E8B923]/40 leading-none">
                06
              </span>
              <h3 className="font-display text-[20px] font-medium text-white">
                Live Business Analytics
              </h3>
              <p className="text-[15px] leading-[1.7] text-white/60 max-w-[320px]">
                Track leads, sales, inventory, and credit balance, all inside Telegram. Google Sheets backup included.
              </p>
            </div>

          </div>

          {/* Editorial Photograph - Young Businessman with Smartphone */}
          <div className="pt-12 reveal-item">
            <div className="overflow-hidden shadow-2xl max-w-4xl mx-auto rounded-xs">
              <img 
                src={featuresImg} 
                alt="Young African businessman looking at smartphone and smiling"
                referrerPolicy="no-referrer"
                className="w-full h-[380px] sm:h-[480px] object-cover object-center"
              />
            </div>
          </div>

        </div>
      </ScrollRevealSection>

      {/* SECTION 6: TRUST & SECURITY (SOLID Pale Gold #F5E6A3, Padding: 240px) */}
      <ScrollRevealSection id="trust" wipeColor="#F5E6A3" className="bg-[#F5E6A3] text-[#3B1A5C] py-[160px] lg:py-[240px] px-6 sm:px-12 relative">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto reveal-item">
            <span className="block text-[12px] uppercase tracking-[3px] font-medium text-[#3B1A5C]/60">
              TRUST AND PRIVACY
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium leading-[1.15] text-[#3B1A5C]">
              Built on trust. Backed by security.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-[1100px] mx-auto">
            
            <div className="lg:col-span-5 reveal-item">
              <div className="overflow-hidden shadow-xl">
                <img 
                  src={trustImg} 
                  alt="Confident Nigerian entrepreneur in shop"
                  referrerPolicy="no-referrer"
                  className="w-full h-[460px] object-cover object-center"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8 reveal-item">
              <div className="space-y-2 border-l-2 border-[#3B1A5C] pl-6">
                <h3 className="font-display text-[22px] font-medium text-[#3B1A5C]">
                  Direct Buyer-Seller Verification
                </h3>
                <p className="text-[15px] leading-[1.7] text-[#3B1A5C]/80">
                  Every merchant registered on FLOATE AI undergoes business location and identity checks before being indexed.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-[#3B1A5C] pl-6">
                <h3 className="font-display text-[22px] font-medium text-[#3B1A5C]">
                  Privacy First Data Handling
                </h3>
                <p className="text-[15px] leading-[1.7] text-[#3B1A5C]/80">
                  We never display or share merchant contact details publicly. Leads are routed securely through Telegram.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-[#3B1A5C] pl-6">
                <h3 className="font-display text-[22px] font-medium text-[#3B1A5C]">
                  Pay-As-You-Go Transparency
                </h3>
                <p className="text-[15px] leading-[1.7] text-[#3B1A5C]/80">
                  Merchants pay zero subscription or hidden fees. Credits are deducted only when a qualified buyer connects.
                </p>
              </div>
            </div>

          </div>

        </div>
      </ScrollRevealSection>

      {/* SECTION 7: WHATSAPP COMING SOON (SOLID Elegant Purple #5C2D91, Padding: 240px) */}
      <ScrollRevealSection id="whatsapp" wipeColor="#5C2D91" className="bg-[#5C2D91] text-white py-[160px] lg:py-[240px] px-6 sm:px-12 relative">
        <div className="max-w-4xl mx-auto space-y-16 text-center">
          
          <div className="space-y-6 max-w-2xl mx-auto reveal-item">
            <span className="block text-[12px] uppercase tracking-[3px] font-medium text-[#E8B923]">
              COMING SOON
            </span>

            <h2 className="font-display text-4xl sm:text-5xl font-medium leading-[1.1] text-white">
              WhatsApp is on the way.
            </h2>

            <p className="text-[17px] leading-[1.7] text-white/70">
              We are working with Meta to bring FLOATE AI to WhatsApp Business. Once verified, buyers and merchants will enjoy the same seamless experience on Africa's most popular messaging platform.
            </p>
          </div>

          <div className="max-w-md mx-auto text-left space-y-3 pt-2 reveal-item">
            {[
              "Same AI-powered lead qualification",
              "Same voice, photo, and text inventory listing",
              "Same real-time lead notifications",
              "Same pay-as-you-go credit system"
            ].map((feature, idx) => (
              <div key={idx} className="border-l-2 border-[#E8B923] pl-4 py-1 text-[15px] text-white/90 font-medium">
                {feature}
              </div>
            ))}
          </div>

          <div className="pt-6 space-y-6 reveal-item">
            <div>
              <a
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#E8B923] text-[#3B1A5C] px-8 py-4 text-[12px] uppercase tracking-[2px] font-semibold transition-all hover:bg-[#F5E6A3] shadow-lg"
              >
                Notify Me When WhatsApp Launches
              </a>
            </div>

            <div className="space-y-1 text-[14px] text-white/50">
              <p>In the meantime, continue using FLOATE AI on Telegram.</p>
              <a 
                href={TELEGRAM_BOT_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white underline hover:text-[#E8B923] transition-colors font-medium inline-block"
              >
                Continue on Telegram
              </a>
            </div>
          </div>

          {/* Editorial Dual Phone Image */}
          <div className="pt-8 reveal-item">
            <div className="overflow-hidden shadow-2xl max-w-2xl mx-auto">
              <img 
                src={whatsappImg} 
                alt="Smartphones displaying Telegram and WhatsApp interfaces side by side"
                referrerPolicy="no-referrer"
                className="w-full h-[320px] sm:h-[420px] object-cover object-center"
              />
            </div>
          </div>

        </div>
      </ScrollRevealSection>

      {/* CITY MARKET HUBS DIRECTORY SECTION */}
      <ScrollRevealSection id="geo-hubs" wipeColor="#F7F4FB" className="bg-[#F7F4FB] py-20 px-6 sm:px-12 border-t border-[#2C2C2C]/10 text-left">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#2C2C2C]/10 pb-6 reveal-item">
            <div>
              <span className="block text-[12px] uppercase tracking-[2px] font-medium text-[#5C2D91]">
                COMMERCIAL HUBS
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-medium text-[#2C2C2C] mt-1">
                Regional Market Directories
              </h3>
            </div>
            <span className="text-[11px] uppercase tracking-[1px] font-semibold text-[#3B1A5C] bg-[#E8B923]/30 px-3 py-1">
              Active Commerce Regions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SEO_HUBS_DATA.map((hub) => (
              <div 
                key={hub.slug}
                onClick={() => onSelectHub && onSelectHub(hub.slug)}
                className="bg-white border border-[#2C2C2C]/10 p-6 transition duration-200 cursor-pointer hover:border-[#5C2D91] flex flex-col justify-between space-y-4 reveal-item"
              >
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[1.5px] font-mono text-[#5C2D91] block">
                    {hub.country}
                  </span>
                  <h4 className="font-display text-[18px] font-medium text-[#2C2C2C]">
                    {hub.cityName}
                  </h4>
                  <p className="text-[12px] text-[#2C2C2C]/60 line-clamp-2 leading-relaxed font-sans">
                    {hub.metaDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[12px] uppercase tracking-[1px] font-semibold text-[#5C2D91] flex items-center justify-between">
                  <span>Explore Market</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollRevealSection>

      {/* FAQ SECTION */}
      <ScrollRevealSection id="faq" wipeColor="#FFFFFF" className="bg-white py-20 px-6 sm:px-12 border-t border-[#2C2C2C]/10 text-left">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-3 text-center reveal-item">
            <span className="block text-[12px] uppercase tracking-[3px] font-medium text-[#5C2D91]">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#2C2C2C]">
              Clear Answers
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="border-b border-[#2C2C2C]/10 pb-4 reveal-item"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full py-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-display text-[18px] font-medium text-[#2C2C2C]">{faq.question}</span>
                    <span className="text-[#5C2D91] font-mono text-xl">{isOpen ? '−' : '+'}</span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pb-4 text-[15px] text-[#2C2C2C]/70 leading-relaxed font-sans"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollRevealSection>

      {/* SECTION 8: FOOTER (SOLID Graphite #2C2C2C, Padding: 100px top, 60px bottom) */}
      <footer className="bg-[#2C2C2C] text-white pt-[100px] pb-[60px] px-6 sm:px-12 text-left">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 border-b border-white/10 pb-12">
            
            {/* Column 1: Brand (spans 2 columns on lg screens) */}
            <div className="space-y-4 lg:col-span-2 pr-0 lg:pr-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://i.postimg.cc/nzQ7WvPK/20260807-223513.jpg" 
                  alt="FLOATE AI Logo" 
                  className="h-9 w-auto object-contain rounded-md"
                  referrerPolicy="no-referrer"
                />
                <span className="font-display text-[20px] text-white uppercase tracking-[4px]">
                  FLOATE <span className="text-[#E8B923]">AI</span>
                </span>
              </div>
              <p className="text-[13px] text-white/50 max-w-[320px] leading-[1.6] font-sans">
                Conversational market operating system for Africa's informal economy. Connecting buyers directly to verified local merchants.
              </p>
              <div className="pt-2 text-[12px] text-white/40 space-y-1">
                <p className="font-semibold text-white/70">FLOATE AFRICA LTD</p>
                <p>RC: 9365804 | Registered in Nigeria</p>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <span className="block text-[12px] uppercase tracking-[2px] text-white/30 font-medium">
                PRODUCT
              </span>
              <div className="space-y-2 text-[14px] text-white/60">
                <a href="#hero" onClick={() => scrollToSection('hero')} className="block hover:text-white transition">Search</a>
                <a href="#how-it-works" onClick={() => scrollToSection('how-it-works')} className="block hover:text-white transition">How It Works</a>
                <a href="#solutions" onClick={() => scrollToSection('solutions')} className="block hover:text-white transition">Buyers & Merchants</a>
                <a href="#features" onClick={() => scrollToSection('features')} className="block hover:text-white transition">Features</a>
              </div>
            </div>

            {/* Column 3: Company & Legal */}
            <div className="space-y-3">
              <span className="block text-[12px] uppercase tracking-[2px] text-white/30 font-medium">
                COMPANY & LEGAL
              </span>
              <div className="space-y-2 text-[14px] text-white/60">
                <a 
                  href="/about" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigatePage) {
                      onNavigatePage('ABOUT');
                    } else {
                      window.history.pushState({}, '', '/about');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }} 
                  className="block hover:text-white transition text-left"
                >
                  About Us
                </a>
                <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition">Twitter / X</a>
                <a href={WHATSAPP_BOT_URL} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition">WhatsApp Support</a>
                <a href={CLAIM_BUSINESS_URL} target="_blank" rel="noopener noreferrer" className="block hover:text-[#E8B923] transition">Claim Your Business</a>
                <a 
                  href="/privacy" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigatePage) {
                      onNavigatePage('PRIVACY');
                    } else {
                      window.history.pushState({}, '', '/privacy');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }} 
                  className="block hover:text-white transition text-left"
                >
                  Privacy Policy
                </a>
                <a 
                  href="/terms" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigatePage) {
                      onNavigatePage('TERMS');
                    } else {
                      window.history.pushState({}, '', '/terms');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }} 
                  className="block hover:text-white transition text-left"
                >
                  Terms of Service
                </a>
              </div>
            </div>

            {/* Column 4: Contact & Office */}
            <div className="space-y-3">
              <span className="block text-[12px] uppercase tracking-[2px] text-white/30 font-medium">
                CONTACT & OFFICE
              </span>
              <div className="space-y-3 text-[13px] text-white/70 font-sans">
                <div>
                  <span className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold">Email</span>
                  <a href="mailto:contact@floate.xyz" className="text-white hover:text-[#E8B923] transition font-medium flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-[#E8B923] shrink-0" />
                    <span>contact@floate.xyz</span>
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold">Phone</span>
                  <a href="tel:07065599116" className="text-white hover:text-[#E8B923] transition font-medium flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-[#E8B923] shrink-0" />
                    <span>07065599116</span>
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold">Registered Address</span>
                  <p className="text-white/80 leading-relaxed text-[12px] flex items-start gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E8B923] shrink-0 mt-0.5" />
                    <span>26, Abagana street, fegge onitsha, Anambra State</span>
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-white/35">
            <p>© 2026 FLOATE AFRICA LTD. All rights reserved. | 26, Abagana street, fegge onitsha, Anambra State</p>
            <p>Built for African Commerce</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
