import { ArrowLeft, Send, Sparkles, Target, ShieldCheck, Cpu, Users, Eye, Mail, MapPin, Building2, Linkedin, Twitter, ExternalLink, CheckCircle2, Phone } from 'lucide-react';

interface AboutUsPageProps {
  onBack: () => void;
}

export default function AboutUsPage({ onBack }: AboutUsPageProps) {
  const TELEGRAM_BOT_URL = 'https://t.me/Floatebusinessbot';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#F3E8FA] selection:text-[#661C95]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 text-[#661C95]" />
              <span>Back</span>
            </button>

            <a href="/" onClick={(e) => { e.preventDefault(); onBack(); }} className="flex items-center space-x-3">
              <img
                src="https://i.postimg.cc/nzQ7WvPK/20260807-223513.jpg"
                alt="FLOATE AI Logo"
                className="h-8 w-auto object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
              <span className="text-lg font-black tracking-tight text-[#111827] uppercase font-display">
                FLOATE <span className="text-[#661C95]">AI</span>
              </span>
            </a>
          </div>

          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex px-5 py-2.5 bg-[#661C95] hover:bg-[#4A0F6E] text-white font-bold text-xs uppercase tracking-wider rounded-full transition items-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 fill-white" />
            <span>Launch Bot</span>
          </a>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-[#661C95] via-[#4A0F6E] to-[#3B0B59] text-white py-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFDB8D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#FFDB8D] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5" />
            <span>ABOUT FLOATE AFRICA LTD</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display leading-tight">
            The Market Operating System For Africa’s Informal Economy
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl font-normal leading-relaxed">
            Powering how millions of small businesses across Africa discover customers, manage inventory, and close sales without app downloads.
          </p>
        </div>
      </div>

      {/* MAIN DOCUMENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
        
        {/* OUR STORY */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3E8FA] text-[#661C95] text-xs font-extrabold uppercase tracking-widest rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OUR STORY</span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] font-display">
            Bridging Africa's Commerce Gap
          </h2>
          <p className="text-slate-600 leading-relaxed">
            FLOATE AI was born from a simple observation: millions of African merchants have incredible products to sell, but no easy way to connect with buyers online. Meanwhile, buyers struggle to find trusted local sellers without wading through scams, outdated listings, and endless phone calls.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We built FLOATE AI to bridge this gap, not with another complicated app, but with the tools Africans already use every day: Telegram, WhatsApp, and plain language.
          </p>
          <p className="text-slate-600 leading-relaxed font-semibold text-[#111827]">
            Founded in Nigeria, FLOATE AFRICA LTD is on a mission to become The Market Operating System For Africa’s Informal Economy, the infrastructure layer that powers how small businesses discover customers, manage inventory, and grow.
          </p>
        </section>

        {/* WHAT WE BELIEVE */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3E8FA] text-[#661C95] text-xs font-extrabold uppercase tracking-widest rounded-full">
            <Target className="w-3.5 h-3.5" />
            <span>WHAT WE BELIEVE</span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] font-display">
            Core Beliefs & Philosophy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-lg">💡</span>
              <p className="font-bold text-[#111827] text-sm">People First Tech</p>
              <p className="text-xs text-slate-600">Technology should adapt to people, not the other way around.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-lg">🏪</span>
              <p className="font-bold text-[#111827] text-sm">Zero Complexity</p>
              <p className="text-xs text-slate-600">A Lagos trader shouldn't need a computer science degree to sell online.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-lg">🔒</span>
              <p className="font-bold text-[#111827] text-sm">Non-Negotiable Privacy</p>
              <p className="text-xs text-slate-600">Privacy is non-negotiable. Your contact details are yours until you say otherwise.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-lg">⚡</span>
              <p className="font-bold text-[#111827] text-sm">Value-Driven Pricing</p>
              <p className="text-xs text-slate-600">Every qualified lead has real value. Merchants should only pay for results.</p>
            </div>
          </div>
        </section>

        {/* WHAT WE BUILT */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3E8FA] text-[#661C95] text-xs font-extrabold uppercase tracking-widest rounded-full">
            <Cpu className="w-3.5 h-3.5" />
            <span>WHAT WE BUILT</span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] font-display">
            Three Core Layers of Conversational Commerce
          </h2>
          <p className="text-slate-600">
            FLOATE AI is an AI-powered conversational commerce platform with three core layers:
          </p>

          <div className="space-y-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#F3E8FA]/40 border border-[#661C95]/15 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#661C95] text-white flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="font-extrabold text-[#111827] text-base">WEB DISCOVERY</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                Buyers search for products and services on our clean, fast website. They see verified merchant cards with ratings and inventory summaries, but no exposed phone numbers. Every card links directly to our Telegram bot for continued conversation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F3E8FA]/40 border border-[#661C95]/15 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#661C95] text-white flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="font-extrabold text-[#111827] text-base">AI LEAD QUALIFICATION (TELEGRAM BOT)</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                Our bot is the engine. It understands natural language, including Nigerian Pidgin and Yoruba, and qualifies every buyer's intent before a merchant ever sees them. Budget? Confirmed. Location? Verified. Urgency? Assessed. Only real buyers get through.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F3E8FA]/40 border border-[#661C95]/15 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#661C95] text-white flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="font-extrabold text-[#111827] text-base">MERCHANT DASHBOARD (IN-TELEGRAM)</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
                Merchants don't need a separate app. They register, list inventory by voice or photo, track analytics, and receive qualified leads, all inside Telegram. Our Gemini AI structures unstructured input into live, searchable listings instantly.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold">
            💳 For every qualified lead delivered, merchants pay just credits from a pay-as-you-go balance. New merchants start with free credits. No subscriptions. No hidden fees.
          </div>
        </section>

        {/* OUR TECHNOLOGY */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3E8FA] text-[#661C95] text-xs font-extrabold uppercase tracking-widest rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OUR TECHNOLOGY</span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] font-display">
            Engineered for Modern African Scale
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 font-medium pt-2">
            <li className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-[#661C95] shrink-0" />
              <span>Gemini AI for multimodal inventory parsing (voice, photo, text)</span>
            </li>
            <li className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-[#661C95] shrink-0" />
              <span>Firebase Firestore for real-time data and instant search</span>
            </li>
            <li className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-[#661C95] shrink-0" />
              <span>Express.js backend with isolated service modules</span>
            </li>
            <li className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-[#661C95] shrink-0" />
              <span>Telegram Bot API (WhatsApp Business API coming soon)</span>
            </li>
          </ul>
        </section>

        {/* OUR TEAM */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3E8FA] text-[#661C95] text-xs font-extrabold uppercase tracking-widest rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>OUR TEAM</span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] font-display">
            Built by Local Operators
          </h2>
          <p className="text-slate-600 leading-relaxed">
            FLOATE AFRICA LTD is led by a team of Nigerian operators, engineers, and designers who understand the realities of doing business in Africa. We're builders first, obsessed with merchant success, buyer trust, and products that actually work on low-bandwidth, mobile-first environments.
          </p>
        </section>

        {/* OUR VISION */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3E8FA] text-[#661C95] text-xs font-extrabold uppercase tracking-widest rounded-full">
            <Eye className="w-3.5 h-3.5" />
            <span>OUR VISION</span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] font-display">
            Powering Pan-African Commerce
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Today, FLOATE AI connects buyers and sellers in Nigeria. Tomorrow, we power commerce across Africa, with local language support, embedded payments, merchant credit scoring, and logistics integration.
          </p>
          <p className="text-[#661C95] font-extrabold text-base pt-1">
            The informal economy is Africa's largest employer. It deserves world-class infrastructure. We're building it.
          </p>
        </section>

        {/* GET IN TOUCH */}
        <section className="bg-[#F3E8FA]/60 p-6 sm:p-8 rounded-3xl border border-[#661C95]/20 shadow-2xs space-y-6">
          <h2 className="text-xl font-black text-[#111827] font-display flex items-center gap-2 border-b border-[#661C95]/10 pb-3">
            <span>GET IN TOUCH</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 font-medium">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-base">🔍</span>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Search Products</p>
                <a href="/" onClick={(e) => { e.preventDefault(); onBack(); }} className="text-[#661C95] font-bold hover:underline">floate.ai</a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <Send className="w-4 h-4 text-[#661C95]" />
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">List Business</p>
                <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer" className="text-[#661C95] font-bold hover:underline">@Floatebusinessbot on Telegram</a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <Mail className="w-4 h-4 text-[#661C95]" />
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Email Inquiries</p>
                <a href="mailto:contact@floate.xyz" className="text-[#661C95] font-bold hover:underline">contact@floate.xyz</a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <Phone className="w-4 h-4 text-[#661C95]" />
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Phone Number</p>
                <a href="tel:07065599116" className="text-[#661C95] font-bold hover:underline">07065599116</a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-[#661C95]" />
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Corporate Address</p>
                <p className="text-slate-800 font-semibold text-xs">26, Abagana street, fegge onitsha, Anambra State</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <Linkedin className="w-4 h-4 text-[#661C95]" />
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Follow Us</p>
                <a href="https://www.linkedin.com/company/floate-africa/" target="_blank" rel="noopener noreferrer" className="text-[#661C95] font-bold hover:underline flex items-center gap-1">
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#661C95]/10 space-y-1 text-xs text-slate-600">
            <p className="font-bold text-[#111827]">FLOATE AFRICA LTD</p>
            <p>26, Abagana street, fegge onitsha, Anambra State, Nigeria | Registered in Nigeria (RC: 9365804)</p>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-10 border-t border-slate-800 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p>© 2026 FLOATE AFRICA LTD. All rights reserved. | 26, Abagana street, fegge onitsha, Anambra State</p>
          <p>Email: <a href="mailto:contact@floate.xyz" className="text-[#E8B923] hover:underline">contact@floate.xyz</a> | Tel: <a href="tel:07065599116" className="text-[#E8B923] hover:underline">07065599116</a></p>
          <p>FLOATE AI — The Market Operating System For Africa’s Informal Economy</p>
        </div>
      </footer>
    </div>
  );
}
