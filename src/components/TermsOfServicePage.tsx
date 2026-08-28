import { ArrowLeft, FileText, Send, Mail, MapPin, Building2, ShieldCheck, Phone } from 'lucide-react';

interface TermsOfServicePageProps {
  onBack: () => void;
}

export default function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
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

      {/* HERO SECTION */}
      <div className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3E8FA] text-[#661C95] text-xs font-bold uppercase tracking-wider border border-[#661C95]/20">
            <FileText className="w-3.5 h-3.5 text-[#661C95]" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight font-display">
            FLOATE AI — TERMS OF SERVICE
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-semibold font-mono">
            Effective Date: August 10, 2026 | FLOATE AFRICA LTD
          </p>
        </div>
      </div>

      {/* DOCUMENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
        
        {/* SECTION 1 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">1.</span> ACCEPTANCE OF TERMS
          </h2>
          <p>
            By accessing or using FLOATE AI's website, Telegram bot, WhatsApp bot (coming soon), and related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use our Services.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you and FLOATE AFRICA LTD ("FLOATE AI," "we," "us," or "our"), a company registered in Nigeria.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">2.</span> DEFINITIONS
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>"Buyer"</strong> means a user who searches for products or services on our platform.</li>
            <li><strong>"Merchant"</strong> means a business or individual who lists products or services on our platform.</li>
            <li><strong>"Lead"</strong> means a qualified buyer inquiry matched to a merchant.</li>
            <li><strong>"Credits"</strong> means the virtual currency used to access qualified leads.</li>
            <li><strong>"Platform"</strong> means our website, Telegram bot, WhatsApp bot, and any related services.</li>
          </ul>
        </section>

        {/* SECTION 3 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">3.</span> ELIGIBILITY
          </h2>
          <p>You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>You are at least 18 years old.</li>
            <li>You have the legal capacity to enter into these Terms.</li>
            <li>You are not prohibited from using our Services under applicable laws.</li>
            <li>The information you provide is accurate, complete, and current.</li>
          </ul>
        </section>

        {/* SECTION 4 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">4.</span> SERVICES DESCRIPTION
          </h2>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">4.1 For Buyers</h3>
            <p className="text-slate-600">
              FLOATE AI provides a search and discovery platform that connects buyers with verified local merchants. Our AI system qualifies buyer intent before sharing merchant contact details. We do not guarantee the availability, quality, or legality of any products or services listed by merchants.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">4.2 For Merchants</h3>
            <p className="text-slate-600">
              FLOATE AI provides tools to list inventory, receive qualified leads, and manage business analytics. We charge credits per qualified lead delivered. New merchants receive free starter credits.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">4.3 Lead Qualification</h3>
            <p className="text-slate-600">
              Our AI system qualifies leads by verifying buyer intent, budget, location, and urgency. We strive for accuracy but do not guarantee that every qualified lead will result in a sale. Merchants bear sole responsibility for closing deals.
            </p>
          </div>
        </section>

        {/* SECTION 5 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">5.</span> ACCOUNT REGISTRATION
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>5.1 To access certain features, you must register an account. You agree to provide accurate and complete information during registration.</li>
            <li>5.2 You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
            <li>5.3 You must notify us immediately of any unauthorized use of your account.</li>
          </ul>
        </section>

        {/* SECTION 6 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">6.</span> MERCHANT CREDITS AND PAYMENTS
          </h2>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">6.1 Credit System</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>New merchants receive free credits upon registration.</li>
              <li>Each qualified lead costs credits.</li>
              <li>Credits can be purchased through our in-bot payment system.</li>
              <li>Credits are non-refundable and non-transferable.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">6.2 Payment Processing</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Payments are processed through Paystack and Flutterwave.</li>
              <li>All prices are in Nigerian Naira (NGN) unless otherwise stated.</li>
              <li>You agree to pay all applicable fees and taxes.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">6.3 No Guarantee of Sales</h3>
            <p className="text-slate-600">
              FLOATE AI qualifies leads but does not guarantee that any lead will result in a sale. Credit consumption occurs upon lead delivery, regardless of whether the merchant closes the deal.
            </p>
          </div>
        </section>

        {/* SECTION 7 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">7.</span> USER CONDUCT
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Use our Services for illegal, fraudulent, or harmful purposes.</li>
            <li>Post false, misleading, or deceptive listings.</li>
            <li>Harass, abuse, or harm other users.</li>
            <li>Attempt to circumvent our lead qualification or credit systems.</li>
            <li>Scrape, crawl, or extract data from our platform without authorization.</li>
            <li>Impersonate any person or entity.</li>
            <li>Upload viruses, malware, or harmful code.</li>
            <li>Violate any applicable laws or regulations.</li>
          </ul>
        </section>

        {/* SECTION 8 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">8.</span> MERCHANT LISTINGS AND CONTENT
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>8.1 Merchants are solely responsible for the accuracy, legality, and quality of their listings.</li>
            <li>8.2 By submitting content (text, photos, voice notes), you grant FLOATE AI a non-exclusive, royalty-free license to use, display, and distribute that content for the purpose of operating our Services.</li>
            <li>8.3 We reserve the right to remove any listing that violates these Terms or applicable laws.</li>
          </ul>
        </section>

        {/* SECTION 9 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">9.</span> INTELLECTUAL PROPERTY
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>9.1 FLOATE AI owns all rights to our platform, branding, software, and content (excluding user-generated content).</li>
            <li>9.2 You may not copy, modify, distribute, or create derivative works from our Services without our written consent.</li>
          </ul>
        </section>

        {/* SECTION 10 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">10.</span> DISCLAIMER OF WARRANTIES
          </h2>
          <p className="font-bold text-[#111827] uppercase tracking-wide text-xs">
            OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</li>
            <li>WARRANTIES THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.</li>
            <li>WARRANTIES REGARDING THE QUALITY, SAFETY, OR LEGALITY OF PRODUCTS OR SERVICES SOLD BY MERCHANTS.</li>
          </ul>
        </section>

        {/* SECTION 11 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">11.</span> LIMITATION OF LIABILITY
          </h2>
          <p className="font-bold text-[#111827] uppercase tracking-wide text-xs">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLOATE AFRICA LTD SHALL NOT BE LIABLE FOR:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</li>
            <li>LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES.</li>
            <li>DAMAGES ARISING FROM TRANSACTIONS BETWEEN BUYERS AND MERCHANTS.</li>
            <li>DAMAGES EXCEEDING THE TOTAL AMOUNT PAID BY YOU TO FLOATE AI IN THE PRECEDING 12 MONTHS.</li>
          </ul>
        </section>

        {/* SECTION 12 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">12.</span> INDEMNIFICATION
          </h2>
          <p className="text-slate-600">
            You agree to indemnify and hold harmless FLOATE Africa Ltd, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our Services or violation of these Terms.
          </p>
        </section>

        {/* SECTION 13 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">13.</span> TERMINATION
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>13.1 We may suspend or terminate your account at any time for violations of these Terms or for any other reason at our sole discretion.</li>
            <li>13.2 You may terminate your account by contacting us. Upon termination, your right to use our Services ceases immediately.</li>
            <li>13.3 Sections 9, 10, 11, 12, and 14 survive termination.</li>
          </ul>
        </section>

        {/* SECTION 14 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">14.</span> GOVERNING LAW AND DISPUTE RESOLUTION
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>14.1 These Terms are governed by the laws of the Federal Republic of Nigeria.</li>
            <li>14.2 Any disputes shall first be attempted to be resolved through good-faith negotiation.</li>
            <li>14.3 If negotiation fails, disputes shall be resolved through arbitration in Lagos, Nigeria, in accordance with the Arbitration and Conciliation Act.</li>
          </ul>
        </section>

        {/* SECTION 15 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">15.</span> CHANGES TO TERMS
          </h2>
          <p className="text-slate-600">
            We may modify these Terms at any time. We will notify users of significant changes via our platform or email. Continued use of our Services after changes constitutes acceptance.
          </p>
        </section>

        {/* SECTION 16 */}
        <section className="bg-[#F3E8FA]/60 p-6 sm:p-8 rounded-3xl border border-[#661C95]/20 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-[#661C95]/10 pb-3">
            <span className="text-[#661C95]">16.</span> CONTACT INFORMATION
          </h2>
          <p className="font-semibold text-[#111827]">
            For questions about these Terms, contact us:
          </p>
          <div className="space-y-2.5 text-sm text-slate-700 font-medium">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#661C95]" />
              <span><strong>FLOATE AFRICA LTD</strong> (RC: 9365804)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#661C95]" />
              <span>Email: <a href="mailto:contact@floate.xyz" className="text-[#661C95] underline font-bold">contact@floate.xyz</a></span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#661C95]" />
              <span>Phone: <a href="tel:07065599116" className="text-[#661C95] underline font-bold">07065599116</a></span>
            </div>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#661C95]" />
              <span>Telegram: <a href="https://t.me/Floatebusinessbot" target="_blank" rel="noopener noreferrer" className="text-[#661C95] underline">@Floatebusinessbot</a></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#661C95]" />
              <span>Registered Address: 26, Abagana street, fegge onitsha, Anambra State, Nigeria</span>
            </div>
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
