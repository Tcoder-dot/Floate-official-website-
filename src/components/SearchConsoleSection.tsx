import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  MessageCircle,
  X, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flame,
  Layers,
  AlertCircle
} from 'lucide-react';
import { doc, setDoc, onSnapshot, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  parseSearchQuery, 
  ParsedSearchQuery,
  getSpotlightImage
} from '../lib/searchCategoryMatcher';

export interface BusinessItem {
  id: string;
  businessName: string;
  category: string;
  product?: string;
  location: string;
  market?: string;
  city?: string;
  description: string;
  items: string[];
  priceRange: string;
  price?: string;
  verified: boolean;
  isSpotlight?: boolean;
  hasImage?: boolean;
  imageUrl?: string;
  status: string;
  fastResponder: boolean;
  rating?: number | string;
  score?: number | string;
  ratingTier?: string;
  telegramBotUrl?: string;
  whatsappDeepLink?: string;
  continueUrl?: string;
}

export function formatVendorRating(score?: number | string) {
  const num = typeof score === 'number' ? score : parseFloat(String(score)) || 4.9;
  return {
    scoreFormatted: num.toFixed(1),
    tier: num >= 4.8 ? 'Tier 1 Top Rated' : 'Verified Vendor'
  };
}

export const SearchConsoleSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('Lagos');
  const [searchBudget, setSearchBudget] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  
  const [spotlightMatches, setSpotlightMatches] = useState<BusinessItem[]>([]);
  const [regularMatches, setRegularMatches] = useState<BusinessItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);

  // Real-time counter
  const [linkedUsersCount, setLinkedUsersCount] = useState<number>(160);
  const carouselRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to real-time search & linked users stat counter in Firestore
  useEffect(() => {
    const statsDocRef = doc(db, 'stats', 'global');
    const unsubscribe = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const rawCount = typeof data.totalUsersLinked === 'number'
          ? data.totalUsersLinked
          : typeof data.totalSearches === 'number'
          ? data.totalSearches
          : typeof data.searchCount === 'number'
          ? data.searchCount
          : typeof data.count === 'number'
          ? data.count
          : null;

        if (rawCount !== null) {
          if (rawCount < 160) {
            setDoc(statsDocRef, {
              totalUsersLinked: 160,
              totalSearches: 160,
              lastUpdated: new Date().toISOString()
            }, { merge: true }).catch(() => {});
            setLinkedUsersCount(160);
          } else {
            setLinkedUsersCount(rawCount);
          }
        }
      } else {
        setDoc(statsDocRef, {
          totalUsersLinked: 160,
          totalSearches: 160,
          lastUpdated: new Date().toISOString()
        }, { merge: true }).catch(err => {
          console.warn('Could not initialize stats doc:', err);
        });
      }
    }, (error) => {
      console.warn('Firestore stats snapshot listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  const incrementLinkedUsers = async () => {
    setLinkedUsersCount(prev => prev + 1);
    try {
      const statsDocRef = doc(db, 'stats', 'global');
      await setDoc(statsDocRef, {
        totalUsersLinked: increment(1),
        totalSearches: increment(1),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to increment linked users stat in Firestore:', err);
    }
  };

  const parsedActiveQuery = useMemo<ParsedSearchQuery>(() => {
    return parseSearchQuery(activeQuery);
  }, [activeQuery]);

  // Execute API Search against live Floate API
  const executeApiSearch = async (queryText: string, loc?: string, bud?: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) {
      setActiveQuery('');
      setSpotlightMatches([]);
      setRegularMatches([]);
      setIsSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    setIsSearching(true);
    setActiveQuery(cleanQuery);
    setHasSearchedOnce(true);
    incrementLinkedUsers();

    const locationToSend = loc || searchLocation || 'Lagos';
    const budgetToSend = bud || searchBudget || undefined;

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: cleanQuery,
          location: locationToSend,
          budget: budgetToSend ? Number(budgetToSend) || budgetToSend : undefined
        }),
        signal: currentController.signal
      });

      if (abortControllerRef.current !== currentController) return;

      const resText = await res.text();
      let resData: any = {};
      try {
        resData = JSON.parse(resText);
      } catch (jsonErr) {
        console.warn('Response from /api/search was not JSON:', resText);
      }

      if (abortControllerRef.current !== currentController) return;

      if (resData.success) {
        const payload = resData.data || resData;

        // Extract Spotlight and Regular matches from live API response
        let rawSpotlights: any[] = [];
        let rawRegulars: any[] = [];

        if (Array.isArray(payload.spotlightMatches) && payload.spotlightMatches.length > 0) {
          rawSpotlights = payload.spotlightMatches;
          rawRegulars = Array.isArray(payload.regularMatches) ? payload.regularMatches : [];
        } else if (Array.isArray(payload.spotlightListings) && payload.spotlightListings.length > 0) {
          rawSpotlights = payload.spotlightListings;
          rawRegulars = Array.isArray(payload.organicListings) ? payload.organicListings : [];
        } else if (Array.isArray(payload.exactMatches) && payload.exactMatches.length > 0) {
          rawSpotlights = payload.exactMatches;
          rawRegulars = Array.isArray(payload.categoryMatches) ? payload.categoryMatches : [];
        } else if (Array.isArray(payload.results) && payload.results.length > 0) {
          rawSpotlights = payload.results.slice(0, 3);
          rawRegulars = payload.results.slice(3);
        } else if (Array.isArray(payload) && payload.length > 0) {
          rawSpotlights = payload.slice(0, 3);
          rawRegulars = payload.slice(3);
        }

        const mapItem = (item: any, idx: number, isSpotlight = false): BusinessItem => {
          const id = item.id || `floate_biz_${idx}_${Date.now()}`;
          const bizName = item.businessName || item.name || item.merchantName || 'Verified Merchant';
          const prod = item.product || item.category || item.description || cleanQuery;
          const locStr = item.location || (item.city ? `${item.market ? item.market + ', ' : ''}${item.city}` : 'Nigeria');
          const priceVal = item.price || item.priceRange || 'Contact for price';
          const isVer = item.isVerified !== false && item.verified !== false;
          
          const rawImg = item.imageUrl || item.image || item.photoUrl || (Array.isArray(item.images) && item.images[0]) || '';
          const imgUrl = rawImg && rawImg.startsWith('http') 
            ? rawImg 
            : getSpotlightImage({
                category: item.category,
                name: bizName,
                businessName: bizName,
                product: prod,
                description: item.description,
                image: rawImg
              });

          const waLink = item.whatsappDeepLink || `https://wa.me/message/YYWEZAZZIXBRF1?text=CONNECT_VENDOR_${encodeURIComponent(id)}`;

          return {
            id,
            businessName: bizName,
            category: item.category || 'Verified Supplier',
            product: prod,
            location: locStr,
            market: item.market || '',
            city: item.city || '',
            description: item.description || `Floate verified supplier offering ${prod}`,
            items: Array.isArray(item.items) ? item.items : [prod],
            priceRange: priceVal,
            price: priceVal,
            verified: isVer,
            isSpotlight: isSpotlight || item.isSpotlight === true,
            hasImage: true,
            imageUrl: imgUrl,
            status: 'active',
            fastResponder: true,
            rating: item.rating ?? item.score ?? 4.9,
            score: item.score ?? 96,
            ratingTier: item.ratingTier || 'Tier 1 Verified',
            whatsappDeepLink: waLink
          };
        };

        const mappedSpotlights = rawSpotlights.map((item, idx) => mapItem(item, idx, true));
        const mappedRegulars = rawRegulars.map((item, idx) => mapItem(item, idx + 10, false));

        setSpotlightMatches(mappedSpotlights);
        setRegularMatches(mappedRegulars);
      } else {
        setSpotlightMatches([]);
        setRegularMatches([]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('Search query error:', err);
      setSpotlightMatches([]);
      setRegularMatches([]);
    } finally {
      if (abortControllerRef.current === currentController) {
        setIsSearching(false);
      }
    }
  };

  // 300ms Debounce Handler for User Keystrokes
  const handleInputChange = (val: string) => {
    setSearchTerm(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setActiveQuery('');
      setSpotlightMatches([]);
      setRegularMatches([]);
      setIsSearching(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      executeApiSearch(val);
    }, 300);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (!searchTerm.trim()) return;
    executeApiSearch(searchTerm);
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setSearchTerm('');
    setActiveQuery('');
    setSpotlightMatches([]);
    setRegularMatches([]);
    setIsSearching(false);
    setHasSearchedOnce(false);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const totalResultsCount = spotlightMatches.length + regularMatches.length;
  const moreBusinessesWhatsAppDeepLink = `https://wa.me/message/YYWEZAZZIXBRF1?text=SEARCH_${encodeURIComponent(activeQuery || searchTerm || "all")}`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* SEARCH CONSOLE INPUT */}
      <div className="w-full max-w-[680px] mx-auto space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div 
            className="relative flex items-center bg-white rounded-full border-2 border-slate-200/90 focus-within:border-[#5C2D91] focus-within:ring-4 focus-within:ring-[#5C2D91]/20 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.3)] hover:border-[#5C2D91]/60 transition-all duration-300 h-14 sm:h-16"
          >
            {/* Search Icon */}
            <div className="pl-5 sm:pl-6 text-[#5C2D91] shrink-0">
              <Search className="w-5 h-5" />
            </div>

            {/* Main Input Field */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search phones, gadgets, fashion, jerseys, laptops..."
              className="w-full bg-transparent pl-3 sm:pl-4 pr-32 sm:pr-36 text-sm sm:text-base text-[#2C2C2C] placeholder-slate-400 focus:outline-none font-medium"
            />

            {/* Clear & Search Submit Buttons */}
            <div className="absolute right-2 sm:right-2.5 flex items-center gap-1.5 sm:gap-2">
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={!searchTerm.trim() || isSearching}
                className="h-[40px] sm:h-[46px] px-4 sm:px-6 bg-gradient-to-r from-[#5C2D91] to-[#3B1A5C] hover:from-[#3B1A5C] hover:to-[#2C2C2C] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-[#5C2D91]/20"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* REAL-TIME SOCIAL PROOF BADGE */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-white bg-[#5C2D91]/40 backdrop-blur-md px-4 py-1.5 sm:py-2 rounded-full border border-white/20 w-fit mx-auto shadow-md transition-all duration-300">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]" />
          </span>
          <span className="font-extrabold text-[#E8B923] text-sm sm:text-base font-mono tracking-wide">{linkedUsersCount.toLocaleString()}</span>
          <span className="text-white/95 font-semibold">users linked to verified local merchants</span>
        </div>

        {/* QUICK SEARCH PROMPT PILLS (Direct queries to real registered merchant categories) */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 pt-1 text-xs">
          <span className="text-white/70 font-medium mr-1 text-[11px] sm:text-xs">Try:</span>
          {[
            "Phones & Gadgets",
            "Jerseys in Lagos",
            "Laptops & Tech",
            "Bags & Footwear",
            "Ikeja Computer Village"
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setSearchTerm(prompt);
                executeApiSearch(prompt);
              }}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-medium transition backdrop-blur-xs hover:border-[#E8B923]"
            >
              {prompt}
            </button>
          ))}
        </div>

      </div>

      {/* SEARCH RESULTS SECTION (Only rendered when user performs a search) */}
      <AnimatePresence>
        {(isSearching || activeQuery) && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full space-y-6 pt-2"
          >
            
            {/* ACTIVE SEARCH STATUS BAR */}
            {activeQuery && (
              <div className="bg-white/95 backdrop-blur-md border border-[#5C2D91]/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#2C2C2C] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#5C2D91]" />
                      <span>Floate Verified Results</span>
                    </h3>
                    <span className="bg-[#5C2D91] text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                      {isSearching ? 'Querying API...' : `${totalResultsCount} Registered ${totalResultsCount === 1 ? 'Merchant' : 'Merchants'}`}
                    </span>
                    {parsedActiveQuery.inferredCategoryNames.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-[#E8B923]/20 text-[#5C2D91] border border-[#E8B923]/60 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <span>{parsedActiveQuery.inferredCategoryNames[0]}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Showing results for <span className="text-[#5C2D91] font-bold">"{activeQuery}"</span>
                  </p>
                </div>

                <button
                  onClick={handleClearSearch}
                  className="text-xs text-[#5C2D91] hover:text-[#3B1A5C] font-bold flex items-center gap-1 self-start sm:self-center shrink-0 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            )}

            {/* SEARCH LOADING STATE */}
            {isSearching && (
              <div className="bg-white border border-[#5C2D91]/20 rounded-2xl p-8 text-center space-y-3 max-w-md mx-auto shadow-md">
                <div className="w-8 h-8 rounded-full border-3 border-[#5C2D91]/20 border-t-[#5C2D91] animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-[#2C2C2C]">
                    Querying Floate Search API...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Finding verified registered merchants for <strong className="text-[#5C2D91]">"{activeQuery}"</strong>
                  </p>
                </div>
              </div>
            )}

            {/* 1. SPOTLIGHT BUSINESSES (Clean, proportional carousel) */}
            {spotlightMatches.length > 0 && !isSearching && (
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E8B923] text-[#3B1A5C] shadow-xs">
                      <Flame className="w-3 h-3 fill-[#3B1A5C]" />
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      Spotlight Verified Businesses
                    </h3>
                    <span className="bg-[#E8B923]/20 border border-[#E8B923] text-[#E8B923] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Priority Placement
                    </span>
                  </div>

                  {/* Scroll controls */}
                  {spotlightMatches.length > 2 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => scrollCarousel('left')}
                        className="w-7 h-7 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center hover:bg-[#5C2D91] transition shadow-xs"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCarousel('right')}
                        className="w-7 h-7 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center hover:bg-[#5C2D91] transition shadow-xs"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Horizontal-scrolling Carousel */}
                <div 
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-300"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {spotlightMatches.map((biz) => {
                    const coverImage = biz.imageUrl || getSpotlightImage(biz);
                    const waLink = biz.whatsappDeepLink || `https://wa.me/message/YYWEZAZZIXBRF1?text=CONNECT_VENDOR_${encodeURIComponent(biz.id)}`;

                    return (
                      <div
                        key={biz.id}
                        className="w-[260px] sm:w-[280px] bg-white rounded-xl border border-[#E8B923]/60 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group snap-start shrink-0 relative"
                      >
                        {/* Compact Image Cover */}
                        <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                          <img
                            src={coverImage}
                            alt={biz.businessName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                          {/* Spotlight Badge */}
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span className="bg-[#E8B923] text-[#3B1A5C] text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 fill-[#3B1A5C]" />
                              <span>Spotlight</span>
                            </span>
                          </div>

                          <div className="absolute top-2 right-2">
                            <span className="bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5 backdrop-blur-xs">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          </div>

                          {/* Category & Price Tag */}
                          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 truncate max-w-[140px]">
                              {biz.category}
                            </span>
                            <span className="text-[11px] font-black bg-[#5C2D91]/90 px-1.5 py-0.5 rounded text-[#E8B923] backdrop-blur-xs">
                              {biz.price || biz.priceRange}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-extrabold text-[#2C2C2C] group-hover:text-[#5C2D91] transition-colors line-clamp-1 leading-snug">
                              {biz.businessName}
                            </h4>

                            <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium">
                              <MapPin className="w-3 h-3 text-[#5C2D91] shrink-0" />
                              <span className="truncate">{biz.location}</span>
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-1.5 rounded border border-slate-100">
                              {biz.product || biz.description}
                            </p>
                          </div>

                          {/* WhatsApp Deep-Link Connect Button */}
                          <div className="pt-1">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => incrementLinkedUsers()}
                              className="w-full py-2 px-3 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs hover:shadow transform active:scale-[0.98]"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white" />
                              <span>Connect on WhatsApp</span>
                            </a>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. REGULAR MATCHES (Responsive grid below carousel) */}
            {regularMatches.length > 0 && !isSearching && (
              <div className="space-y-3 text-left pt-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#E8B923]" />
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    Verified Local Merchants
                  </h3>
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {regularMatches.length} Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {regularMatches.map((biz) => {
                    const coverImage = biz.imageUrl || getSpotlightImage(biz);
                    const waLink = biz.whatsappDeepLink || `https://wa.me/message/YYWEZAZZIXBRF1?text=CONNECT_VENDOR_${encodeURIComponent(biz.id)}`;

                    return (
                      <div
                        key={biz.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-[#5C2D91] shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-3 group text-left relative overflow-hidden"
                      >
                        <div className="space-y-2.5">
                          {/* Merchant Header */}
                          <div className="flex items-start gap-2.5">
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 border border-[#5C2D91]/20 shrink-0 flex items-center justify-center">
                              <img
                                src={coverImage}
                                alt={biz.businessName}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80";
                               }}
                              />
                            </div>

                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-start justify-between gap-1 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-extrabold text-[#2C2C2C] group-hover:text-[#5C2D91] transition-colors leading-tight truncate">
                                  {biz.businessName}
                                </h4>
                              </div>

                              <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium">
                                <MapPin className="w-3 h-3 text-[#5C2D91] shrink-0" />
                                <span className="truncate">{biz.location}</span>
                              </div>
                            </div>
                          </div>

                          {/* Product Detail */}
                          <p className="text-[11px] font-medium text-slate-700 line-clamp-2 leading-snug bg-slate-50 p-1.5 rounded border border-slate-100">
                            {biz.product || biz.description}
                          </p>

                          {/* Price Tag */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-400 font-medium">Price:</span>
                            <span className="text-[11px] font-extrabold text-[#5C2D91] bg-[#F7F4FB] px-2 py-0.5 rounded">
                              {biz.price || biz.priceRange}
                            </span>
                          </div>
                        </div>

                        {/* Action Button: WhatsApp */}
                        <div className="pt-1 border-t border-slate-100">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => incrementLinkedUsers()}
                            className="w-full py-1.5 px-3 bg-gradient-to-r from-[#5C2D91] to-[#3B1A5C] hover:from-[#3B1A5C] hover:to-[#2C2C2C] text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs transform active:scale-[0.99]"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>Connect Vendor</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. EXPLORE MORE BUSINESSES CTA */}
            {activeQuery && totalResultsCount > 0 && !isSearching && (
              <div className="pt-2 pb-1 flex flex-col items-center justify-center gap-1 text-center">
                <a
                  href={moreBusinessesWhatsAppDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => incrementLinkedUsers()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition shadow-md hover:scale-[1.02] active:scale-[0.99] border border-white/20"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Search More Across WhatsApp</span>
                </a>
              </div>
            )}

            {/* 4. EMPTY STATES: When no matching vendor is found */}
            {activeQuery && totalResultsCount === 0 && !isSearching && hasSearchedOnce && (
              <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto shadow-xl">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                  <AlertCircle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-[#2C2C2C]">
                    No Exact Match for "{activeQuery}"
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Our WhatsApp concierge can scan unlisted market inventories across Lagos, Aba, Onitsha, and Abuja directly for you.
                  </p>
                </div>

                <div className="pt-1">
                  <a
                    href={moreBusinessesWhatsAppDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => incrementLinkedUsers()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-xs uppercase tracking-wider rounded-full transition shadow-md hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Search Nationwide on WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
