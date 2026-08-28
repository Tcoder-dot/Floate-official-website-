import React, { useEffect } from 'react';
import { ArrowLeft, MessageCircle, Send, CheckCircle2, ShieldCheck, Sparkles, Globe, Users, TrendingUp } from 'lucide-react';

interface BlogArticlePageProps {
  onNavigateHome: () => void;
}

export default function BlogArticlePage({ onNavigateHome }: BlogArticlePageProps) {
  const TELEGRAM_BOT_URL = 'https://t.me/Floatebusinessbot';

  useEffect(() => {
    document.title = "How to Get Buying Customers for Your WhatsApp Business in Africa | FLOATE AI Guide";

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Get Buying Customers for Your WhatsApp Business in Africa",
      "description": "Step-by-step merchant growth guide for WhatsApp and Telegram vendors in Lagos, Abuja, Onitsha, and Kano using FLOATE AI automated discovery.",
      "image": "https://i.postimg.cc/nzQ7WvPK/20260807-223513.jpg",
      "author": {
        "@type": "Organization",
        "name": "FLOATE AFRICA LTD",
        "url": "https://floate.xyz"
      },
      "publisher": {
        "@type": "Organization",
        "name": "FLOATE AI",
        "logo": {
          "@type": "ImageObject",
          "url": "https://i.postimg.cc/nzQ7WvPK/20260807-223513.jpg"
        }
      },
      "datePublished": "2026-08-01",
      "dateModified": "2026-08-08"
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'json-ld-article-schema';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('json-ld-article-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#681A9E]/20 selection:text-[#681A9E]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onNavigateHome}
            className="p-2 text-slate-600 hover:text-black hover:bg-slate-100 rounded-xl transition flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to FLOATE AI</span>
          </button>

          <a 
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#681A9E] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#52137e] transition flex items-center gap-2"
          >
            <MessageCircle className="w-3.5 h-3.5 text-white" />
            <span>Join Bot as Merchant</span>
          </a>
        </div>
      </header>

      {/* ARTICLE CONTENT */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-left">
        {/* Article Meta Header */}
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#681A9E] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Merchant Growth & Organic GEO Guide
            </span>
            <span className="text-xs text-slate-400 font-mono">• 6 Min Read</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 font-display tracking-tight leading-tight">
            How to Get Buying Customers for Your WhatsApp Business in Africa
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            If you run a WhatsApp business, student hustle, or market stall in Computer Village, Wuse Market, or Ariaria Market, your biggest bottleneck isn't inventory—it's getting verified buyers without spending millions on Instagram ads. Here is how FLOATE AI indexes your store automatically.
          </p>

          <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-800">Published by FLOATE AFRICA LTD</span>
            <span>•</span>
            <span>Updated August 2026</span>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 font-display tracking-tight">
            1. Why Traditional Social Ads Fail Small Vendors in Africa
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
            Meta and TikTok ads require credit card payments in foreign currencies and target broad, unverified audiences. A student selling sneakers in Yaba or an electronics vendor in Banex Plaza needs hyper-local buyers who are ready to pay immediately—not random likes or window shoppers.
          </p>
          <div className="bg-purple-50 border-l-4 border-[#681A9E] p-4 rounded-r-2xl space-y-2 text-sm text-slate-800 font-medium">
            <p>
              <strong>The Local Market Reality:</strong> Over 84% of Nigerian commercial intent happens inside WhatsApp status updates and Telegram groups.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 font-display tracking-tight">
            2. How FLOATE AI Indexes Your WhatsApp Inventory Free
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
            FLOATE AI acts as an autonomous market operating system. When a buyer asks the AI agent in natural conversational slang (e.g. <em>"where i fit get original UK used laptop inside Banex"</em> or <em>"vendor inside computer village with original iPhone 15"</em>), FLOATE searches local indexed merchant profiles and routes the buyer directly to your WhatsApp or Telegram handle.
          </p>

          <h3 className="text-lg font-bold text-slate-900 font-display pt-2">
            Key Merchant Setup Steps:
          </h3>
          <ul className="space-y-3 text-sm sm:text-base text-slate-700 pl-2">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#681A9E] shrink-0 mt-0.5" />
              <span><strong>Step 1: Connect your Telegram or WhatsApp:</strong> Launch <code>@Floatebusinessbot</code> on Telegram and register your shop name and market section (e.g., Shop B42, Banex Plaza, Wuse II).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#681A9E] shrink-0 mt-0.5" />
              <span><strong>Step 2: Upload product listings or voice notes:</strong> Describe your items in simple text or voice note (e.g., "I sell Getzner brocade and Swiss lace wholesale").</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#681A9E] shrink-0 mt-0.5" />
              <span><strong>Step 3: Receive instant buyer connections:</strong> When buyers in your city search for your exact products, FLOATE matches them directly to your contact.</span>
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 font-display tracking-tight">
            3. Optimizing for Conversational AI Search Slang
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
            Buyers rarely search using formal catalog keywords. AI models like ChatGPT, Gemini, and Perplexity are trained on natural human language. Make sure your business description includes local phrasing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-[#681A9E] font-mono uppercase">Nigeria Search Term</span>
              <p className="text-xs text-slate-800 font-semibold">"where i fit get original UK used iPhone inside Ikeja"</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-[#681A9E] font-mono uppercase">Abuja Search Term</span>
              <p className="text-xs text-slate-800 font-semibold">"wholesale getzner brocade seller in wuse market"</p>
            </div>
          </div>
        </section>

        {/* Call to Action Card */}
        <section className="bg-slate-950 text-white p-8 rounded-3xl space-y-6 text-center border border-slate-800 shadow-xl">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFE083]">
              Start Free Today
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
              Ready to Get Verified Buyer Leads for Your Shop?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Join over 100+ active merchants across Nigeria on FLOATE AI.
            </p>
          </div>

          <a 
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#681A9E] hover:bg-[#52137e] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg cursor-pointer"
          >
            <Send className="w-4 h-4 text-white" />
            <span>Launch GramMY AI Bot on Telegram</span>
          </a>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 FLOATE AFRICA LTD. All rights reserved. Operating System for Informal Market Commerce.</p>
      </footer>
    </div>
  );
}
