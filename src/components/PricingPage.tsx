import { useState } from 'react';
import { 
  ArrowLeft,
  Coins,
  Cpu,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface PricingPageProps {
  onBack: () => void;
  onSelectPlan: (plan: 'FREE' | 'HUSTLER' | 'MERCHANT' | 'PAY_AS_YOU_GO' | 'STARTER' | 'PRO') => void;
  darkMode?: boolean;
  initialCurrency?: string;
}

const BILLING_CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1.0, name: 'US Dollar', flag: '🇺🇸' },
  { code: 'NGN', symbol: '₦', rate: 1500, name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'GBP', symbol: '£', rate: 0.78, name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro', flag: '🇪🇺' },
  { code: 'CAD', symbol: 'CA$', rate: 1.36, name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'ZAR', symbol: 'R', rate: 18.5, name: 'South African Rand', flag: '🇿🇦' },
  { code: 'UGX', symbol: 'USh', rate: 3700, name: 'Ugandan Shilling', flag: '🇺🇬' },
  { code: 'RWF', symbol: 'RF', rate: 1300, name: 'Rwandan Franc', flag: '🇷🇼' },
  { code: 'AUD', symbol: 'A$', rate: 1.50, name: 'Australian Dollar', flag: '🇦🇺' }
];

export default function PricingPage({ onBack, onSelectPlan, initialCurrency }: PricingPageProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialCurrency || 'USD');
  const currentCurrencyObj = BILLING_CURRENCIES.find(c => c.code === selectedCurrency) || BILLING_CURRENCIES[0];
  const [exchangeRate, setExchangeRate] = useState<number>(currentCurrencyObj.rate);

  // Sync exchangeRate when currency changes
  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code);
    const found = BILLING_CURRENCIES.find(c => c.code === code);
    if (found) {
      setExchangeRate(found.rate);
    }
  };

  // Dynamic calculator state for credits
  const [estEmails, setEstEmails] = useState<number>(500);
  const [estInvoiceGen, setEstInvoiceGen] = useState<number>(40);

  // Credit Config
  const RATES = {
    creditCostUsd: 0.0100, // 1 Credit = $0.01 USD
    emailCredits: 10, // 10 Credits to send 1 email
    invoiceCredits: 5 // 5 Credits to compile 1 AI PDF Invoice
  };

  // Helper to format currency
  const formatVal = (usdVal: number) => {
    const converted = usdVal * exchangeRate;
    if (converted === 0) return `${currentCurrencyObj.symbol}0.00`;
    
    // Determine fractional digits based on currency scale
    const isLargeScale = ['UGX', 'RWF', 'NGN'].includes(selectedCurrency);
    const minDecimals = isLargeScale ? 0 : 2;
    const maxDecimals = isLargeScale ? 0 : 2;

    return `${currentCurrencyObj.symbol}${converted.toLocaleString(undefined, { 
      minimumFractionDigits: minDecimals, 
      maximumFractionDigits: maxDecimals 
    })}`;
  };

  // Live Calculations
  const totalRequiredCredits = (estEmails * RATES.emailCredits) + (estInvoiceGen * RATES.invoiceCredits);
  const totalUsdCost = totalRequiredCredits * RATES.creditCostUsd;

  // New Subscription Plans (The Campaign/Outreach Packages Business Model)
  const billingPlans = [
    {
      id: 'PAY_AS_YOU_GO' as const,
      name: "Pay-As-You-Go",
      type: "CREDIT PACKAGE",
      usdBase: 10.00,
      sequences: "3 Active campaigns",
      credits: "₦15,000 credit preloaded",
      description: "Recover a single stubborn outstanding payment. Perfect for occasional freelancers.",
      features: [
        "3 Active campaigns tracked",
        "Preloads standard credits",
        "Automated gentle email sequences",
        "Custom paylink generation",
        "Manual balance ledger tracking"
      ],
      popular: false,
    },
    {
      id: 'STARTER' as const,
      name: "Starter Pack",
      type: "POPULAR PACKAGE",
      usdBase: 25.00,
      sequences: "10 Active campaigns",
      credits: "₦37,500 credit preloaded",
      description: "Perfect for active freelancers and fast-growing micro-SMEs.",
      features: [
        "10 Active campaigns tracked",
        "Preloads premium credits",
        "Priority scheduling & email alerts",
        "Smart automated follow-up sequences",
        "Real-time payment dashboard"
      ],
      popular: true,
    },
    {
      id: 'PRO' as const,
      name: "Pro Unlimited",
      type: "UNLIMITED MEMBERSHIP",
      usdBase: 49.00,
      sequences: "Unlimited active",
      credits: "₦73,500 extra credit preloaded",
      description: "For established studios and businesses requiring unlimited dunning automation.",
      features: [
        "Unlimited active campaigns",
        "Preloads extra credits",
        "Priority premium email templates",
        "Custom email styling & branding",
        "24/7 dedicated support priority"
      ],
      popular: false,
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-950 font-sans relative pb-24 transition-colors">
      
      {/* Off-white background black tiny spots pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 pt-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-200/60 mb-12 font-sans">
          <button 
            onClick={onBack}
            className="flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 rounded font-black text-[10px] uppercase tracking-widest transition cursor-pointer select-none active:scale-95 shadow-xs"
            id="pricing-back-btn"
          >
            <ArrowLeft className="w-4 h-4 text-purple-600" /> Back to Home
          </button>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-md text-[10px] font-bold text-slate-900">
              <span>Visitor Region: <strong>Global Multi-Currency Engine</strong> active. Select any country below.</span>
            </div>

            <div className="flex items-center space-x-3 select-none">
              <div className="w-6 h-6 bg-purple-900 text-emerald-400 font-extrabold flex items-center justify-center rounded-xs text-xs">
                F
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] font-mono">FLOATE DISPATCH ENGINE</span>
            </div>
          </div>
        </div>

        {/* Currency Switcher Hub */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-16 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center lg:text-left font-sans">
            <span className="text-purple-600 font-mono text-[9px] font-black tracking-widest uppercase block">
              REAL-TIME GLOBAL CONVERSION CONTROLLER
            </span>
            <h3 className="font-sans font-black text-slate-950 text-sm uppercase tracking-tight">
              Interactive Multi-Currency Conversion Engine
            </h3>
            <p className="text-slate-600 text-xs font-bold leading-normal max-w-xl">
              Floate tracker and billing ledger is completely free. We charge zero commissions on recovered amounts. Select any global currency below to view plan price representations and preloaded credits instantly translated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
            {/* Currency select dropdown */}
            <div className="flex flex-col space-y-1.5 w-full sm:w-auto">
              <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block text-center sm:text-left">
                SELECT USER CURRENCY
              </span>
              <select
                id="pricing-currency-select"
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-100 cursor-pointer w-full sm:w-64"
              >
                {BILLING_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom exchange rate modifier */}
            {selectedCurrency !== 'USD' && (
              <div className="flex flex-col space-y-1.5 w-full sm:w-auto">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block text-center sm:text-left">
                  ADJUST CONVERSION RATE
                </span>
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg w-full sm:w-auto justify-center">
                  <span className="text-[10px] font-extrabold text-slate-550 font-mono uppercase">1 USD =</span>
                  <input 
                    id="pricing-rate-input"
                    type="number" 
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Math.max(0.0001, Number(e.target.value)))}
                    className="w-20 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono font-bold text-purple-700 text-center outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] font-black text-slate-950 font-mono">{selectedCurrency}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Central heading */}
        <div className="text-center max-w-3xl mx-auto space-y-5 mb-16 font-sans">
          <p className="text-black font-mono text-[10px] font-black tracking-[0.25em] uppercase px-3 py-1 bg-slate-100 border border-slate-200 rounded-full inline-block">
            Flexible Outreach Packages & Subscription Plans
          </p>
          <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight leading-none uppercase text-black">
            The core app is 100% free. <br />
            <span className="text-purple-600 font-black uppercase">Choose your automated outreach plan.</span>
          </h1>
          <p className="text-slate-900 text-xs sm:text-sm font-bold max-w-lg mx-auto leading-relaxed">
            Ledger tracking, manual payment URL shares, and dashboard reporting are forever free. We charge 0% commission on recovered balances. Select a flexible campaign outreach package or subscribe to unlimited monthly automated dunning.
          </p>
        </div>

        {/* Dynamic Subscription Cards */}
        <div className="mb-20">
          <div className="text-center md:text-left space-y-2 mb-8 border-b border-slate-200 pb-4 font-sans">
            <span className="text-black font-mono text-[9px] font-black tracking-widest uppercase bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
              campaign outreach packages
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-purple-600 uppercase">
              Choose an Upfront Package or Subscribe to Scale
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {billingPlans.map((plan) => (
              <div 
                key={plan.name} 
                className={`rounded-2xl p-6 flex flex-col justify-between shadow-xs transition relative border-2 ${
                  plan.id === 'PRO'
                    ? 'bg-slate-950 text-white border-slate-900'
                    : plan.popular
                      ? 'bg-white border-purple-600 ring-2 ring-purple-600/10'
                      : 'bg-white border-slate-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 bg-purple-600 text-white font-mono text-[8px] font-black tracking-widest px-2.5 py-1 uppercase rounded-full">
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-4 font-sans">
                  <span className={`text-[8.5px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block ${
                    plan.id === 'PRO' ? 'bg-slate-900 text-indigo-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {plan.type}
                  </span>
                  <div>
                    <h3 className={`font-sans font-black text-base uppercase tracking-tight ${plan.id === 'PRO' ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs font-bold mt-1.5 leading-relaxed ${plan.id === 'PRO' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className={`py-2 border-y flex items-baseline gap-1.5 ${plan.id === 'PRO' ? 'border-white/10' : 'border-slate-100'}`}>
                    <span className={`font-mono font-black text-3xl ${plan.id === 'PRO' ? 'text-white' : 'text-slate-900'}`}>
                      {formatVal(plan.usdBase)}
                    </span>
                    <span className={`text-xs font-medium font-sans ${plan.id === 'PRO' ? 'text-slate-400' : 'text-slate-500'}`}>
                      / {plan.id === 'PRO' ? 'month' : `${plan.id === 'STARTER' ? '10' : '3'} campaigns`}
                    </span>
                  </div>

                  <ul className="space-y-2 text-[11px]">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-purple-600 font-bold">✓</span>
                        <span className={plan.id === 'PRO' ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <span className={`text-[8px] font-mono font-extrabold uppercase tracking-wider block ${plan.id === 'PRO' ? 'text-purple-400' : 'text-purple-600'}`}>
                      {selectedCurrency === 'USD' ? 'Flat rate' : `Index: $${plan.usdBase.toFixed(2)} USD base`}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full py-2.5 rounded font-black text-[9px] uppercase tracking-widest transition cursor-pointer ${
                      plan.id === 'PRO'
                        ? 'bg-white hover:bg-slate-100 text-slate-950 animate-pulse'
                        : 'bg-slate-950 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Select Plan ({formatVal(plan.usdBase)})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Volume Cost Estimator */}
        <div className="bg-[#FAF9F6] border border-slate-300 rounded-2xl p-6 sm:p-8 mb-20 shadow-sm relative overflow-hidden font-sans">
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-stretch gap-8 relative z-10">
            {/* Controls */}
            <div className="flex-1 space-y-6">
              <div className="space-y-1.5">
                <div className="text-black font-mono text-[9px] font-black tracking-widest uppercase flex items-center justify-center sm:justify-start">
                  Estimator Calculator
                </div>
                <h3 className="font-sans font-black text-slate-950 text-lg uppercase tracking-tight text-center sm:text-left">
                  Project your monthly credit requirements
                </h3>
                <p className="text-slate-600 text-xs font-bold leading-relaxed text-center sm:text-left">
                  Slide parameters to calculate how many prepaid credits can fully power your dunning alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emails Slider */}
                <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-black uppercase text-slate-950">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> Emails</span>
                    <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px]">{estEmails} dispatches</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="2000" 
                    step="50" 
                    value={estEmails} 
                    onChange={(e) => setEstEmails(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[8px] font-mono font-extrabold text-slate-550 block uppercase">
                    Rate: {RATES.emailCredits} Credits per dispatch
                  </span>
                </div>

                {/* AI Invoice Gen Slider */}
                <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-black uppercase text-slate-950">
                    <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-amber-500" /> AI Compiled Invoices</span>
                    <span className="font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px]">{estInvoiceGen} builds</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    step="5" 
                    value={estInvoiceGen} 
                    onChange={(e) => setEstInvoiceGen(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[8px] font-mono font-extrabold text-slate-550 block uppercase">
                    Rate: {RATES.invoiceCredits} Credits per compile
                  </span>
                </div>
              </div>
            </div>

            {/* Total Read-out Side Panel */}
            <div className="w-full lg:w-80 bg-slate-950 text-white rounded-2xl p-6 flex flex-col justify-between border border-slate-800 text-center lg:text-left">
              <div className="space-y-4">
                <span className="text-[8px] font-mono font-black text-emerald-400 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded uppercase tracking-widest inline-block select-none">
                  interactive projection
                </span>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    Total Dispatch Fuel
                  </h4>
                  <p className="text-[9px] font-mono text-slate-405 font-extrabold uppercase">
                    Calculated required credits
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-4 pb-2 space-y-1">
                  <span className="text-4xl font-mono font-black text-white tracking-tight block">
                    {totalRequiredCredits.toLocaleString()} <span className="text-sm font-sans text-purple-400">Credits</span>
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-400 block mt-1">
                    Cost: {formatVal(totalUsdCost)}
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-500 font-mono tracking-widest uppercase block border-t border-slate-800 pt-1.5">
                    {selectedCurrency === 'USD' ? 'Flat rate' : `$${totalUsdCost.toFixed(4)} USD base coordinate`}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900/60 text-[10px] text-slate-400 font-semibold leading-normal">
                  <p>✓ Ledger Tracking: <strong className="text-emerald-400">FREE (0 Credits)</strong></p>
                  <p>✓ Custom PayLinks: <strong className="text-emerald-400">FREE (0 Credits)</strong></p>
                  <p>✓ Email Reminder Cost: <strong className="text-white">{RATES.emailCredits} Credits</strong></p>
                  <p>✓ Smart AI Invoice Cost: <strong className="text-white">{RATES.invoiceCredits} Credits</strong></p>
                  <p>✓ Recovery Success Commission: <strong className="text-emerald-400">0% FOREVER</strong></p>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => onSelectPlan("FREE")} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md font-black text-[10px] uppercase tracking-widest transition cursor-pointer select-none"
                  id="estimator-cta-btn"
                >
                  Create Your Free Account
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* The Comparative specifications Table (VERY BOLD) */}
        <div className="space-y-6">
          <div className="text-center md:text-left space-y-2 mb-8 border-b border-slate-200 pb-4">
            <span className="text-black font-mono text-[9px] font-black tracking-widest uppercase bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
              compare exact capabilities
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-purple-600 uppercase">
              Free Platform Core vs Automated Outreach Tiers
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-md">
            <table className="w-full border-collapse text-left text-xs font-sans">
              
              <thead>
                <tr className="bg-slate-950 text-white font-mono text-[9px] font-black uppercase tracking-wider border-b border-slate-800">
                  <th className="p-5 font-extrabold">Core capability spec</th>
                  <th className="p-5 text-center">Software core</th>
                  <th className="p-5 text-center bg-purple-900 border-x border-purple-800 text-white">Automated Outreach Reminders</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-200 font-bold">
                <tr>
                  <td className="p-5 font-black text-slate-950">Manual Balance Ledger Tracking</td>
                  <td className="p-5 text-center text-emerald-600 font-mono">UNLIMITED (FREE)</td>
                  <td className="p-5 text-center bg-purple-50/50 border-x border-purple-100 text-slate-400">—</td>
                </tr>
                <tr>
                  <td className="p-5 font-black text-slate-950">1-Click Customer PayLinks</td>
                  <td className="p-5 text-center text-emerald-600 font-mono">UNLIMITED (FREE)</td>
                  <td className="p-5 text-center bg-purple-50/50 border-x border-purple-100 text-slate-400">—</td>
                </tr>
                <tr>
                  <td className="p-5 font-black text-slate-950">White-label PDF Invoice Template Builder</td>
                  <td className="p-5 text-center text-emerald-600 font-mono">UNLIMITED (FREE)</td>
                  <td className="p-5 text-center bg-purple-50/50 border-x border-purple-100 text-slate-400">—</td>
                </tr>
                <tr>
                  <td className="p-5 font-black text-slate-950">AI Smart Cognitive Invoice PDF compilation</td>
                  <td className="p-5 text-center text-slate-400">—</td>
                  <td className="p-5 text-center bg-purple-50/50 border-x border-purple-100 font-mono text-purple-950">5 Credits per compilation</td>
                </tr>
                <tr>
                  <td className="p-5 font-black text-slate-950">Automatic Email Outreach reminders</td>
                  <td className="p-5 text-center text-slate-400">—</td>
                  <td className="p-5 text-center bg-purple-50/50 border-x border-purple-100 font-mono text-purple-950">10 Credits per dispatch</td>
                </tr>
                <tr>
                  <td className="p-5 font-black text-slate-950">Active Collection Commission (Traditional / Bank logs)</td>
                  <td className="p-5 text-center text-emerald-600 font-mono">0% (Default Free)</td>
                  <td className="p-5 text-center bg-purple-50/50 border-x border-purple-100 font-black text-emerald-600">0% Success Commission</td>
                </tr>
                <tr>
                  <td className="p-5 font-black text-slate-950">Active Collection Commission (Online portal checkouts)</td>
                  <td className="p-5 text-center text-emerald-600 font-mono">0% (Default Free)</td>
                  <td className="p-5 text-center bg-purple-50/50 border-x border-purple-100 font-black text-emerald-600">0% Success Commission</td>
                </tr>
              </tbody>

            </table>
          </div>
        </div>

        {/* Absolute Guarantee Card */}
        <div className="mt-16 p-8 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between font-sans">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-purple-950 font-black text-sm uppercase tracking-tight flex items-center justify-center md:justify-start gap-1.5">
              <ShieldCheck className="w-5 h-5 text-purple-600" /> DIRECT CLEARING — NO AGENTS IN THE MIDDLE
            </h4>
            <p className="text-slate-905 text-xs font-bold leading-normal max-w-xl">
              All debtor payments route directly to your configured bank account. Since money clears instantly into your custom address, Floate never collects a percentage or retains custody of your capital transfers.
            </p>
          </div>
          <button 
            onClick={() => onSelectPlan("FREE")} 
            className="w-full md:w-auto px-7 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-widest rounded-sm transition cursor-pointer select-none shadow-xs text-center active:scale-95 border-b-2 border-purple-800"
            id="pricing-cta-bottom"
          >
            Get Started for Free
          </button>
        </div>

        {/* FAQs */}
        <div className="mt-20 border-t border-slate-200 pt-16">
          <div className="max-w-3xl mx-auto space-y-3 text-center mb-12 font-sans">
            <span className="text-purple-600 font-mono text-[9px] font-black tracking-widest uppercase">
              got questions about plans & credits?
            </span>
            <h3 className="font-sans font-black text-2xl uppercase tracking-tight text-slate-950">
              Clear Answers About Our Campaign Subscription Model
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-sans font-black text-sm uppercase tracking-tight text-slate-950">
                Is the software really 100% free?
              </h4>
              <p className="text-slate-700 text-xs font-bold leading-relaxed">
                Yes. Running your balance ledger, generating manual custom paylinks for share, and viewing reports are completely free without any subscriptions or commissions. The only fees are package plans when you configure automated dunning sequences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-sans font-black text-sm uppercase tracking-tight text-slate-950">
                What are automated dunning sequences?
              </h4>
              <p className="text-slate-700 text-xs font-bold leading-relaxed">
                An active campaign/dunning sequence tracks an individual outstanding invoice and continuously delivers coordinated, polite email reminders until payment is fully settled or resolved.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-sans font-black text-sm uppercase tracking-tight text-slate-950">
                Do my preloaded credits expire?
              </h4>
              <p className="text-slate-700 text-xs font-bold leading-relaxed">
                No, credits preloaded onto your account through packages never expire. They roll over month-to-month and stay active in your wallet indefinitely.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-sans font-black text-sm uppercase tracking-tight text-slate-950">
                Is there any commission taken on collected funds?
              </h4>
              <p className="text-slate-700 text-xs font-bold leading-relaxed">
                None. Our success fee is exactly 0% under all circumstances. Whether a client settles an invoice manually, pays online, or wires transfers directly to your bank account, you pay zero commission fees to Floate.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-sans font-black text-sm uppercase tracking-tight text-slate-950">
                Can I use Floate without active sequences?
              </h4>
              <p className="text-slate-700 text-xs font-bold leading-relaxed">
                Absolutely. If you log everything manually and copy/paste custom payLinks directly into your own personal email or messaging tool, you will never spend a single credit or pay a single dime.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-sans font-black text-sm uppercase tracking-tight text-slate-950">
                Do you require a credit card up front?
              </h4>
              <p className="text-slate-700 text-xs font-bold leading-relaxed">
                No signup contracts, monthly minimums, or recurring subscription card holds. You can set up your ledger in 60 seconds with simple, direct access. Choose a campaign package whenever you are ready to activate automation.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
