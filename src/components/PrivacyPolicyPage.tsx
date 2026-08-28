import { ArrowLeft, Lock, ShieldCheck, Mail, Send, MapPin, Building2, Phone } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
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

      {/* CONTENT HERO */}
      <div className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3E8FA] text-[#661C95] text-xs font-bold uppercase tracking-wider border border-[#661C95]/20">
            <Lock className="w-3.5 h-3.5 text-[#661C95]" />
            <span>Legal & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight font-display">
            FLOATE AI — PRIVACY POLICY
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-semibold font-mono">
            Effective Date: August 10, 2026 | FLOATE AFRICA LTD
          </p>
        </div>
      </div>

      {/* MAIN DOCUMENT BODY */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
        {/* SECTION 1 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">1.</span> INTRODUCTION
          </h2>
          <p>
            FLOATE AFRICA LTD ("FLOATE AI," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website (floate.ai), Telegram bot, WhatsApp bot (coming soon), and related services (collectively, the "Services").
          </p>
          <p>
            By using our Services, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use our Services.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">2.</span> INFORMATION WE COLLECT
          </h2>
          
          <div className="space-y-4">
            <h3 className="font-bold text-[#111827] text-base">2.1 Information You Provide Directly</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Account Information:</strong> Business name, contact details, WhatsApp/Telegram username, phone number, business category, and location (state and city).</li>
              <li><strong>Inventory Data:</strong> Product descriptions, prices, stock quantities, photos, and voice notes submitted for listing.</li>
              <li><strong>Search Queries:</strong> Product or service searches entered on our platform.</li>
              <li><strong>Communication Data:</strong> Messages exchanged with our AI bot for lead qualification.</li>
              <li><strong>Payment Information:</strong> Credit purchase transactions processed through our in-bot payment system (we do not store full payment card details).</li>
            </ul>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-[#111827] text-base">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Device Information:</strong> Device type, operating system, browser type, and IP address.</li>
              <li><strong>Usage Data:</strong> Pages visited, search terms used, clicks, time spent on platform, and interaction patterns.</li>
              <li><strong>Location Data:</strong> General geographic location derived from IP address or user-provided state/city.</li>
              <li><strong>Cookies and Similar Technologies:</strong> We use cookies to enhance user experience and analyze platform usage.</li>
            </ul>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-[#111827] text-base">2.3 Information from Third Parties</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Payment processors (Paystack, Flutterwave) for transaction verification.</li>
              <li>Telegram and WhatsApp APIs for bot functionality and user identification.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">3.</span> HOW WE USE YOUR INFORMATION
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Provide and maintain our Services, including search, lead matching, and inventory management.</li>
            <li>Process and qualify buyer leads through our AI-powered Telegram/WhatsApp bots.</li>
            <li>Facilitate connections between buyers and verified merchants.</li>
            <li>Process credit purchases and manage merchant accounts.</li>
            <li>Send notifications about leads, account activity, and platform updates.</li>
            <li>Improve our AI models and platform functionality.</li>
            <li>Detect and prevent fraud, spam, and abusive behavior.</li>
            <li>Comply with legal obligations and enforce our Terms of Service.</li>
          </ul>
        </section>

        {/* SECTION 4 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">4.</span> HOW WE SHARE YOUR INFORMATION
          </h2>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">4.1 With Merchants (Buyers)</h3>
            <p className="text-slate-600">
              When a buyer's lead is qualified, we share the buyer's contact information (as provided during qualification) with the matched merchant. This sharing occurs only after the buyer has explicitly requested contact and the lead has passed our qualification process.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">4.2 With Buyers (Merchants)</h3>
            <p className="text-slate-600">
              Merchant business profiles, including business name, category, location, and inventory listings, are displayed publicly on our platform. Merchant contact details (phone/WhatsApp) are shared with qualified buyers only after the merchant approves or the lead is confirmed.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">4.3 Service Providers</h3>
            <p className="text-slate-600">
              We share information with trusted third-party service providers who assist us in operating our platform, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Cloud hosting and database services (Google Firebase, Google Cloud)</li>
              <li>Payment processing services (Paystack, Flutterwave)</li>
              <li>Analytics services (Google Analytics)</li>
              <li>Communication APIs (Telegram Bot API, WhatsApp Business API)</li>
            </ul>
            <p className="text-slate-600 text-xs italic">
              These providers are contractually obligated to protect your information and use it only for the services they provide to us.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">4.4 Legal Requirements</h3>
            <p className="text-slate-600">
              We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders, government agencies).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-[#111827] text-base">4.5 Business Transfers</h3>
            <p className="text-slate-600">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your information becomes subject to a different privacy policy.
            </p>
          </div>
        </section>

        {/* SECTION 5 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">5.</span> DATA SECURITY
          </h2>
          <p>We implement industry-standard security measures to protect your information:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Encryption of data in transit (HTTPS/TLS) and at rest.</li>
            <li>Access controls and authentication for internal systems.</li>
            <li>Regular security audits and vulnerability assessments.</li>
            <li>Firestore security rules and Google Sheets access restrictions.</li>
          </ul>
          <p className="text-slate-500 text-xs">
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        {/* SECTION 6 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">6.</span> DATA RETENTION
          </h2>
          <p>We retain your information for as long as necessary to provide our Services and fulfill the purposes outlined in this policy:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Active accounts:</strong> Data retained while account is active.</li>
            <li><strong>Inactive accounts:</strong> Data retained for 12 months after last activity, then deleted or anonymized.</li>
            <li><strong>Transaction records:</strong> Retained for 6 years for legal and accounting purposes.</li>
            <li><strong>Deleted accounts:</strong> Personal information deleted within 30 days of account deletion request, except where retention is required by law.</li>
          </ul>
        </section>

        {/* SECTION 7 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">7.</span> YOUR RIGHTS
          </h2>
          <p>Depending on your location, you may have the following rights regarding your personal information:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Access:</strong> Request a copy of the information we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information.</li>
            <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances.</li>
            <li><strong>Portability:</strong> Request transfer of your information to another service.</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests.</li>
          </ul>
          <p className="text-slate-600 pt-2 font-medium">
            To exercise these rights, contact us at <a href="mailto:contact@floate.xyz" className="text-[#661C95] underline font-bold">contact@floate.xyz</a>.
          </p>
        </section>

        {/* SECTION 8 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">8.</span> COOKIES AND TRACKING TECHNOLOGIES
          </h2>
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Remember your preferences and settings.</li>
            <li>Understand how you interact with our platform.</li>
            <li>Improve our Services and user experience.</li>
          </ul>
          <p className="text-slate-600">
            You can control cookies through your browser settings. Disabling cookies may affect the functionality of our Services.
          </p>
        </section>

        {/* SECTION 9 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">9.</span> CHILDREN'S PRIVACY
          </h2>
          <p>
            Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:contact@floate.xyz" className="text-[#661C95] underline font-bold">contact@floate.xyz</a>.
          </p>
        </section>

        {/* SECTION 10 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">10.</span> INTERNATIONAL DATA TRANSFERS
          </h2>
          <p>
            Your information may be transferred to and processed in countries other than your own, including countries that may not have the same data protection laws. We ensure appropriate safeguards are in place for such transfers, including standard contractual clauses.
          </p>
        </section>

        {/* SECTION 11 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[#661C95]">11.</span> CHANGES TO THIS PRIVACY POLICY
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our website and updating the effective date. Your continued use of our Services after such changes constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* SECTION 12 */}
        <section className="bg-[#F3E8FA]/60 p-6 sm:p-8 rounded-3xl border border-[#661C95]/20 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#111827] font-display flex items-center gap-2 border-b border-[#661C95]/10 pb-3">
            <span className="text-[#661C95]">12.</span> CONTACT US
          </h2>
          <p className="font-semibold text-[#111827]">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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
