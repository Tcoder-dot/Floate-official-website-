import { useState } from 'react';
import { X, CheckCircle, ShieldAlert, Mail, Plus, Minus, Sliders, AlertCircle, Sparkles } from 'lucide-react';

interface ReminderSelectorModalProps {
  debtorName: string;
  debtorAmount: number;
  debtorCurrency: string;
  userCredits: number;
  onClose: () => void;
  onConfirm: (
    tier: 'GENTLE' | 'AGGRESSIVE' | 'CUSTOM',
    totalCharge: number,
    customCounts?: { smsCount: number; emailCount: number; whatsappCount: number; voiceCount: number }
  ) => void;
  onOpenTopUp: () => void;
}

export default function ReminderSelectorModal({
  debtorName,
  debtorAmount,
  debtorCurrency,
  userCredits,
  onClose,
  onConfirm,
  onOpenTopUp
}: ReminderSelectorModalProps) {
  const [selectedTier, setSelectedTier] = useState<'GENTLE' | 'AGGRESSIVE' | 'CUSTOM'>('GENTLE');

  // Pricing structure: 1 Email Dispatch = 10 Credits, 1 Credit = ₦15.00 NGN
  const NAIRA_PER_CREDIT = 15;
  const CREDITS_PER_EMAIL = 10;

  // Gentle (Standard) Campaign: 5 sequential emails
  const gentleEmailCount = 5;
  const gentleCredits = gentleEmailCount * CREDITS_PER_EMAIL;
  const gentleCost = gentleCredits * NAIRA_PER_CREDIT; // ₦750.00

  // Strict (Priority) Campaign: 12 sequential emails with escalated tones
  const aggressiveEmailCount = 12;
  const aggressiveCredits = aggressiveEmailCount * CREDITS_PER_EMAIL;
  const aggressiveCost = aggressiveCredits * NAIRA_PER_CREDIT; // ₦1,800.00

  // Custom campaign configuration (strictly emails only)
  const [customEmailCount, setCustomEmailCount] = useState(8);
  const customCredits = customEmailCount * CREDITS_PER_EMAIL;
  const customCost = customCredits * NAIRA_PER_CREDIT;

  // Selected cost & credit requirements
  const selectedCost = selectedTier === 'GENTLE' 
    ? gentleCost 
    : selectedTier === 'AGGRESSIVE' 
      ? aggressiveCost 
      : customCost;

  const selectedCredits = selectedTier === 'GENTLE'
    ? gentleCredits
    : selectedTier === 'AGGRESSIVE'
      ? aggressiveCredits
      : customCredits;

  // Beta testing bypass: Always allow launching campaign without credit block as requested by user
  const isInsufficient = false;

  const handleConfirmChoice = () => {
    if (isInsufficient) {
      onOpenTopUp();
      return;
    }
    
    if (selectedTier === 'CUSTOM') {
      onConfirm('CUSTOM', customCost, {
        smsCount: 0,
        emailCount: customEmailCount,
        whatsappCount: 0,
        voiceCount: 0
      });
    } else {
      onConfirm(
        selectedTier, 
        selectedTier === 'GENTLE' ? gentleCost : aggressiveCost,
        selectedTier === 'GENTLE' 
          ? { smsCount: 0, emailCount: gentleEmailCount, whatsappCount: 0, voiceCount: 0 }
          : { smsCount: 0, emailCount: aggressiveEmailCount, whatsappCount: 0, voiceCount: 0 }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        id="reminder-selector-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="relative bg-white rounded-lg max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden mx-auto animate-fade-in z-10">
        
        {/* Header decoration banner */}
        <div className="bg-slate-950 px-6 py-6 text-white text-left">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[8px] uppercase tracking-widest font-mono font-bold bg-slate-950 text-white px-2.5 py-1 rounded-sm">
                  PAY-AS-YOU-GO Dunning Mail Engine
                </span>
                <span className="text-[8px] uppercase tracking-widest font-mono font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-sm animate-pulse">
                  BETA TEST: PAYWALL DISABLED
                </span>
              </div>
              <h3 className="font-sans font-black text-lg uppercase tracking-tight mt-2.5">Launch Chaser Campaign</h3>
              <p className="text-slate-300 text-xs mt-1">
                Configure smart, automated dunning email notifications to recover outstanding balance from <strong className="text-white">{debtorName}</strong> ({debtorCurrency}{debtorAmount.toLocaleString()})
              </p>
            </div>
            <button 
              id="close-reminder-choice-btn"
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-sm hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Credit balance monitor */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono">Your Account Wallet</span>
              <p className="text-xs font-bold text-slate-800 font-mono">
                ₦{userCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-400 font-normal font-sans uppercase">Available Balance</span>
              </p>
            </div>
            
            {isInsufficient ? (
              <div className="flex items-center space-x-2 text-red-800 bg-red-50 px-2.5 py-1 rounded border border-red-100 text-[10px] font-bold uppercase tracking-wide">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span className="text-red-700">₦{(selectedCost - userCredits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Short</span>
              </div>
            ) : (
              <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded font-bold border border-emerald-100 uppercase tracking-widest font-mono">
                Balance OK
              </span>
            )}
          </div>

          {/* Selector Selection cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* TIER 1 - GENTLE / STANDARD */}
            <div 
              onClick={() => setSelectedTier('GENTLE')}
              className={`p-4 rounded-xl border cursor-pointer text-left transition select-none flex flex-col justify-between ${
                selectedTier === 'GENTLE'
                  ? 'border-purple-600 bg-purple-50/20 shadow-xs ring-1 ring-purple-600/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] uppercase font-mono font-black text-slate-900 tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    Standard Chase
                  </span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedTier === 'GENTLE' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedTier === 'GENTLE' && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>

                <div>
                  <div className="font-sans font-black text-xl text-slate-950">₦{gentleCost.toFixed(2)}</div>
                  <span className="text-[9px] text-purple-600 font-mono uppercase font-black tracking-wider block">{gentleCredits} Credits required</span>
                </div>

                <p className="text-slate-500 text-[11px] leading-relaxed">
                  5 gentle sequential reminders paced over standard settlement windows. Soft, professional tone.
                </p>

                <div className="space-y-1 pt-2 border-t border-slate-100 font-mono text-[9px] text-slate-500/80">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-purple-600" /> 5 Automated Email Alerts
                  </div>
                  <div className="text-[8px] text-slate-400">Paced: Days 1, 3, 7, 14, 21</div>
                </div>
              </div>
            </div>

            {/* TIER 2 - PRIORITY */}
            <div 
              onClick={() => setSelectedTier('AGGRESSIVE')}
              className={`p-4 rounded-xl border cursor-pointer text-left transition relative select-none flex flex-col justify-between ${
                selectedTier === 'AGGRESSIVE'
                  ? 'border-purple-600 bg-purple-50/20 shadow-xs ring-1 ring-purple-600/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="absolute -top-1.5 px-2 py-0.5 right-4 bg-purple-600 text-white text-[7px] font-black tracking-widest uppercase rounded">
                Escalated Tone
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] uppercase font-mono font-black text-slate-900 tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    Strict Chase
                  </span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedTier === 'AGGRESSIVE' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedTier === 'AGGRESSIVE' && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>

                <div>
                  <div className="font-sans font-black text-xl text-slate-950">₦{aggressiveCost.toFixed(2)}</div>
                  <span className="text-[9px] text-purple-600 font-mono uppercase font-black tracking-wider block">{aggressiveCredits} Credits required</span>
                </div>

                <p className="text-slate-500 text-[11px] leading-relaxed">
                  12 sequential reminder dispatches using escalated collection warnings to prompt response.
                </p>

                <div className="space-y-1 pt-2 border-t border-slate-100 font-mono text-[9px] text-slate-500/80">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-purple-600" /> 12 Automated Email Alerts
                  </div>
                  <div className="text-[8px] text-slate-400">Paced: Automated recurrence triggers</div>
                </div>
              </div>
            </div>

            {/* TIER 3 - CUSTOM DYNAMIC */}
            <div 
              onClick={() => setSelectedTier('CUSTOM')}
              className={`p-4 rounded-xl border cursor-pointer text-left transition select-none flex flex-col justify-between ${
                selectedTier === 'CUSTOM'
                  ? 'border-purple-600 bg-purple-50/20 shadow-xs ring-1 ring-purple-600/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] uppercase font-mono font-black text-slate-900 tracking-wider bg-amber-100 px-2 py-0.5 rounded text-amber-900 flex items-center gap-1">
                    <Sliders className="w-2.5 h-2.5" /> Bespoke Chase
                  </span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedTier === 'CUSTOM' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedTier === 'CUSTOM' && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>

                <div>
                  <div className="font-sans font-black text-xl text-slate-950">₦{customCost.toFixed(2)}</div>
                  <span className="text-[9px] text-slate-950 font-mono uppercase font-black tracking-wider block">{customCredits} Credits required</span>
                </div>

                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Build your own custom schedule specifying exactly how many email sequences you want to queue.
                </p>

                <div className="pt-2 border-t border-slate-100 font-mono text-[9px] text-slate-500/80">
                  <span className="font-sans font-bold text-amber-900 uppercase text-[8px] tracking-widest block bg-amber-50 border border-amber-100 text-center py-1 rounded">
                    Adjust Emails Below 👇
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bespoke Interactive adjuster (strictly emails only) */}
          {selectedTier === 'CUSTOM' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 animate-fade-in">
              <span className="text-[8px] font-mono font-extrabold text-slate-400 tracking-wider uppercase block">
                Bespoke Campaign Outboxes
              </span>
              
              <div className="max-w-md mx-auto">
                <div className="bg-white p-4 rounded-lg border border-slate-150 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-black text-slate-950">Emails Dispatched</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 font-bold block">Cost: ₦{(NAIRA_PER_CREDIT * CREDITS_PER_EMAIL).toFixed(2)} ({CREDITS_PER_EMAIL} Credits) each</span>
                  </div>
                  
                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setCustomEmailCount(prev => Math.max(prev - 1, 1))}
                      className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer text-xs font-bold font-mono transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-extrabold text-sm text-slate-950">{customEmailCount}</span>
                    <button
                      type="button"
                      onClick={() => setCustomEmailCount(prev => Math.min(prev + 1, 30))}
                      className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer text-xs font-bold font-mono transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fee break-down */}
          <div className="bg-slate-950 p-4 rounded-xl text-center space-y-1">
            <p className="text-xs text-slate-300 font-sans">
              Campaign Campaign Budget: <strong className="text-white text-sm font-mono tracking-tight font-black">₦{selectedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </p>
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              Deducted {selectedCredits} pay-as-you-go credits from your active available balance
            </p>
            {isInsufficient && (
              <div className="p-3 bg-red-900/10 rounded-lg text-left inline-flex space-x-2.5 items-start text-xs text-red-800 border border-red-500/20 w-full animate-shake mt-2">
                <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-700">Insufficient Wallet Balance</p>
                  <p className="text-[11px] text-red-400 leading-normal">Your balance is ₦{userCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Please click top-up to convert funds instantaneously via credit card simulation.</p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Action Controls */}
          <div className="flex items-center justify-end space-x-2.5">
            <button
              id="cancel-reminder-choice-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-950 hover:bg-slate-50 text-[10px] uppercase font-bold tracking-wider rounded transition cursor-pointer"
            >
              Cancel
            </button>
            
            {isInsufficient ? (
              <button
                id="topup-reminders-choice-btn"
                type="button"
                onClick={onOpenTopUp}
                className="px-5 py-2.5 bg-slate-950 hover:bg-black text-white text-[9.5px] uppercase tracking-widest font-black rounded transition cursor-pointer shadow-sm active:scale-98"
              >
                Top up wallet credits
              </button>
            ) : (
              <button
                id="confirm-reminders-choice-btn"
                type="button"
                onClick={handleConfirmChoice}
                className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-[9.5px] uppercase tracking-widest font-black rounded transition cursor-pointer shadow-sm active:scale-98"
              >
                Launch Automated Campaign
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
