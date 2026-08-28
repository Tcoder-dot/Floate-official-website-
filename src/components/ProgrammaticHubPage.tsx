import React, { useState, useEffect, useMemo } from 'react';
import { SEOHubPage, SEO_HUBS_DATA } from '../data/seoHubs';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  MapPin, 
  Search, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Mic, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  ShoppingBag,
  Zap,
  Globe,
  Building2,
  Users,
  Star,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { formatVendorRating } from './SearchConsoleSection';
import { parseSearchQuery, isBusinessMatchingQuery } from '../lib/searchCategoryMatcher';

interface Props {
  hub: SEOHubPage;
  onNavigateHome: () => void;
  onSelectHub: (slug: string) => void;
}

export default function ProgrammaticHubPage({ hub, onNavigateHome, onSelectHub }: Props) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeMarketFilter, setActiveMarketFilter] = useState<string>('ALL');
  const [simulatedQuery, setSimulatedQuery] = useState<string>('');
  const [liveMerchants, setLiveMerchants] = useState<Array<{
    id?: string;
    name: string;
    market: string;
    category: string;
    items: string[];
    verificationBadge: string;
    hasImage?: boolean;
    imageUrl?: string;
    rating?: number | string;
    score?: number | string;
    address?: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      addressCountry: string;
    };
    botActionUrl?: string;
  }>>([]);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState<boolean>(true);

  const TELEGRAM_BOT_URL = 'https://t.me/Floatebusinessbot';

  // Fetch live verified sellers from main server API & Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadLiveMerchants() {
      setIsLoadingMerchants(true);
      const results: Array<{
        id?: string;
        name: string;
        market: string;
        category: string;
        items: string[];
        verificationBadge: string;
        hasImage?: boolean;
        imageUrl?: string;
        rating?: number | string;
        score?: number | string;
        address?: {
          streetAddress: string;
          addressLocality: string;
          addressRegion: string;
          addressCountry: string;
        };
        botActionUrl?: string;
      }> = [];

      // 1. Fetch active businesses from Firestore
      try {
        const q = query(
          collection(db, 'businesses'),
          where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const cityMatch = !hub.cityName || 
            (data.city && data.city.toLowerCase().includes(hub.cityName.toLowerCase())) ||
            (data.location && data.location.toLowerCase().includes(hub.cityName.toLowerCase())) ||
            (data.market && data.market.toLowerCase().includes(hub.cityName.toLowerCase()));
            
          if (cityMatch) {
            const img = data.imageUrl || data.image || data.photoUrl || data.verificationImage || data.businessImage || (Array.isArray(data.images) && data.images[0]) || '';
            const hasImg = Boolean(img && typeof img === 'string' && img.trim().length > 0);

            results.push({
              id: docSnap.id,
              name: data.businessName || 'Verified Merchant',
              market: data.market || data.location || hub.cityName,
              category: data.category || 'General Merchant',
              items: Array.isArray(data.items) ? data.items : (data.product ? [data.product] : []),
              verificationBadge: hasImg ? 'FLOATE Verified' : 'Partially Verified',
              hasImage: hasImg,
              imageUrl: hasImg ? img : undefined,
              rating: data.rating || data.score || data.vendorScore || 4.9,
              score: data.score || data.vendorScore || data.trust_score,
              address: data.streetAddress ? {
                streetAddress: data.streetAddress,
                addressLocality: data.city || hub.cityName,
                addressRegion: data.state || 'NG',
                addressCountry: 'NG'
              } : undefined,
              botActionUrl: data.telegramBotUrl || TELEGRAM_BOT_URL
            });
          }
        });
      } catch (err) {
        console.warn('Firestore fetch in hub page handled:', err);
      }

      // 2. Fetch from live API search endpoint
      try {
        const searchQuery = simulatedQuery.trim() || hub.cityName;
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: searchQuery,
            location: hub.cityName
          })
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data) {
            const apiMatches = (resData.data.exactMatches && resData.data.exactMatches.length > 0)
              ? resData.data.exactMatches
              : (resData.data.results || []);

            if (Array.isArray(apiMatches)) {
              apiMatches.forEach((item: any) => {
                const bizName = item.businessName || item.name || item.merchantName || 'Verified Merchant';
                if (!results.some(r => r.name.toLowerCase() === bizName.toLowerCase())) {
                  const ratingVal = item.rating ?? item.score ?? item.vendorScore ?? item.ratingScore ?? item.trust_score ?? item.score_percentage ?? item.vendor_score ?? 4.9;
                  const scoreVal = item.score ?? item.vendorScore ?? item.trust_score ?? item.ratingScore ?? item.score_percentage ?? item.rating;

                  const img = item.imageUrl || item.image || item.photoUrl || item.photo || item.verificationImage || item.logo || item.logoUrl || item.businessImage || (Array.isArray(item.images) && item.images[0]) || (Array.isArray(item.photos) && item.photos[0]) || '';
                  const hasImg = Boolean(img && typeof img === 'string' && img.trim().length > 0);

                  results.push({
                    name: bizName,
                    market: item.market || item.location || hub.cityName,
                    category: item.category || 'Verified Business',
                    items: Array.isArray(item.items) ? item.items : (item.product ? [item.product] : [searchQuery]),
                    verificationBadge: hasImg ? 'FLOATE Verified' : 'Partially Verified',
                    hasImage: hasImg,
                    imageUrl: hasImg ? img : undefined,
                    rating: ratingVal,
                    score: scoreVal,
                    botActionUrl: item.telegramDeepLink || item.telegramBotUrl || TELEGRAM_BOT_URL
                  });
                }
              });
            }
          }
        }
      } catch (apiErr) {
        console.warn('Live API query in programmatic page handled:', apiErr);
      }

      if (isMounted) {
        setLiveMerchants(results);
        setIsLoadingMerchants(false);
      }
    }

    loadLiveMerchants();
    return () => { isMounted = false; };
  }, [hub.cityName, simulatedQuery]);

  // Inject dynamic page title and JSON-LD structured data for SEO/GEO
  useEffect(() => {
    document.title = hub.title;
    
    // Build LocalBusiness schema list for live merchants
    const localBusinessList = liveMerchants.map((merchant, idx) => ({
      "@type": "LocalBusiness",
      "@id": `https://floate.xyz/solutions/${hub.slug}#merchant-${idx + 1}`,
      "name": merchant.name,
      "description": `${merchant.name} in ${merchant.market}, ${hub.cityName}. Specializing in ${merchant.items.join(', ')}.`,
      "category": merchant.category,
      "address": merchant.address ? {
        "@type": "PostalAddress",
        "streetAddress": merchant.address.streetAddress,
        "addressLocality": merchant.address.addressLocality,
        "addressRegion": merchant.address.addressRegion,
        "addressCountry": merchant.address.addressCountry
      } : {
        "@type": "PostalAddress",
        "streetAddress": merchant.market,
        "addressLocality": hub.cityName,
        "addressCountry": "NG"
      },
      "url": `https://floate.xyz/solutions/${hub.slug}`,
      "potentialAction": {
        "@type": "BuyAction",
        "name": `Connect with ${merchant.name} via FLOATE AI Telegram`,
        "target": merchant.botActionUrl || TELEGRAM_BOT_URL
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "128"
      }
    }));

    // Inject JSON-LD Schema
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "ItemPage",
      "name": hub.title,
      "description": hub.metaDescription,
      "url": `https://floate.xyz/solutions/${hub.slug}`,
      "about": {
        "@type": "Thing",
        "name": `${hub.cityName} Market Commerce`,
        "description": hub.subheading
      },
      "provider": {
        "@type": "Organization",
        "name": "FLOATE AI",
        "url": "https://floate.xyz",
        "logo": "https://i.postimg.cc/nzQ7WvPK/20260807-223513.jpg"
      },
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": hub.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      },
      "itemListElement": localBusinessList
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'json-ld-hub-schema';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('json-ld-hub-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [hub, liveMerchants]);

  const parsedHubQuery = useMemo(() => {
    return parseSearchQuery(simulatedQuery);
  }, [simulatedQuery]);

  const filteredMerchants = useMemo(() => {
    let list = liveMerchants;

    // Apply market pill filter if not ALL
    if (activeMarketFilter !== 'ALL') {
      list = list.filter(m => 
        m.market.toLowerCase().includes(activeMarketFilter.toLowerCase()) || 
        m.category.toLowerCase().includes(activeMarketFilter.toLowerCase())
      );
    }

    // Apply simulated search query if present
    if (simulatedQuery.trim()) {
      list = list.filter(m => 
        isBusinessMatchingQuery({
          businessName: m.name,
          category: m.category,
          items: m.items,
          location: m.market,
          city: hub.cityName
        }, parsedHubQuery)
      );
    }

    return list;
  }, [liveMerchants, activeMarketFilter, simulatedQuery, parsedHubQuery, hub.cityName]);

  return (
    <div className="min-h-screen bg-[#FFE083] text-slate-900 font-sans selection:bg-[#681A9E]/20 selection:text-[#681A9E]">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-[#FFE083]/90 backdrop-blur-md border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onNavigateHome}
              className="p-2 text-slate-800 hover:text-black hover:bg-black/5 rounded-xl transition flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Overview</span>
            </button>
            <div className="h-5 w-px bg-black/10 hidden sm:block" />
            <div 
              onClick={onNavigateHome}
              className="flex items-center space-x-2.5 cursor-pointer select-none"
            >
              <img 
                src="https://i.postimg.cc/nzQ7WvPK/20260807-223513.jpg" 
                alt="FLOATE AI" 
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-black text-lg tracking-tight font-display text-slate-950">
                FLOATE <span className="text-[#681A9E]">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a 
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#681A9E] hover:bg-[#52137e] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Try on Telegram</span>
            </a>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="bg-[#FFE083]/50 border-b border-black/10 py-2.5 px-4 text-xs font-medium text-slate-700">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button onClick={onNavigateHome} className="hover:text-black transition">Home</button>
          <span>/</span>
          <span className="text-slate-800">Market Solutions</span>
          <span>/</span>
          <span className="text-[#681A9E] font-black">{hub.cityName} ({hub.country})</span>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFE083] via-[#FFE083] to-[#FFE083]/30 border-b border-black/10 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#681A9E]/20 border border-[#681A9E]/40 text-[#681A9E] px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#681A9E]" />
            <span>{hub.heroBadge}</span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12] font-display">
            {hub.h1Heading}
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
            {hub.subheading}
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#681A9E] hover:bg-[#52137e] text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow-xl transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Search {hub.cityName} Vendors on Telegram</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </a>

            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#FFE083]/50 border border-black/10 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl select-none cursor-not-allowed shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>WhatsApp Integration (Coming Soon)</span>
            </div>
          </div>

          {/* Market Insights Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="bg-[#FFE083] p-4 rounded-2xl border border-black/10 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold mb-1">
                <Users className="w-4 h-4 text-[#681A9E]" />
                <span>Active Merchants</span>
              </div>
              <div className="text-xl font-black text-slate-950 font-display">{hub.marketInsights.activeSellersCount}</div>
            </div>

            <div className="bg-[#FFE083] p-4 rounded-2xl border border-black/10 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold mb-1">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Avg Match Time</span>
              </div>
              <div className="text-xl font-black text-slate-950 font-display">{hub.marketInsights.avgResponseTime}</div>
            </div>

            <div className="bg-[#FFE083] p-4 rounded-2xl border border-black/10 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verification Rate</span>
              </div>
              <div className="text-xl font-black text-slate-950 font-display">{hub.marketInsights.verifiedRate}</div>
            </div>

            <div className="bg-[#FFE083] p-4 rounded-2xl border border-black/10 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold mb-1">
                <Mic className="w-4 h-4 text-[#681A9E]" />
                <span>Voice Notes</span>
              </div>
              <div className="text-xl font-black text-slate-950 font-display">Supported</div>
            </div>
          </div>

          {/* Public User-Generated Content (UGC) & Transactional Signals Frame */}
          {hub.marketInsights.weeklyBuyerConnections && (
            <div className="mt-6 max-w-4xl mx-auto bg-[#681A9E]/20 border border-[#681A9E]/40 p-4 rounded-2xl flex items-center gap-3 text-left">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                <span className="text-[#681A9E] font-mono font-black uppercase tracking-wide mr-1.5">[Live Network Activity]:</span>
                {hub.marketInsights.weeklyBuyerConnections}
              </p>
            </div>
          )}

        </div>
      </section>

      {/* 3. INDEXED MARKETS & CATEGORIES */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <span className="text-xs font-mono font-black uppercase tracking-widest text-[#681A9E] bg-[#681A9E]/20 px-3 py-1 rounded-md">
              Commercial Hubs Covered
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display tracking-tight mt-2">
              Key Markets in {hub.cityName}
            </h2>
          </div>
          <p className="text-sm text-slate-700 max-w-md font-medium">
            FLOATE AI maps informal physical shops and stalls across major markets into structured AI searchable entries.
          </p>
        </div>

        {/* Markets Tags */}
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => setActiveMarketFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
              activeMarketFilter === 'ALL'
                ? 'bg-slate-950 text-white shadow-md'
                : 'bg-[#FFE083] border border-black/15 text-slate-800 hover:bg-[#FFE083]/80'
            }`}
          >
            All Markets ({hub.marketNames.length})
          </button>
          {hub.marketNames.map((m, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveMarketFilter(m)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 ${
                activeMarketFilter === m
                  ? 'bg-[#681A9E] text-white shadow-md'
                  : 'bg-[#FFE083] border border-black/15 text-slate-800 hover:bg-[#FFE083]/80'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{m}</span>
            </button>
          ))}
        </div>

        {/* Top Product Categories Grid */}
        <div className="bg-[#FFE083] rounded-3xl border border-black/15 p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#681A9E]" />
            <span>Top Searched Categories in {hub.cityName}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {hub.topCategories.map((cat, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-[#FFE083]/50 border border-black/10 text-slate-900 text-xs font-extrabold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#681A9E]"></span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 4. VOICE SEARCH SIMULATOR & SAMPLE PROFILES */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-950/80 border border-amber-800/80 px-3 py-1 rounded-md">
                Voice Note & Text AI Matcher
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-white font-display tracking-tight mt-2">
                Simulate a Search in {hub.cityName}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Try typing or clicking a popular query below
            </span>
          </div>

          {/* Sample Voice Queries */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Popular Local Queries:
            </label>
            <div className="flex flex-wrap gap-2">
              {hub.marketInsights.popularVoiceQueries.map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSimulatedQuery(q)}
                  className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-xl font-medium transition text-left flex items-center gap-2"
                >
                  <Mic className="w-3.5 h-3.5 text-[#FFE083] shrink-0" />
                  <span>"{q}"</span>
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
              <input 
                type="text"
                value={simulatedQuery}
                onChange={(e) => setSimulatedQuery(e.target.value)}
                placeholder={`Search products in ${hub.cityName} (e.g. "Getzner brocade Wuse market")...`}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#681A9E] font-medium placeholder-slate-500"
              />
            </div>
            <a 
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#681A9E] hover:bg-[#52137e] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Ask FLOATE AI Live</span>
            </a>
          </div>
        </div>

        {/* Live Verified Merchants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-950 font-display">
              Verified Sellers in {hub.cityName}
            </h3>
            <span className="text-xs text-slate-700 font-bold">
              {isLoadingMerchants ? 'Checking live database...' : `Showing ${filteredMerchants.length} verified results`}
            </span>
          </div>

          {isLoadingMerchants ? (
            <div className="py-12 bg-[#FFE083] rounded-2xl border border-black/15 text-center text-slate-800 font-bold text-sm animate-pulse">
              Searching live FLOATE AI database for verified sellers in {hub.cityName}...
            </div>
          ) : filteredMerchants.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMerchants.slice(0, 10).map((merchant, i) => (
                  <div key={i} className="bg-[#FFE083] rounded-2xl border border-black/15 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between group">
                    <div className="space-y-3">
                      {/* Merchant Header: Profile Picture Avatar + Name & Info */}
                      <div className="flex items-start gap-3.5">
                        {/* Circular Profile Picture / Placeholder */}
                        <div className="relative shrink-0">
                          {merchant.imageUrl ? (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-black/10 border-2 border-black/20 shadow-xs flex items-center justify-center">
                              <img 
                                src={merchant.imageUrl} 
                                alt={merchant.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-slate-300 shadow-xs">
                              <ImageIcon className="w-6 h-6 text-slate-300" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-slate-950 text-base font-display leading-tight">{merchant.name}</h4>
                            {merchant.hasImage || merchant.imageUrl ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-700 px-2.5 py-1 rounded-full shrink-0">
                                <ShieldCheck className="w-3 h-3 text-purple-300" />
                                <span>{merchant.verificationBadge}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/90 text-amber-200 border border-amber-600/70 px-2.5 py-1 rounded-full shrink-0">
                                <AlertCircle className="w-3 h-3 text-amber-300" />
                                <span>Partially Verified</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-bold text-[#681A9E] flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-[#681A9E] shrink-0" />
                            <span className="truncate">{merchant.market}</span>
                          </p>
                          {merchant.address && (
                            <p className="text-[11px] text-slate-700 font-mono mt-1 flex items-start gap-1">
                              <span className="font-bold text-slate-900">Addr:</span>
                              <span className="truncate">{merchant.address.streetAddress}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold uppercase text-slate-700 tracking-wider block">
                          Category: {merchant.category}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {merchant.items.map((item, idx) => (
                            <span key={idx} className="bg-[#FFE083]/50 border border-black/10 text-slate-900 text-xs px-2.5 py-1 rounded-lg font-bold">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-black/10">
                      <a 
                        href={merchant.botActionUrl || TELEGRAM_BOT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#FFE083]" />
                        <span>Connect via FLOATE AI</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* MORE BUSINESSES BUTTON */}
              <div className="pt-4 pb-2 flex flex-col items-center justify-center gap-2 text-center">
                <a
                  href={TELEGRAM_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 hover:bg-black text-[#FFE083] font-black text-sm uppercase tracking-wider rounded-2xl transition shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.99] border border-black/20"
                >
                  <span>MORE BUSINESSES</span>
                </a>
                <p className="text-xs text-slate-800 font-bold">
                  Browse the complete list of registered businesses on Telegram
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFE083] rounded-2xl border border-black/15 p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-purple-950 text-purple-300 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="font-extrabold text-slate-950 text-lg font-display">No Verified Merchants in {hub.cityName} Yet</h4>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  Be the first merchant in {hub.cityName} to list your business on FLOATE AI and receive direct buyer requests from Telegram & WhatsApp.
                </p>
              </div>
              <a 
                href="https://t.me/Floatebusinessbot?start=register_business"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#681A9E] hover:bg-[#52137e] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
              >
                <Send className="w-4 h-4 text-[#FFE083]" />
                <span>Register Your Business in {hub.cityName}</span>
              </a>
            </div>
          )}
        </div>

      </section>

      {/* 5. KEYWORDS & SEO / GEO METADATA CLOUD */}
      <section className="py-12 bg-[#FFE083] border-y border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700">
              Popular Local Searches
            </span>
            <h3 className="text-xl font-black text-slate-950 font-display">
              {hub.cityName} Market Directory Tags
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {hub.keywords.map((kw, i) => (
              <span key={i} className="bg-[#FFE083]/50 border border-black/10 text-slate-900 text-xs px-3.5 py-1.5 rounded-xl font-mono font-bold">
                #{kw}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-black uppercase tracking-widest text-[#681A9E] bg-[#681A9E]/20 px-3.5 py-1 rounded-full">
            Local Commerce FAQs
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display tracking-tight">
            Frequently Asked Questions — {hub.cityName}
          </h2>
        </div>

        <div className="space-y-3">
          {hub.faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="bg-[#FFE083] border border-black/15 rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left font-bold text-slate-950 text-base flex items-center justify-between gap-4 hover:bg-[#FFE083]/80 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-5 h-5 text-[#681A9E] shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-800 leading-relaxed border-t border-black/10 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. CROSS-CITY HUB EXPLORER */}
      <section className="py-12 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFE083]">
                Pan-African Market Network
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-1">
                Explore Other Commercial Hubs
              </h3>
            </div>
            <button 
              onClick={onNavigateHome}
              className="text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider underline underline-offset-4"
            >
              View All Platform Features →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SEO_HUBS_DATA.map((h) => (
              <button 
                key={h.slug}
                onClick={() => onSelectHub(h.slug)}
                className={`p-4 rounded-2xl text-left border transition space-y-1.5 ${
                  h.slug === hub.slug
                    ? 'bg-[#681A9E] border-[#681A9E] text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase">
                  <span>{h.cityName}</span>
                  <Globe className="w-3.5 h-3.5 opacity-70" />
                </div>
                <div className="text-xs font-bold truncate opacity-90">{h.country}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-500 text-xs py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto space-y-2">
          <p>© {new Date().getFullYear()} FLOATE AI. Powered by FLOATE AFRICA LTD (RC: 9365804).</p>
          <p className="text-slate-600">Africa's Market Operating System for the Informal Economy.</p>
        </div>
      </footer>

    </div>
  );
}
