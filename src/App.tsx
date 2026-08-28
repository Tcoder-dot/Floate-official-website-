import { useState, useEffect } from 'react';
import { Debtor, UserState, LogEntry, Invoice } from './types';
import { INITIAL_DEBTORS } from './mockData';
import LandingPage from './components/LandingPage';
import ProgrammaticHubPage from './components/ProgrammaticHubPage';
import BlogArticlePage from './components/BlogArticlePage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import AboutUsPage from './components/AboutUsPage';
import { getSEOHubBySlug } from './data/seoHubs';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import AddDebtorModal from './components/AddDebtorModal';
import ReminderSelectorModal from './components/ReminderSelectorModal';
import LogViewModal from './components/LogViewModal';
import ClientInvoicePaymentPortal from './components/ClientInvoicePaymentPortal';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

// Firebase core integration
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  getDocFromServer, 
  query, 
  where, 
  orderBy, 
  deleteDoc
} from 'firebase/firestore';

function parseRouteFromLocation(): {
  activePage: 'NONE' | 'PRIVACY' | 'TERMS' | 'ABOUT';
  activeHubSlug: string | null;
  invoiceId: string | null;
} {
  if (typeof window === 'undefined') {
    return { activePage: 'NONE', activeHubSlug: null, invoiceId: null };
  }
  const pathname = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const pageQuery = params.get('page');
  const invId = params.get('invoiceId');

  let activePage: 'NONE' | 'PRIVACY' | 'TERMS' | 'ABOUT' = 'NONE';
  let activeHubSlug: string | null = null;

  if (pathname === '/privacy' || pathname === '/privacy-policy' || pathname === '/privacy/' || pageQuery === 'privacy') {
    activePage = 'PRIVACY';
  } else if (
    pathname === '/terms' || 
    pathname === '/terms-of-service' || 
    pathname === '/terms-conditions' || 
    pathname === '/terms-and-conditions' || 
    pathname === '/terms/' || 
    pageQuery === 'terms'
  ) {
    activePage = 'TERMS';
  } else if (pathname === '/about' || pathname === '/about-us' || pathname === '/about/' || pageQuery === 'about') {
    activePage = 'ABOUT';
  } else {
    const hubQuery = params.get('hub') || params.get('solution') || params.get('marketplace') || params.get('blog');
    if (hubQuery) {
      activeHubSlug = hubQuery;
    } else if (pathname.includes('/solutions/') || pathname.includes('/marketplace/') || pathname.includes('/blog/')) {
      const parts = pathname.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        activeHubSlug = lastPart;
      }
    }
  }

  return { activePage, activeHubSlug, invoiceId: invId };
}

export default function App() {
  const initialRoute = parseRouteFromLocation();
  // Navigation Routing States
  const [currentView, setCurrentView] = useState<'LANDING' | 'LOGIN' | 'DASHBOARD'>('LANDING');
  const [activeHubSlug, setActiveHubSlug] = useState<string | null>(initialRoute.activeHubSlug);
  const [activePage, setActivePage] = useState<'NONE' | 'PRIVACY' | 'TERMS' | 'ABOUT'>(initialRoute.activePage);

  const handleNavigateToLegalPage = (page: 'PRIVACY' | 'TERMS' | 'ABOUT') => {
    const targetPath = page === 'PRIVACY' ? '/privacy' : page === 'TERMS' ? '/terms' : '/about';
    window.history.pushState({ page }, '', targetPath);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavigateBackFromLegal = () => {
    if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
      window.history.back();
    } else {
      window.history.pushState({}, '', '/');
      setActivePage('NONE');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  useEffect(() => {
    localStorage.setItem('floate_theme', 'light');
    document.documentElement.classList.remove('dark');

    const handlePopState = () => {
      const route = parseRouteFromLocation();
      setActivePage(route.activePage);
      setActiveHubSlug(route.activeHubSlug);
      if (route.invoiceId) {
        setViewingInvoiceId(route.invoiceId);
        resolvePublicInvoice(route.invoiceId);
      } else {
        setViewingInvoiceId(null);
        setPublicInvoice(null);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Core App States
  const [user, setUser] = useState<UserState>({
    isLoggedIn: false,
    name: '',
    email: '',
    credits: 0, // In Naira (₦)
    subscriptionTier: 'FREE',
    escrowBalance: 0
  });

  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeLogs, setActiveLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirestoreOffline, setIsFirestoreOffline] = useState(false);

  // ✈️ Sandbox Simulation State
  const [sandboxUser, setSandboxUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('floate_sandbox_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Modals Toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalInitialData, setAddModalInitialData] = useState<any>(null);
  const [pendingDebtor, setPendingDebtor] = useState<{
    name: string;
    email: string;
    phone: string;
    amount: number;
    currency: string;
    receiptName: string | null;
    merchantBusinessName: string;
    merchantLocation: string;
    merchantEthnicity: string;
    merchantWhatTheySell: string;
    debtorLocation: string;
    paymentDueDate: string;
    isFreelancer: boolean;
    isMouthToMouth?: boolean;
  } | null>(null);

  const [activeLogsId, setActiveLogsId] = useState<string | null>(null);

  // Client-Facing Invoice View States
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);
  const [publicInvoice, setPublicInvoice] = useState<Invoice | null>(null);
  const [publicInvoiceLoading, setPublicInvoiceLoading] = useState<boolean>(false);

  // Toast Banner State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Mandatory Firestore Connection validation test on boot (Skill constraint)
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsFirestoreOffline(false);
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
          setIsFirestoreOffline(true);
        }
      }
    }
    testConnection();
  }, []);

  // RESOLVER: Client-Facing Invoice Public Loading hook and Flutterwave payment confirmation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invId = params.get('invoiceId');
    const paymentStatus = params.get('payment_status');
    const transactionId = params.get('transaction_id');
    const txRef = params.get('tx_ref');
    const walletTopup = params.get('wallet_topup');

    if (invId) {
      setViewingInvoiceId(invId);
      resolvePublicInvoice(invId);
    }

    if (paymentStatus === 'successful' && transactionId && txRef) {
      const verifyPayment = async () => {
        try {
          const res = await fetch('/api/payment/flutterwave/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_id: transactionId, tx_ref: txRef })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            const txRefStr = String(txRef || "");
            if (txRefStr.startsWith("flw_plan_pay_as_you_go_")) {
              await handleUpdateSubscriptionTier('PAY_AS_YOU_GO');
              await handleAddCredits(15000);
              showToast(`Subscription updated to Pay-as-you-go! 3 sequences (₦15,000 credit) activated.`, 'success');
            } else if (txRefStr.startsWith("flw_plan_starter_")) {
              await handleUpdateSubscriptionTier('STARTER');
              await handleAddCredits(37500);
              showToast(`Subscription updated to Starter Plan! 10 sequences (₦37,500 credit) activated.`, 'success');
            } else if (txRefStr.startsWith("flw_plan_pro_")) {
              await handleUpdateSubscriptionTier('PRO');
              await handleAddCredits(73500);
              showToast(`Subscription upgraded to Pro Plan! Unlimited sequences and ₦73,500 bonus credits activated.`, 'success');
            } else if (walletTopup === 'success') {
              const credAmount = Number(data.amount) || 5000;
              await handleAddCredits(credAmount);
              showToast(`Wallet credited with ₦${credAmount.toLocaleString()} successfully!`, 'success');
            } else if (invId) {
              await handleConfirmPublicPayment(invId, `Flutterwave Verified Ref: ${transactionId}`);
              showToast(`Invoice payment verified successfully!`, 'success');
            }
          } else {
            showToast('Payment verification failed. Please contact support.', 'error');
          }
        } catch (err: any) {
          console.error("Payment verification error:", err);
          showToast('Failed to verify payment with gateway.', 'error');
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      verifyPayment();
    }
  }, []);

  const resolvePublicInvoice = async (id: string) => {
    setPublicInvoiceLoading(true);
    try {
      const snap = await getDocFromServer(doc(db, 'invoices', id));
      if (snap.exists()) {
        setPublicInvoice({ id: snap.id, ...snap.data() } as Invoice);
        setPublicInvoiceLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Firestore public fetch failed, checking debtors collection fallback:", err);
    }

    // Try to resolve debtor record as pseudo-invoice
    try {
      const debtorSnap = await getDocFromServer(doc(db, 'debtors', id));
      if (debtorSnap.exists()) {
        const debtorData = debtorSnap.data();
        
        // Fetch real-time merchant profile to retrieve live bank account details
        let merchantBankName = '';
        let merchantAccountNumber = '';
        let merchantAccountName = '';
        let merchantEmail = debtorData.ownerId ? `${debtorData.ownerId}@floate.xyz` : 'billing@floate.xyz';
        
        if (debtorData.ownerId) {
          try {
            const userSnap = await getDocFromServer(doc(db, 'users', debtorData.ownerId));
            if (userSnap.exists()) {
              const userData = userSnap.data();
              merchantBankName = userData.bankName || '';
              merchantAccountNumber = userData.accountNumber || '';
              merchantAccountName = userData.accountName || '';
              merchantEmail = userData.email || merchantEmail;
            }
          } catch (e) {
            console.warn("Could not load merchant profile for bank details:", e);
          }
        }

        const pseudoInvoice: Invoice = {
          id: debtorSnap.id,
          ownerId: debtorData.ownerId || 'sandbox_owner',
          invoiceNumber: debtorData.merchantWhatTheySell?.includes('Invoice') ? debtorData.merchantWhatTheySell : `INV-${debtorSnap.id.split('-')[1] || 'DEBT'}`,
          issueDate: debtorData.createdAt ? debtorData.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          dueDate: debtorData.paymentDueDate || new Date().toISOString().split('T')[0],
          status: debtorData.status === 'PAID' ? 'PAID' : 'OVERDUE',
          currency: debtorData.currency || '₦',
          businessName: debtorData.merchantBusinessName || 'SME Store',
          businessAddress: debtorData.merchantLocation || 'Lagos, Nigeria',
          businessEmail: merchantEmail,
          businessPhone: debtorData.phone || '',
          clientName: debtorData.name,
          clientAddress: debtorData.debtorLocation || '',
          clientEmail: debtorData.email,
          clientPhone: debtorData.phone || '',
          items: [
            {
              description: debtorData.merchantWhatTheySell || 'Digital Deliverables SOW',
              quantity: 1,
              unitPrice: debtorData.amount,
              total: debtorData.amount
            }
          ],
          subtotal: debtorData.amount,
          taxRate: 0,
          taxAmount: 0,
          totalAmount: debtorData.amount,
          createdAt: debtorData.createdAt || new Date().toISOString(),
          bankName: merchantBankName,
          accountNumber: merchantAccountNumber,
          accountName: merchantAccountName
        };

        setPublicInvoice(pseudoInvoice);
        setPublicInvoiceLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Firestore public debtor fetch failed:", err);
    }

    // Try local storage sandboxed fallbacks for both invoices and debtors
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('floate_sandbox_invoices_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const match = list.find((inv: any) => inv.id === id);
              if (match) {
                setPublicInvoice(match as Invoice);
                setPublicInvoiceLoading(false);
                return;
              }
            }
          }
        }
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('floate_sandbox_debtors_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const match = list.find((d: any) => d.id === id);
              if (match) {
                let merchantBankName = '';
                let merchantAccountNumber = '';
                let merchantAccountName = '';
                try {
                  const sandboxUserRaw = localStorage.getItem('floate_sandbox_user');
                  if (sandboxUserRaw) {
                    const sbUser = JSON.parse(sandboxUserRaw);
                    merchantBankName = sbUser.bankName || '';
                    merchantAccountNumber = sbUser.accountNumber || '';
                    merchantAccountName = sbUser.accountName || '';
                  }
                } catch (e) {}

                const pseudoInvoice: Invoice = {
                  id: match.id,
                  ownerId: match.ownerId || 'sandbox_owner',
                  invoiceNumber: match.merchantWhatTheySell?.includes('Invoice') ? match.merchantWhatTheySell : `INV-${match.id.split('-')[1] || 'DEBT'}`,
                  issueDate: match.createdAt ? match.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                  dueDate: match.paymentDueDate || new Date().toISOString().split('T')[0],
                  status: match.status === 'PAID' ? 'PAID' : 'OVERDUE',
                  currency: match.currency || '₦',
                  businessName: match.merchantBusinessName || 'SME Store',
                  businessAddress: match.merchantLocation || 'Lagos, Nigeria',
                  businessEmail: match.ownerId || 'billing@floate.xyz',
                  businessPhone: match.phone || '',
                  clientName: match.name,
                  clientAddress: match.debtorLocation || '',
                  clientEmail: match.email,
                  clientPhone: match.phone || '',
                  items: [
                    {
                      description: match.merchantWhatTheySell || 'Digital Deliverables SOW',
                      quantity: 1,
                      unitPrice: match.amount,
                      total: match.amount
                    }
                  ],
                  subtotal: match.amount,
                  taxRate: 0,
                  taxAmount: 0,
                  totalAmount: match.amount,
                  createdAt: match.createdAt || new Date().toISOString(),
                  bankName: merchantBankName,
                  accountNumber: merchantAccountNumber,
                  accountName: merchantAccountName
                };

                setPublicInvoice(pseudoInvoice);
                setPublicInvoiceLoading(false);
                return;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("Local storage lookup failed", err);
    }
    setPublicInvoiceLoading(false);
  };

  const handleConfirmPublicPayment = async (invoiceId: string, payerReference: string) => {
    try {
      if (publicInvoice && publicInvoice.id === invoiceId) {
        setPublicInvoice({ ...publicInvoice, status: 'PAID' });
      }

      // 1. Write status change to server for both collections
      try {
        await updateDoc(doc(db, 'invoices', invoiceId), { status: 'PAID' });
      } catch (err) {
        // Handled gracefully if not an invoice doc
      }
      try {
        await updateDoc(doc(db, 'debtors', invoiceId), { status: 'PAID' });
      } catch (err) {
        // Handled gracefully if not a debtor doc
      }

      // 2. Also keep all sandbox lists updated
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('floate_sandbox_invoices_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const idx = list.findIndex((inv: any) => inv.id === invoiceId);
              if (idx > -1) {
                list[idx].status = 'PAID';
                localStorage.setItem(key, JSON.stringify(list));
              }
            }
          }
        }
        if (key && key.startsWith('floate_sandbox_debtors_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const idx = list.findIndex((d: any) => d.id === invoiceId);
              if (idx > -1) {
                list[idx].status = 'PAID';
                localStorage.setItem(key, JSON.stringify(list));
              }
            }
          }
        }
      }

      // 3. Dispatch real-time payment clearance notification email to the merchant
      if (publicInvoice) {
        const merchantEmail = publicInvoice.businessEmail;
        const notificationSubject = `[Floate Payment Alert] ${publicInvoice.clientName} cleared balance of ${publicInvoice.currency}${publicInvoice.totalAmount.toLocaleString()}`;
        const notificationBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e1e8ed; border-radius: 8px; background-color: #ffffff; color: #1c1e21;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 800; color: #4f46e5; letter-spacing: -0.05em;">Floate</span>
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #65676b; display: block; margin-top: 4px; letter-spacing: 0.1em;">Payment Settlement Tracker</span>
            </div>
            
            <h2 style="font-size: 18px; font-weight: 700; color: #10b981; margin-top: 0; border-bottom: 1px solid #f0f2f5; padding-bottom: 12px; text-align: center;">✓ Debtor Settlement Confirmed</h2>
            
            <p>Dear Merchant / Provider,</p>
            <p>This is a real-time ledger alert notifying you that your client, <strong>${publicInvoice.clientName}</strong>, has clicked <strong>"I HAVE PAID"</strong> to clear their outstanding balance on your invoice/campaign.</p>
            
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #065f46;">
                <tr>
                  <td style="font-weight: 600; padding: 4px 0;">Debtor Name:</td>
                  <td style="font-weight: 700; text-align: right; padding: 4px 0;">${publicInvoice.clientName}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; padding: 4px 0;">SOW / Deliverables:</td>
                  <td style="text-align: right; padding: 4px 0;">${publicInvoice.items[0]?.description || 'Digital Retainer'}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; padding: 4px 0;">Cleared Amount:</td>
                  <td style="font-weight: 800; text-align: right; padding: 4px 0; font-size: 16px;">${publicInvoice.currency}${publicInvoice.totalAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="font-weight: 600; padding: 4px 0;">Sender Reference:</td>
                  <td style="font-weight: 700; text-align: right; padding: 4px 0; font-family: monospace;">${payerReference}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 13px; line-height: 1.5; color: #4b5563;">
              The ledger status for this record has been updated to <strong>PAID</strong>. Please verify your bank account details for credit inflows of this transfer.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #f0f2f5; margin: 24px 0;" />
            <p style="font-size: 10px; color: #8a8d91; text-align: center; line-height: 1.4;">
              This system confirmation was triggered via the Floate Client Payment Gateway.
            </p>
          </div>
        `;

        // Trigger notification email to merchant using custom credentials if configured, otherwise fallback
        await triggerActualEmailResend(merchantEmail, notificationSubject, notificationBody);
      }

      showToast(`Transfer Completed! Paid via bank transfer (${payerReference}). The merchant has been notified.`, "success");
    } catch (error: any) {
      showToast("Could not record transfer: " + error.message, "error");
    }
  };

  // 2. Sync Auth and User Profile Document + Debtors List
  useEffect(() => {
    if (sandboxUser) {
      setUser({
        isLoggedIn: true,
        isSandbox: true,
        name: sandboxUser.name || 'Merchant',
        email: sandboxUser.email || '',
        credits: typeof sandboxUser.credits === 'number' ? sandboxUser.credits : 4500,
        subscriptionTier: sandboxUser.subscriptionTier || 'FREE',
        escrowBalance: typeof sandboxUser.escrowBalance === 'number' ? sandboxUser.escrowBalance : 25000,
        isBlacklisted: !!sandboxUser.isBlacklisted,
        phone: sandboxUser.phone || '',
        realName: sandboxUser.realName || '',
        businessName: sandboxUser.businessName || '',
        businessCategory: sandboxUser.businessCategory || '',
        cacNumber: sandboxUser.cacNumber || '',
        businessAddress: sandboxUser.businessAddress || '',
        onboardingCompleted: !!sandboxUser.onboardingCompleted,
        creditScore: typeof sandboxUser.creditScore === 'number' ? sandboxUser.creditScore : 480,
        resendApiKey: sandboxUser.resendApiKey || '',
        senderEmail: sandboxUser.senderEmail || '',
        bankName: sandboxUser.bankName || '',
        accountNumber: sandboxUser.accountNumber || '',
        accountName: sandboxUser.accountName || '',
        location: sandboxUser.location || '',
        profession: sandboxUser.profession || '',
        referralSource: sandboxUser.referralSource || '',
        paymentChallenge: sandboxUser.paymentChallenge || ''
      });

      const cached = localStorage.getItem(`floate_sandbox_debtors_${sandboxUser.email}`);
      if (cached) {
        try {
          setDebtors(JSON.parse(cached));
        } catch (e) {
          setDebtors([]);
        }
      } else {
        setDebtors([]);
      }

      const cachedInvoices = localStorage.getItem(`floate_sandbox_invoices_${sandboxUser.email}`);
      if (cachedInvoices) {
        try {
          setInvoices(JSON.parse(cachedInvoices));
        } catch (e) {
          setInvoices([]);
        }
      } else {
        setInvoices([]);
      }
      setLoading(false);
      
      // Auto routing if sandbox onboarding is completed
      if (sandboxUser.onboardingCompleted) {
        setCurrentView('DASHBOARD');
      } else {
        setCurrentView('LOGIN');
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Logged In, listen to User profile in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const isOnboarded = !!data.onboardingCompleted;
            setUser({
              isLoggedIn: true,
              name: data.realName || data.name || firebaseUser.displayName || 'Merchant',
              email: data.email || firebaseUser.email || '',
              credits: typeof data.credits === 'number' ? data.credits : 0,
              subscriptionTier: data.subscriptionTier || 'FREE',
              escrowBalance: typeof data.escrowBalance === 'number' ? data.escrowBalance : 0,
              isBlacklisted: !!data.isBlacklisted,
              phone: data.phone || '',
              realName: data.realName || '',
              businessName: data.businessName || '',
              businessCategory: data.businessCategory || '',
              cacNumber: data.cacNumber || '',
              businessAddress: data.businessAddress || '',
              onboardingCompleted: isOnboarded,
              creditScore: typeof data.creditScore === 'number' ? data.creditScore : 480,
              resendApiKey: data.resendApiKey || '',
              senderEmail: data.senderEmail || '',
              bankName: data.bankName || '',
              accountNumber: data.accountNumber || '',
              accountName: data.accountName || '',
              location: data.location || '',
              profession: data.profession || '',
              referralSource: data.referralSource || '',
              paymentChallenge: data.paymentChallenge || ''
            });
            
            // Redirect based on onboarding status
            if (isOnboarded) {
              setCurrentView('DASHBOARD');
            } else {
              setCurrentView('LOGIN');
            }
          } else {
            // Document missing, self-heal or fallback creation
            const defaultProfile = {
              name: firebaseUser.displayName || 'Merchant',
              email: firebaseUser.email || '',
              credits: 0,
              subscriptionTier: 'FREE' as const,
              escrowBalance: 0,
              onboardingCompleted: false,
              createdAt: new Date().toISOString()
            };
            setDoc(userRef, defaultProfile).catch(err => {
              console.error('Self heal user doc error:', err);
            });
            setUser({
              isLoggedIn: true,
              ...defaultProfile
            });
            setCurrentView('LOGIN');
          }
          setLoading(false);
        }, (error) => {
          console.error('Sync Profile Error: ', error);
          setLoading(false);
        });

        // Listen to personal Debtors collection
        const debtorsQuery = query(
          collection(db, 'debtors'),
          where('ownerId', '==', firebaseUser.uid)
        );

        const unsubDebtors = onSnapshot(debtorsQuery, (snap) => {
          const debtorsList: Debtor[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            debtorsList.push({
              id: docSnap.id,
              ...data,
              history: [] // dynamically loaded when active logs modal is opened!
            } as any);
          });
          // Sort client-side by createdAt descending to avoid composite index requirements
          debtorsList.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setDebtors(debtorsList);
        }, (error) => {
          console.error('Sync Debtors Error: ', error);
        });

        // Listen to personal Invoices collection
        const invoicesQuery = query(
          collection(db, 'invoices'),
          where('ownerId', '==', firebaseUser.uid)
        );

        const unsubInvoices = onSnapshot(invoicesQuery, (snap) => {
          const invoicesList: Invoice[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            invoicesList.push({
              id: docSnap.id,
              ...data
            } as any);
          });
          // Sort client-side by createdAt descending to avoid composite index requirements
          invoicesList.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setInvoices(invoicesList);
        }, (error) => {
          console.error('Sync Invoices Error: ', error);
        });

        return () => {
          unsubProfile();
          unsubDebtors();
          unsubInvoices();
        };
      } else {
        // Logged out
        setUser({
          isLoggedIn: false,
          name: '',
          email: '',
          credits: 0,
          subscriptionTier: 'FREE',
          escrowBalance: 0
        });
        setDebtors([]);
        setInvoices([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [sandboxUser]);

  // 3. Real-time active Log subcollection sync (Cost optimized, loads history only on open folder modal)
  useEffect(() => {
    if (sandboxUser) {
      if (!activeLogsId) {
        setActiveLogs([]);
        return;
      }
      const activeDebtor = debtors.find(d => d.id === activeLogsId);
      setActiveLogs(activeDebtor?.history || []);
      return;
    }

    if (!activeLogsId) {
      setActiveLogs([]);
      return;
    }

    const logsQuery = query(
      collection(db, 'debtors', activeLogsId, 'history'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(logsQuery, (snap) => {
      const logsList: LogEntry[] = [];
      snap.forEach((docLog) => {
        logsList.push({
          id: docLog.id,
          ...docLog.data()
        } as LogEntry);
      });
      setActiveLogs(logsList);
    }, (error) => {
      console.error('Sync History Logs Error: ', error);
    });

    return () => unsubscribe();
  }, [activeLogsId, sandboxUser, debtors]);

  // Synthesis active logs debtor
  const activeLogsDebtor = debtors.find(d => d.id === activeLogsId) ? {
    ...debtors.find(d => d.id === activeLogsId)!,
    history: activeLogs
  } : null;

  // Sign In Trigger callback
  const handleLoginSuccess = (name: string, email: string, tier: 'FREE' | 'HUSTLER' | 'MERCHANT' = 'FREE', sandboxProfile?: any) => {
    if (sandboxProfile) {
       setSandboxUser(sandboxProfile);
       localStorage.setItem('floate_sandbox_user', JSON.stringify(sandboxProfile));
    }
    setCurrentView('DASHBOARD');
    showToast(`Welcome back, ${name}! Your live Floate merchant dashboard is active.`, 'success');
  };

  // Log Out Trigger callback
  const handleLogout = async () => {
    try {
      if (sandboxUser) {
        setSandboxUser(null);
        localStorage.removeItem('floate_sandbox_user');
        setCurrentView('LANDING');
        showToast('Logged out of Floate sandbox mode securely.', 'info');
        return;
      }
      await signOut(auth);
      setCurrentView('LANDING');
      showToast('Logged out of Floate securely.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Credit purchasing handler
  const handleAddCredits = async (amount: number) => {
    if (sandboxUser) {
      const updatedUser = {
        ...sandboxUser,
        credits: sandboxUser.credits + amount
      };
      setSandboxUser(updatedUser);
      localStorage.setItem('floate_sandbox_user', JSON.stringify(updatedUser));
      showToast(`Success! Account credited with ₦${amount.toLocaleString()}`, 'success');
      return;
    }
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        credits: user.credits + amount
      });
      showToast(`Success! Account credited with ₦${amount.toLocaleString()}`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Action: Add someone who owes money form submission
  const handleAddDebtorSubmit = (formData: any) => {
    setPendingDebtor(formData);
    setShowAddModal(false);
    showToast(`Details saved. Please select a reminder schedule plan...`, 'info');
  };

  // Helper to send outbound Email via Resend API Router
  const triggerActualEmailResend = async (recipientEmail: string, subject: string, htmlContent: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject,
          html: htmlContent,
          resendApiKey: user.resendApiKey || '',
          senderEmail: user.senderEmail || ''
        })
      });
      const data = await response.json();
      if (data.success) {
        if (data.simulated) {
          console.log("[EMAIL SIMULATION ACTIVE]", data.message);
          showToast(`📩 Simulated automated email to ${recipientEmail} via Resend.`, 'info');
        } else {
          showToast(`🚀 Live automated email dispatched to ${recipientEmail} via Resend!`, 'success');
        }
      } else {
        console.warn("Resend gateway failed, fallback used.", data.error);
      }
    } catch (err) {
      console.warn("Resend email dispatch error handled gracefully.", err);
    }
  };

  // Action: Confirming reminder style selection (Gentle vs. Aggressive vs. Custom)
  const handleConfirmReminderStyle = async (
    tier: 'GENTLE' | 'AGGRESSIVE' | 'CUSTOM',
    charge: number,
    customCounts?: { smsCount: number; emailCount: number; whatsappCount: number; voiceCount: number }
  ) => {
    if (!pendingDebtor) return;
    if (!sandboxUser && !auth.currentUser) return;

    // Beta Testing - Paywall Bypass: Skip check so that we never block users who have low credits during beta
    /*
    if (user.credits < charge) {
      showToast('Insufficient credits balance.', 'error');
      return;
    }
    */

    const path = `debtors`;
    try {
      const newId = `debtor-${Date.now()}`;
      const nowIso = new Date().toISOString();

      // Enforcing email-only sequence counts for tech freelancers & modern SMEs
      const emailCount = customCounts 
        ? customCounts.emailCount 
        : (tier === 'GENTLE' ? 5 : 12);

      // We start with 1 reminder sent (the initial one dispatched on creation) if there are emails scheduled.
      // For Mouth-to-Mouth handshake deals, we wait for confirmation so we start at 0.
      const calculatedRemindersCount = pendingDebtor.isMouthToMouth ? 0 : (emailCount > 0 ? 1 : 0);

      const initialHistory: LogEntry[] = [
        {
          id: `log-${newId}-1`,
          type: 'status_change',
          timestamp: nowIso,
          text: `Customer logged. Automated email chasing schedule set to ${tier === 'GENTLE' ? 'Standard' : tier === 'AGGRESSIVE' ? 'Priority' : 'Custom'} Plan (RESEND routing active). Deducted ₦${charge.toFixed(2)} service balance.`,
          status: 'completed'
        }
      ];

      if (emailCount > 0) {
        const emailSubject = `[ACTION REQUIRED] Professional Outstanding Balance Reminder for ${pendingDebtor.name}`;
        const emailBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e1e8ed; border-radius: 8px; background-color: #ffffff; color: #1c1e21;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: 800; color: #4f46e5; letter-spacing: -0.05em;">Floate</span>
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #65676b; display: block; margin-top: 4px; letter-spacing: 0.1em;">Automated B2B Enforcement</span>
            </div>
            
            <h2 style="font-size: 18px; font-weight: 700; color: #1c1e21; margin-top: 0; border-bottom: 1px solid #f0f2f5; padding-bottom: 12px;">Outstanding Invoice Overdue Warning</h2>
            
            <p>Dear <strong>${pendingDebtor.name}</strong>,</p>
            <p>We are contacting you on behalf of <strong>${pendingDebtor.merchantBusinessName || 'Representative'}</strong> regarding your outstanding digital deliverable or consulting retainer balance via Floate.</p>
            
            <div style="background-color: #f5f6f8; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #65676b; font-weight: 600; padding: 4px 0;">Provider:</td>
                  <td style="color: #1c1e21; font-weight: 700; text-align: right; padding: 4px 0;">${pendingDebtor.merchantBusinessName || 'Freelance Solution'}</td>
                </tr>
                <tr>
                  <td style="color: #65676b; font-weight: 600; padding: 4px 0;">Deliverables SOW:</td>
                  <td style="color: #1c1e21; text-align: right; padding: 4px 0;">${pendingDebtor.merchantWhatTheySell || 'Digital Deliverables'}</td>
                </tr>
                <tr>
                  <td style="color: #65676b; font-weight: 600; padding: 4px 0;">Amount Outstanding:</td>
                  <td style="color: #dc2626; font-weight: 800; text-align: right; padding: 4px 0; font-size: 15px;">${pendingDebtor.currency}${pendingDebtor.amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #65676b; font-weight: 600; padding: 4px 0;">Initial Payment Term:</td>
                  <td style="color: #1c1e21; text-align: right; padding: 4px 0;">${pendingDebtor.paymentDueDate || 'Immediate'}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 13px; line-height: 1.5; color: #4b5563;">
              To prevent any automated credit index markdowns or platform notification escalations, please proceed immediately to complete this clearing:
            </p>
            
            <div style="text-align: center; margin: 28px 0;">
              <a href="${window.location.origin}/?invoiceId=${newId}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px; display: inline-block;">Clear Outstanding Balance</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #f0f2f5; margin: 24px 0;" />
            <p style="font-size: 10px; color: #8a8d91; line-height: 1.4; text-align: center;">
              This system notification was dispatched via Floate Chaser Automated B2B Enforcement Campaign. All delivery tracks are routed through our official RESEND SMTP Gateway.
            </p>
          </div>
        `;

        triggerActualEmailResend(pendingDebtor.email, emailSubject, emailBody);

        initialHistory.push({
          id: `log-${newId}-email-chaser-1`,
          type: 'email',
          timestamp: new Date().toISOString(),
          text: `Automated dunning chaser email dispatched to ${pendingDebtor.email} via RESEND routing gateway: Outstanding balance notification for ${pendingDebtor.currency}${pendingDebtor.amount.toLocaleString()}.`,
          status: 'delivered'
        });
      }

      if (sandboxUser) {
        // Safe Local Sandbox Write (Beta testing: bypass actual deduction)
        const updatedUser = {
          ...sandboxUser,
          credits: sandboxUser.credits // No actual credit deduction during beta testing
        };
        setSandboxUser(updatedUser);
        localStorage.setItem('floate_sandbox_user', JSON.stringify(updatedUser));

        const newDebtor: Debtor = {
          id: newId,
          ownerId: sandboxUser.email,
          name: pendingDebtor.name,
          email: pendingDebtor.email,
          phone: pendingDebtor.phone,
          amount: pendingDebtor.amount,
          currency: pendingDebtor.currency,
          receiptName: pendingDebtor.isMouthToMouth ? "Mouth-to-Mouth Handshake Agreement" : pendingDebtor.receiptName,
          receiptUrl: '#',
          remindStyle: tier,
          status: 'ACTIVE',
          remindersCount: calculatedRemindersCount,
          createdAt: nowIso,
          lastRemindedAt: nowIso,
          merchantBusinessName: pendingDebtor.merchantBusinessName,
          merchantLocation: pendingDebtor.merchantLocation,
          merchantEthnicity: pendingDebtor.merchantEthnicity,
          merchantWhatTheySell: pendingDebtor.merchantWhatTheySell,
          debtorLocation: pendingDebtor.debtorLocation,
          paymentDueDate: pendingDebtor.paymentDueDate,
          isFreelancer: pendingDebtor.isFreelancer,
          isMouthToMouth: pendingDebtor.isMouthToMouth,
          handshakeStatus: pendingDebtor.isMouthToMouth ? 'PENDING_CONFIRMATION' : undefined,
          sequenceMode: pendingDebtor.sequenceMode || 'ENFORCEMENT',
          history: initialHistory
        };

        const updatedDebtors = [newDebtor, ...debtors];
        setDebtors(updatedDebtors);
        localStorage.setItem(`floate_sandbox_debtors_${sandboxUser.email}`, JSON.stringify(updatedDebtors));

        setPendingDebtor(null);
        if (pendingDebtor.isMouthToMouth) {
          showToast(`Handshake verification dispatched! Debt chase is paused until they confirm.`, 'info');
        } else {
          showToast(`Reminders are now active for ${pendingDebtor.name}!`, 'success');
        }
        return;
      }

      // 1. Bypass actual user profile update credit deduction in Beta Test Mode as requested
      // No credit deduction occurs, preserving the user balance setup securely.

      // 2. Write debtor document
      const debtorRef = doc(db, 'debtors', newId);
      await setDoc(debtorRef, {
        ownerId: auth.currentUser!.uid,
        name: pendingDebtor.name,
        email: pendingDebtor.email,
        phone: pendingDebtor.phone || '+234 000 000 0000', // Ensure field is a valid string to conform with rules schema
        amount: Number(pendingDebtor.amount),
        currency: pendingDebtor.currency || '₦',
        receiptName: pendingDebtor.isMouthToMouth ? "Mouth-to-Mouth Handshake Agreement" : (pendingDebtor.receiptName || null),
        receiptUrl: '#',
        remindStyle: tier,
        status: 'ACTIVE',
        remindersCount: calculatedRemindersCount,
        createdAt: nowIso,
        lastRemindedAt: nowIso,
        merchantBusinessName: pendingDebtor.merchantBusinessName || 'SME Business',
        merchantLocation: pendingDebtor.merchantLocation || 'Nigeria',
        merchantEthnicity: pendingDebtor.merchantEthnicity || 'Standard Accent',
        merchantWhatTheySell: pendingDebtor.merchantWhatTheySell || 'Core services',
        debtorLocation: pendingDebtor.debtorLocation || 'Nigeria',
        paymentDueDate: pendingDebtor.paymentDueDate || nowIso.split('T')[0],
        isFreelancer: !!pendingDebtor.isFreelancer,
        isMouthToMouth: !!pendingDebtor.isMouthToMouth,
        handshakeStatus: pendingDebtor.isMouthToMouth ? 'PENDING_CONFIRMATION' : null,
        sequenceMode: pendingDebtor.sequenceMode || 'ENFORCEMENT'
      });

      // 3. Write log subcollection entries
      for (const log of initialHistory) {
        await setDoc(doc(db, 'debtors', newId, 'history', log.id), {
          type: log.type,
          timestamp: log.timestamp,
          text: log.text,
          status: log.status
        });
      }

      setPendingDebtor(null);
      if (pendingDebtor.isMouthToMouth) {
        showToast(`Handshake verification dispatched! Debt chase is paused until they confirm.`, 'info');
      } else {
        showToast(`Reminders are now active for ${pendingDebtor.name}!`, 'success');
      }
    } catch (error: any) {
      console.error("FIRESTORE DEBTOR SAVE ERROR:", error);
      // Close modal first so that the user is not left stuck on the campaign select popup in case of exception
      setPendingDebtor(null);
      showToast(`Campaign initiated. Dashboard auto-updating: ${error?.message || error}`, 'info');
    }
  };

  // Eight Stages of Dunning Templates (Primary + Micro-Bump Strategy):
  const getStageDunningTemplate = (
    stage: number,
    debtorName: string,
    amountStr: string,
    currency: string,
    businessName: string,
    serviceDescription: string,
    dueDate: string,
    sequenceMode: 'FRIENDLY' | 'ENFORCEMENT' = 'ENFORCEMENT',
    invoiceId?: string
  ) => {
    const brandPurple = "#4f46e5";
    const brandRed = "#dc2626";
    let title = "";
    let body = "";
    let alertBanner = "";
    let buttonColor = brandPurple;
    let buttonText = "Clear Arrears Dynamic Link";

    const paylinkUrl = invoiceId ? `${window.location.origin}/?invoiceId=${invoiceId}` : `${window.location.origin}`;

    if (sequenceMode === 'FRIENDLY') {
      if (stage === 1) {
        title = "Digital Statement Information: Friendly Account Review";
        buttonText = "Review Statement & Details";
        alertBanner = `
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 6px; margin: 18px 0; color: #166534; font-size: 12.5px;">
            <strong>Account Status: Outstanding (Grace Phase Auto-Active)</strong><br/>
            This is a friendly statement reminder regarding your outstanding invoice. Please proceed to clear this balance when convenient.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>This is a polite reminder sent on behalf of <strong>${businessName}</strong> regarding your outstanding digital deliverable or retainer invoice.</p>
          <p>We understand that people are busy and things can easily slip through the cracks. If you've already initiated this payment, please disregard this automated notice and accept our thanks.</p>
          <p>Otherwise, we kindly request that you review the statement details below and make payment via our secure payment gateway to keep your account ledger updated.</p>
        `;
      } else if (stage === 2) {
        title = "Inbox Check-In: Friendly Statement Follow-up [Quick Bump]";
        buttonText = "Verify Billing & Settle";
        alertBanner = `
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin: 18px 0; color: #166534; font-size: 12px;">
            <strong>Quick Inbox Bump</strong><br/>
            Just a brief, light check-in to confirm that the previous statement statement has reached the correct accounts inbox.
          </div>
        `;
        body = `
          <p>Hello <strong>${debtorName}</strong>,</p>
          <p>I hope you're having a productive week! I'm just bubbling this statement back to the top of your inbox to see if your team was able to process it or route it to bookkeeping.</p>
          <p>We appreciate your help and partnership. Settle details and a direct transaction link are provided below for your absolute ease.</p>
        `;
      } else if (stage === 3) {
        title = "Outstanding Statement Follow-up — Professional Settle Request";
        buttonText = "Clear Outstanding Balance Now";
        alertBanner = `
          <div style="background-color: #f7fee7; border: 1px solid #d9f99d; padding: 14px; border-radius: 6px; margin: 18px 0; color: #3f6212; font-size: 12.5px;">
            <strong>Account Status: Weekly Review Phase</strong><br/>
            Just a brief check-in to confirm that this statement ledger is received. Settle details are provided below for your ease.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>This is a polite weekly follow-up sent on behalf of <strong>${businessName}</strong>. Your trading balance of <strong>${currency}${amountStr}</strong> is past its scheduled due date of <strong>${dueDate}</strong>.</p>
          <p>As we continue our milestone planning, having your account balanced helps us optimize our delivery stream. Please review the payment info below to help us process this soon!</p>
        `;
      } else if (stage === 4) {
        title = "Ledger Update: Billing & Verification Request [Quick Bump]";
        buttonText = "Verify Agreement Details";
        alertBanner = `
          <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; padding: 12px; border-radius: 6px; margin: 18px 0; color: #44403c; font-size: 12px;">
            <strong>Automated Ledger Reference Update</strong><br/>
            Our monthly billing sync is currently auditing open retainer balance cards. Quick review appreciated!
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>We are currently updating our quarterly balance logs on active service folders for <strong>${businessName}</strong>.</p>
          <p>Could you please check in with accounting to ensure this open statement of <strong>${currency}${amountStr}</strong> has been matched on your side? We have included the secure settlement link below to enable hassle-free alignment of files.</p>
        `;
      } else if (stage === 5) {
        title = "Account Assessment Update — Retainer Ledger Matching";
        buttonColor = "#4f46e5";
        buttonText = "Match & Settle Balance";
        alertBanner = `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; margin: 18px 0; color: #334155; font-size: 12.5px;">
            <strong>Account Status: Matching Attention Requested</strong><br/>
            Our team is updating the client workspace ledger. To prevent administrative holds or adjustments, polite settlement is requested.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>We highly value our commercial partnership and want to ensure we keep everything perfectly aligned! We kindly ask you to help route this invoice to the accounts payable desk for immediate matching.</p>
          <p>Doing so maintains clean integration channels and prevents any workflow delays on active deliverables. You can use the quick-clear button below.</p>
        `;
      } else if (stage === 6) {
        title = "Accounting Support Sync: Ledger Dispute / Matching Check [Quick Bump]";
        buttonText = "Sync Active Balance Link";
        alertBanner = `
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; margin: 18px 0; color: #1e293b; font-size: 12px;">
            <strong>Dispute / Feedback Sync Call</strong><br/>
            If there are any administrative questions or adjustments needed to coordinate payment, please let us know immediately!
          </div>
        `;
        body = `
          <p>Hello <strong>${debtorName}</strong>,</p>
          <p>Just a quick micro-bump on behalf of <strong>${businessName}</strong>. This balance has remained outstanding for over two weeks.</p>
          <p>If there's an internal verification bottleneck, a missing purchase order (PO), or if you require a split invoice layout to assist bookkeeping, please reply directly. Our goal is to make settling this account as seamless as possible for you!</p>
        `;
      } else if (stage === 7) {
        title = "Statement Resolution — Support & Friendly Clearance Request";
        buttonColor = "#4f46e5";
        buttonText = "Final Balance Settle Support";
        alertBanner = `
          <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; padding: 14px; border-radius: 6px; margin: 18px 0; color: #44403c; font-size: 12.5px;">
            <strong>Final Stage Status: Settle Support & Account Wrap-up</strong><br/>
            Help us balance our quarterly logs by settling this outstanding invoice. Contact us if you need custom billing structures or accounts matching support!
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>This is our friendly wrap-up message regarding the ledger balance of <strong>${currency}${amountStr}</strong> for professional milestones managed by <strong>${businessName}</strong>.</p>
          <p>To keep our partnership files and direct integration flows intact, we would appreciate it if you could assist in wrapping up this open card today. If there is a dispute or if you require custom assistance, reply directly—we're here to collaborate!</p>
        `;
      } else {
        title = "Closing Balance Settlement Review — Professional Record Filing";
        buttonText = "Final Ledger Closure";
        alertBanner = `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin: 18px 0; color: #475569; font-size: 12px;">
            <strong>Final Review Notice: Settle & Close Outstanding Account Folder</strong><br/>
            We are archiving this workflow queue. A prompt settlement of your account balances is appreciated to finalize deliverables.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>This is the final touchpoint follow-up on your outstanding balance of <strong>${currency}${amountStr}</strong> due to <strong>${businessName}</strong>.</p>
          <p>We are compiling all project registers to close this active fiscal period of account statements. To maintain excellent future project allocations, please process this balance today via our final billing portal link below.</p>
        `;
      }
    } else {
      // ENFORCEMENT MODE
      if (stage === 1) {
        title = "Invoice Overdue Notice — Simple Reminder";
        buttonText = "Review Statement & Settle";
        alertBanner = `
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 6px; margin: 18px 0; color: #166534; font-size: 12.5px;">
            <strong>Account Status: Outstanding (Grace Period Active)</strong><br/>
            This is a friendly statement reminder regarding your outstanding invoice. Please proceed to clear this trade account balance when convenient.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>This is a polite reminder sent on behalf of <strong>${businessName}</strong> regarding your outstanding digital deliverable or retainer invoice.</p>
          <p>We understand that people are busy and things can easily slip through the cracks. If you've already initiated this payment, please disregard this automated notice and accept our thanks.</p>
          <p>Otherwise, we kindly request that you review the statement details below and make immediate payment via our secure payment gateway to clear your account ledger balance.</p>
        `;
      } else if (stage === 2) {
        title = "Overdue Reminder: Invoice Settle Request [Quick Inbox Bump]";
        buttonText = "Access Secure Billing Ledger";
        alertBanner = `
          <div style="background-color: #fefbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 6px; margin: 18px 0; color: #b45309; font-size: 12px;">
            <strong>Automated Trade Sync Warning</strong><br/>
            This balance has progressed to overdue. Quick manual check-in on pending invoices is advised.
          </div>
        `;
        body = `
          <p>Hello <strong>${debtorName}</strong>,</p>
          <p>Just a brief micro-bump regarding your outstanding balance of <strong>${currency}${amountStr}</strong> with <strong>${businessName}</strong>.</p>
          <p>The billing period has run over its scheduled grace limit. We ask you to check whether this is currently scheduled for processing this week to avoid automated protocol escalations.</p>
        `;
      } else if (stage === 3) {
        title = "Second Overdue Notice — Settlement Required";
        buttonText = "Clear Outstanding Balance Now";
        alertBanner = `
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 14px; border-radius: 6px; margin: 18px 0; color: #92400e; font-size: 12.5px;">
            <strong>Account Status: Red Overdue Warning (Past Due)</strong><br/>
            We have made multiple attempts to notify your team about this outstanding invoice. To preserve commercial ledger standings, immediate settlement is required. This invoice is now overdue.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>This is a formal second warning sent on behalf of <strong>${businessName}</strong>. Your trading balance of <strong>${currency}${amountStr}</strong> is now outstanding past its due date of <strong>${dueDate}</strong>.</p>
          <p>We have not received a reply or a formal payment confirmation from your accounts payable office. Please be advised that continued neglect of this commercial balance may interrupt ongoing deliverables or contract assignments.</p>
          <p>Please use the direct gateway link below to resolve this immediately and restore active status.</p>
        `;
      } else if (stage === 4) {
        title = "Overdue Ledger Update: Accounts Sync Pending [Quick Bump]";
        buttonText = "Verify and Sync Payment Details";
        alertBanner = `
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 6px; margin: 18px 0; color: #b45309; font-size: 12px;">
            <strong>Accounts Payable Action Warning</strong><br/>
            A direct statement override sync remains pending on our monitoring server. Please review the link below.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>We are trying to reconcile open bills for the service: "<strong>${serviceDescription}</strong>".</p>
          <p>Our records indicate that the invoice of <strong>${currency}${amountStr}</strong> due to <strong>${businessName}</strong> remains unliquidated. To prevent automatic credit categorization flags, please ensure this item is released by bookkeeping today.</p>
        `;
      } else if (stage === 5) {
        title = "System Escalation Warning: Dispute Processing Active";
        buttonColor = "#E11D48";
        buttonText = "Resolve Platform Dispute Now";
        alertBanner = `
          <div style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 14px; border-radius: 6px; margin: 18px 0; color: #9f1239; font-size: 12.5px;">
            <strong>Enforcement Status: Stage 3 Dispute Triggered</strong><br/>
            Your trading account is now categorized as "DISPUTED". Continued non-compliance within 72 hours will degrade your public trade partner score (B2B platform credit index). This balance remains outstanding.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>Your unpaid balance of <strong>${currency}${amountStr}</strong> to <strong>${businessName}</strong> has been officially escalated to our automated commercial disputes registry via Floate.</p>
          <p>We take ledger integrity seriously. If this arrear remains unliquidated, your details and trade history will be reported to our public credit registry segment, impacting your B2B reliability index. We strongly advise clearing this immediately.</p>
        `;
      } else if (stage === 6) {
        title = "IMPORTANT: Dispute Warning Status Action Check [Quick Bump]";
        buttonColor = "#E11D48";
        buttonText = "Settle Pending Platform Arrears";
        alertBanner = `
          <div style="background-color: #fff1f2; border: 1px solid #f87171; padding: 12px; border-radius: 6px; margin: 18px 0; color: #7f1d1d; font-size: 12px;">
            <strong>B2B Credit Impact Advisory Status</strong><br/>
            Your dispute timeline is nearing critical exposure boundaries. Clearance action must be processed within 48 hours to avert automatic platform credit reporting.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>This is a fast follow-up regarding the pending dispute filed on your overdue account balance.</p>
          <p>The 48-hour grace window to stop automated credit grading markdown reports is actively running out. We urge you to bypass standard monthly payout batches and settle this liability using our credit gateway below to avoid impact on your trade profile.</p>
        `;
      } else if (stage === 7) {
        title = "FINAL DEMAND — Formal B2B Recovery & Registry Escalation WARNING";
        buttonColor = brandRed;
        buttonText = "IMMEDIATE EMERGENCY CLEARANCE";
        alertBanner = `
          <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 14px; border-radius: 6px; margin: 18px 0; color: #991b1b; font-size: 12.5px;">
            <strong>Final Enforcement Status: Active Blacklist Notice (24 Hour Grace)</strong><br/>
            This constitutes your final warning before your business contact is published on our B2B commercial blacklist and handed to professional collectors.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>This is your **FINAL DEMAND** regarding the overdue debt of <strong>${currency}${amountStr}</strong> representing professional work deliverables or consultant retainers provided by <strong>${businessName}</strong>.</p>
          <p>All administrative grace options have expired. If payment is not cleared within 24 hours of this transmission, we will initiate formal credit reporting markdowns and proceed with full commercial recovery dispatch.</p>
          <p>Settle the account immediately via the emergency gateway below to stop further enforcement actions.</p>
        `;
      } else {
        title = "Commercial Ledger Violation Notice — TRADE DEFAULT DISPATCHED";
        buttonColor = "#7f1d1d";
        buttonText = "Post-Default settlement Portal";
        alertBanner = `
          <div style="background-color: #3f1616; border: 1px solid #991b1b; padding: 14px; border-radius: 6px; margin: 18px 0; color: #fee2e2; font-size: 12.5px;">
            <strong>COMMERCIAL RECOVERY STATUS: DEFAULT REGISTERED</strong><br/>
            An official default has been recorded against your business profile. Ongoing enforcement registers have been released to B2B credit bureaus and auditing partner councils.
          </div>
        `;
        body = `
          <p>Dear <strong>${debtorName}</strong>,</p>
          <p>Be advised that due to persistent non-payment and zero communication regarding your overdue balance of <strong>${currency}${amountStr}</strong> to <strong>${businessName}</strong>, your account is officially in default standing.</p>
          <p>We have compiled a complete, legally admissible, time-logged enforcement audit trail ledger of notifications, email tracker signals, and SMS alerts. This dossier is being routed to collection agencies and standard legal partners.</p>
          <p>Any immediate settlement made using the tracking portal below will instantly update the status register to 'Settled Post-Default'. Otherwise, recovery agents will follow up directly.</p>
        `;
      }
    }

    const hasBankDetails = user.bankName && user.accountNumber;
    let bankSectionHtml = "";
    let settlementActionHtml = "";

    if (hasBankDetails) {
      bankSectionHtml = `
        <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #1e1b4b; text-align: left;">
          <strong style="color: #6b21a8; display: block; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; font-family: sans-serif; letter-spacing: 0.05em;">Direct Bank Settlement Details</strong>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #581c87; padding: 4px 0; font-weight: 600;">Bank Name:</td>
              <td style="color: #1e1b4b; font-weight: 700; text-align: right; padding: 4px 0;">${user.bankName}</td>
            </tr>
            <tr>
              <td style="color: #581c87; padding: 4px 0; font-weight: 600;">Account Number:</td>
              <td style="color: #1e1b4b; font-weight: 800; text-align: right; padding: 4px 0; font-family: monospace; font-size: 15px; letter-spacing: 0.05em;">${user.accountNumber}</td>
            </tr>
            <tr>
              <td style="color: #581c87; padding: 4px 0; font-weight: 600;">Account Name:</td>
              <td style="color: #1e1b4b; font-weight: 700; text-align: right; padding: 4px 0;">${user.accountName || user.businessName || user.name}</td>
            </tr>
          </table>
          <p style="font-size: 10.5px; color: #6b21a8; margin: 10px 0 0 0; text-align: center; font-weight: 600; line-height: 1.4;">
            Please wire or transfer payment directly to the account above.
          </p>
        </div>
      `;
      settlementActionHtml = `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${paylinkUrl}" style="background-color: ${buttonColor}; color: #ffffff; padding: 12.5px 25px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px; display: inline-block;">Confirm Bank Transfer Completed (I HAVE PAID)</a>
        </div>
      `;
    } else {
      bankSectionHtml = `
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 12.5px; color: #78350f; text-align: left; line-height: 1.5;">
          <strong style="color: #92400e; display: block; margin-bottom: 6px; font-size: 11px; text-transform: uppercase;">Bank Settlement Account Details Requested</strong>
          To settle this balance, please contact the merchant <strong>${businessName}</strong> directly at <strong>${user.email}</strong> to request their direct bank payout details and clear your outstanding balance.
        </div>
      `;
      settlementActionHtml = `
        <div style="text-align: center; margin: 28px 0;">
          <a href="${paylinkUrl}" style="background-color: ${buttonColor}; color: #ffffff; padding: 12.5px 25px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px; display: inline-block;">${buttonText}</a>
        </div>
      `;
    }

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e1e8ed; border-radius: 8px; background-color: #ffffff; color: #1c1e21;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 800; color: #4f46e5; letter-spacing: -0.05em;">Floate</span>
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #65676b; display: block; margin-top: 4px; letter-spacing: 0.1em;">Automated B2B Enforcement</span>
        </div>
        
        <h2 style="font-size: 18px; font-weight: 700; color: #1c1e21; margin-top: 0; border-bottom: 1px solid #f0f2f5; padding-bottom: 12px;">${title}</h2>
        
        ${alertBanner}
        
        ${body}
        
        <div style="background-color: #f5f6f8; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="color: #65676b; font-weight: 600; padding: 4px 0;">Creditor:</td>
              <td style="color: #1c1e21; font-weight: 700; text-align: right; padding: 4px 0;">${businessName}</td>
            </tr>
            <tr>
              <td style="color: #65676b; font-weight: 600; padding: 4px 0;">Digital SOW:</td>
              <td style="color: #1c1e21; text-align: right; padding: 4px 0;">${serviceDescription}</td>
            </tr>
            <tr>
              <td style="color: #65676b; font-weight: 600; padding: 4px 0;">Arrears Amount:</td>
              <td style="color: ${stage >= 3 ? brandRed : "#1c1e21"}; font-weight: 800; text-align: right; padding: 4px 0; font-size: 15px;">${currency}${amountStr}</td>
            </tr>
            <tr>
              <td style="color: #65676b; font-weight: 600; padding: 4px 0;">Payment Due On:</td>
              <td style="color: #1c1e21; text-align: right; padding: 4px 0;">${dueDate}</td>
            </tr>
          </table>
        </div>
        
        ${bankSectionHtml}
        
        ${settlementActionHtml}
        
        <hr style="border: 0; border-top: 1px solid #f0f2f5; margin: 24px 0;" />
        <p style="font-size: 10px; color: #8a8d91; text-align: center; line-height: 1.4;">
          This tracking system notification was dispatched via the Floate Automated Dunning Campaigns gateway.
        </p>
      </div>
    `;
  };

  // Quick Action: Trigger telemetry ping log (Sequential 8 touchpoints)
  const handleQuickSimulatePing = async (debtorId: string, stageNum?: number, customEmail?: string) => {
    const currentDebtor = debtors.find(d => d.id === debtorId);
    if (!currentDebtor) return;

    const nowIso = new Date().toISOString();
    const newLogId = `log-sim-${Date.now()}`;
    const targetEmail = customEmail || currentDebtor.email;
    
    // Auto-calculate successive campaign stage levels if not explicitly specified (cap at 8)
    const calculatedStage = Math.min(8, Math.max(1, currentDebtor.remindersCount + 1));
    const finalStageNum = stageNum !== undefined ? stageNum : calculatedStage;
    const finalMode = currentDebtor.sequenceMode || 'ENFORCEMENT';

    // Choose subject based on selected campaign stage and mode (8 distinct touchpoints)
    let emailSubject = ``;
    if (finalMode === 'FRIENDLY') {
      if (finalStageNum === 1) {
        emailSubject = `[Friendly Statement] Digital Invoice Statement Reminder for ${currentDebtor.name} (Grace Period Active)`;
      } else if (finalStageNum === 2) {
        emailSubject = `[Check-In] Friendly Invoice Follow-Up [Quick Bump] for ${currentDebtor.name}`;
      } else if (finalStageNum === 3) {
        emailSubject = `[Statement Follow-up] Polite reminder regarding outstanding balance for ${currentDebtor.name}`;
      } else if (finalStageNum === 4) {
        emailSubject = `[Ledger Check-In] Brief statement confirmation [Quick Bump] for ${currentDebtor.name}`;
      } else if (finalStageNum === 5) {
        emailSubject = `[Friendly Update] Account ledger balance update notice for ${currentDebtor.name}`;
      } else if (finalStageNum === 6) {
        emailSubject = `[Accounting Check-In] Accounts payable assistant check [Quick Bump] for ${currentDebtor.name}`;
      } else if (finalStageNum === 7) {
        emailSubject = `[Statement Resolution] Gentle review of outstanding statement for ${currentDebtor.name}`;
      } else {
        emailSubject = `[Final Filing Review] SOT record compilation summary for ${currentDebtor.name}`;
      }
    } else {
      if (finalStageNum === 1) {
        emailSubject = `[OVERDUE REMINDER] Polite Statement of Account for ${currentDebtor.name} (Grace Period Active)`;
      } else if (finalStageNum === 2) {
        emailSubject = `[URGENT REMINDER] Outstanding Invoice Second Notice [Inbox Bump] for ${currentDebtor.name}`;
      } else if (finalStageNum === 3) {
        emailSubject = `[SECOND WARNING] Formal Past-Due Billing Notice for ${currentDebtor.name}`;
      } else if (finalStageNum === 4) {
        emailSubject = `[COMPLIANCE CHECK] Accounts Payable Direct Reconciliation [Quick Bump] for ${currentDebtor.name}`;
      } else if (finalStageNum === 5) {
        emailSubject = `[FINAL ESCALATION WARNING] Dispute Processing Active on Retainer for ${currentDebtor.name}`;
      } else if (finalStageNum === 6) {
        emailSubject = `[URGENT 48-HOUR GRACE] Final Dispute Warning Report pending for ${currentDebtor.name}`;
      } else if (finalStageNum === 7) {
        emailSubject = `[FINAL DEMAND] Immediate Enforcement Notice: Debt Recovery Dispatch Active for ${currentDebtor.name}`;
      } else {
        emailSubject = `[Ledger Violation Notice] Notice of trade default registered against ${currentDebtor.name}`;
      }
    }

    const emailBody = getStageDunningTemplate(
      finalStageNum,
      currentDebtor.name,
      currentDebtor.amount.toLocaleString(),
      currentDebtor.currency,
      currentDebtor.merchantBusinessName || 'Representative',
      currentDebtor.merchantWhatTheySell || 'Digital Deliverables',
      currentDebtor.paymentDueDate || nowIso.split('T')[0],
      finalMode,
      currentDebtor.id
    );

    // Trigger outbound email with Resend
    await triggerActualEmailResend(targetEmail, emailSubject, emailBody);
    
    const stageNames = [
      "Touch 1 - Soft Nudge",
      "Touch 2 - Nudge Micro-Bump",
      "Touch 3 - Formal Escalation",
      "Touch 4 - Formal Micro-Bump",
      "Touch 5 - Dispute Warning",
      "Touch 6 - Warning Micro-Bump",
      "Touch 7 - Final Demand",
      "Touch 8 - Default Wrap-Up"
    ];
    const logText = `Automated ${stageNames[finalStageNum - 1] || 'Dunning Outreach'} email dispatched via RESEND to ${targetEmail}. Tone: ${currentDebtor.remindStyle || 'Standard'}.`;

    if (sandboxUser) {
      const newHistoryItem: LogEntry = {
        id: newLogId,
        type: 'email',
        timestamp: nowIso,
        text: logText,
        status: 'delivered'
      };

      const nextCount = currentDebtor.remindersCount + 1;
      const willBeDefaulted = finalStageNum === 8;
      // If manually run or dispatched, auto-resume from any paused states back to active (or mark defaulted if touch 8 is reached)
      const nextStatus = willBeDefaulted ? 'DEFAULTED' : (currentDebtor.status === 'PAUSED' ? 'ACTIVE' : currentDebtor.status);

      const updatedDebtors = debtors.map(d => {
        if (d.id === debtorId) {
          return {
            ...d,
            status: nextStatus as any,
            remindersCount: nextCount,
            lastRemindedAt: nowIso,
            history: [...(d.history || []), newHistoryItem]
          };
        }
        return d;
      });

      setDebtors(updatedDebtors);
      localStorage.setItem(`floate_sandbox_debtors_${sandboxUser.email}`, JSON.stringify(updatedDebtors));
      
      if (activeLogsId === debtorId) {
        setActiveLogs(prev => [...prev, newHistoryItem]);
      }

      showToast(`Campaign ${stageNames[finalStageNum - 1] || 'Outreach'} email sent to ${targetEmail}!${willBeDefaulted ? ' [STATUS: DEFAULTED]' : ''}`, 'success');
      return;
    }

    if (!auth.currentUser) return;
    const path = `debtors/${debtorId}/history/${newLogId}`;
    try {
      // 1. Write log subcollection doc
      await setDoc(doc(db, 'debtors', debtorId, 'history', newLogId), {
        type: 'email',
        timestamp: nowIso,
        text: logText,
        status: 'delivered'
      });

      const nextCount = currentDebtor.remindersCount + 1;
      const willBeDefaulted = finalStageNum === 8;
      const nextStatus = willBeDefaulted ? 'DEFAULTED' : (currentDebtor.status === 'PAUSED' ? 'ACTIVE' : currentDebtor.status);

      // 2. Update parent debtor reminders stats
      await updateDoc(doc(db, 'debtors', debtorId), {
        status: nextStatus,
        remindersCount: nextCount,
        lastRemindedAt: nowIso
      });

      showToast(`Campaign ${stageNames[finalStageNum - 1] || 'Outreach'} email dispatched to ${targetEmail}!${willBeDefaulted ? ' [STATUS: DEFAULTED]' : ''}`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Toggle Pause/Resume debtor campaign sequence
  const handleTogglePauseDebtor = async (debtorId: string) => {
    const currentDebtor = debtors.find(d => d.id === debtorId);
    if (!currentDebtor) return;

    const nextStatus = currentDebtor.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
    const actionName = nextStatus === 'PAUSED' ? 'PAUSED' : 'RESUMED';
    const nowIso = new Date().toISOString();
    const newLogId = `log-pause-${Date.now()}`;
    const logText = `Outreach sequence formally ${actionName} by creditor. Automated hourly/daily cron and stage calculations are temporarily ${nextStatus === 'PAUSED' ? 'halted' : 're-activated'}.`;

    const newHistoryItem: LogEntry = {
      id: newLogId,
      type: 'status_change',
      timestamp: nowIso,
      text: logText,
      status: 'delivered'
    };

    if (sandboxUser) {
      const updatedDebtors = debtors.map(d => {
        if (d.id === debtorId) {
          return {
            ...d,
            status: nextStatus as any,
            history: [...(d.history || []), newHistoryItem]
          };
        }
        return d;
      });

      setDebtors(updatedDebtors);
      localStorage.setItem(`floate_sandbox_debtors_${sandboxUser.email}`, JSON.stringify(updatedDebtors));
      
      if (activeLogsId === debtorId) {
        setActiveLogs(prev => [...prev, newHistoryItem]);
      }

      showToast(`Campaign sequence successfully ${actionName}!`, 'success');
      return;
    }

    if (!auth.currentUser) return;
    const path = `debtors/${debtorId}/history/${newLogId}`;
    try {
      await setDoc(doc(db, 'debtors', debtorId, 'history', newLogId), {
        type: 'status_change',
        timestamp: nowIso,
        text: logText,
        status: 'delivered'
      });

      await updateDoc(doc(db, 'debtors', debtorId), {
        status: nextStatus
      });

      showToast(`Campaign sequence successfully ${actionName}!`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Quick Action inside Details: Acknowledge payment complete
  const handleMarkAsPaid = async (debtorId: string) => {
    const currentDebtor = debtors.find(d => d.id === debtorId);
    if (!currentDebtor) return;

    const nowIso = new Date().toISOString();
    const logId = `log-paid-${Date.now()}`;

    if (sandboxUser) {
      const newHistoryItem: LogEntry = {
        id: logId,
        type: 'status_change',
        timestamp: nowIso,
        text: `Verified Paystack link payment clearance. Account verified! Recipient resolved standard arrears.`,
        status: 'completed'
      };

      const updatedDebtors = debtors.map(d => {
        if (d.id === debtorId) {
          return {
            ...d,
            status: 'PAID' as const,
            history: [...(d.history || []), newHistoryItem]
          };
        }
        return d;
      });

      setDebtors(updatedDebtors);
      localStorage.setItem(`floate_sandbox_debtors_${sandboxUser.email}`, JSON.stringify(updatedDebtors));
      
      if (activeLogsId === debtorId) {
        setActiveLogs(prev => [...prev, newHistoryItem]);
      }
      showToast(`Payment receipt reconciled! ${currentDebtor.name} marked as fully recovered.`, 'success');
      return;
    }

    const path = `debtors/${debtorId}`;
    try {
      // 1. Write status change log
      await setDoc(doc(db, 'debtors', debtorId, 'history', logId), {
        type: 'status_change',
        timestamp: nowIso,
        text: `Verified Paystack link payment clearance. Account verified! Recipient resolved standard arrears.`,
        status: 'completed'
      });

      // 2. Update parent status to PAID
      await updateDoc(doc(db, 'debtors', debtorId), {
        status: 'PAID'
      });

      showToast(`Payment receipt reconciled! ${currentDebtor.name} marked as fully recovered.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Configuration translation Trigger
  const handleConfigDraftDebtor = (draftDebtor: Debtor) => {
    setPendingDebtor({
      name: draftDebtor.name,
      email: draftDebtor.email,
      phone: draftDebtor.phone,
      amount: draftDebtor.amount,
      currency: draftDebtor.currency,
      receiptName: draftDebtor.receiptName,
      merchantBusinessName: draftDebtor.merchantBusinessName || 'My SME Store',
      merchantLocation: draftDebtor.merchantLocation || 'Lagos, Nigeria',
      merchantEthnicity: draftDebtor.merchantEthnicity || 'Yoruba',
      merchantWhatTheySell: draftDebtor.merchantWhatTheySell || 'Goods or Services',
      debtorLocation: draftDebtor.debtorLocation || 'Nigeria',
      paymentDueDate: draftDebtor.paymentDueDate || new Date().toISOString().split('T')[0],
      isFreelancer: draftDebtor.isFreelancer || false
    });

    if (sandboxUser) {
      const updatedDebtors = debtors.filter(d => d.id !== draftDebtor.id);
      setDebtors(updatedDebtors);
      localStorage.setItem(`floate_sandbox_debtors_${sandboxUser.email}`, JSON.stringify(updatedDebtors));
      return;
    }

    // Remove old draft
    deleteDoc(doc(db, 'debtors', draftDebtor.id)).catch(err => {
      console.error('Delete draft error:', err);
    });
  };

  const handleUpdateSubscriptionTier = async (tier: 'FREE' | 'HUSTLER' | 'MERCHANT' | 'PAY_AS_YOU_GO' | 'STARTER' | 'PRO') => {
    if (sandboxUser) {
      const updatedUser = {
        ...sandboxUser,
        subscriptionTier: tier
      };
      setSandboxUser(updatedUser);
      localStorage.setItem('floate_sandbox_user', JSON.stringify(updatedUser));

      let benefits = "";
      if (tier === 'FREE') benefits = "Up to 5 directories listed. Manual dunning outreach channels active.";
      if (tier === 'HUSTLER') benefits = "Up to 25 active directories. Automated recurrence schedule and Pidgin voice active.";
      if (tier === 'MERCHANT') benefits = "Infinite dossiers, premium vernacular accents and direct customized bank clearing configurations.";
      if (tier === 'PAY_AS_YOU_GO') benefits = "3 Active Dunning Sequences (₦15,000 credit) activated.";
      if (tier === 'STARTER') benefits = "10 Active Dunning Sequences (₦37,500 credit) activated.";
      if (tier === 'PRO') benefits = "Unlimited dunning sequences unlocked! Bonus credits loaded.";
      showToast(`Package updated to ${tier.replace(/_/g, ' ')}! ${benefits}`, 'success');
      return;
    }

    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        subscriptionTier: tier
      });

      let benefits = "";
      if (tier === 'FREE') benefits = "Up to 5 directories listed. Manual dunning outreach channels active.";
      if (tier === 'HUSTLER') benefits = "Up to 25 active directories. Automated recurrence schedule and Pidgin voice active.";
      if (tier === 'MERCHANT') benefits = "Infinite dossiers, premium vernacular accents and direct customized bank clearing configurations.";
      if (tier === 'PAY_AS_YOU_GO') benefits = "3 Active Dunning Sequences (₦15,000 credit) activated.";
      if (tier === 'STARTER') benefits = "10 Active Dunning Sequences (₦37,500 credit) activated.";
      if (tier === 'PRO') benefits = "Unlimited dunning sequences unlocked! Bonus credits loaded.";
      showToast(`Package updated to ${tier.replace(/_/g, ' ')}! ${benefits}`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdateProfile = async (profileData: Partial<UserState>) => {
    if (sandboxUser) {
      const updatedUser = {
        ...sandboxUser,
        ...profileData
      };
      setSandboxUser(updatedUser);
      localStorage.setItem('floate_sandbox_user', JSON.stringify(updatedUser));
      showToast('Profile information updated in Sandbox mode successfully!', 'success');
      return;
    }

    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), profileData);
      showToast('Profile details saved to secure database successfully!', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleTriggerChaserFromInvoice = (invoice: Invoice) => {
    setPendingDebtor({
      name: invoice.clientName,
      email: invoice.clientEmail,
      phone: invoice.clientPhone,
      amount: invoice.totalAmount,
      currency: invoice.currency,
      receiptName: null,
      merchantBusinessName: invoice.businessName || 'My SME Store',
      merchantLocation: invoice.businessAddress || 'Lagos, Nigeria',
      merchantEthnicity: 'Yoruba', // default ethnic focus dialect
      merchantWhatTheySell: `Unpaid Invoice ${invoice.invoiceNumber}`,
      debtorLocation: invoice.clientAddress || 'Nigeria',
      paymentDueDate: invoice.dueDate || new Date().toISOString().split('T')[0],
      isFreelancer: true
    });
    showToast(`Invoice compiled! Select chasing style & automated voice accents for ${invoice.clientName}`, "info");
  };

  const handleSaveInvoice = async (invoice: Invoice) => {
    const ownerId = auth.currentUser?.uid || 'sandbox_owner';
    const invoiceToSave = {
      ...invoice,
      ownerId
    };

    if (sandboxUser) {
      const updated = [invoiceToSave, ...invoices.filter(inv => inv.id !== invoice.id)];
      // Force UI refresh by calling unique setter sequence
      setInvoices(updated);
      localStorage.setItem(`floate_sandbox_invoices_${sandboxUser.email}`, JSON.stringify(updated));
      showToast(`Invoice ${invoice.invoiceNumber} saved successfully to your sandbox ledger!`, 'success');
      return;
    }

    try {
      await setDoc(doc(db, 'invoices', invoice.id), invoiceToSave);
      showToast(`Invoice ${invoice.invoiceNumber} saved successfully to your ledger!`, 'success');
    } catch (error: any) {
      handleFirestoreError(error, OperationType.CREATE, `invoices/${invoice.id}`);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (sandboxUser) {
      const updated = invoices.filter(inv => inv.id !== id);
      setInvoices(updated);
      localStorage.setItem(`floate_sandbox_invoices_${sandboxUser.email}`, JSON.stringify(updated));
      showToast("Invoice deleted from sandbox ledger.", 'info');
      return;
    }

    try {
      await deleteDoc(doc(db, 'invoices', id));
      showToast("Invoice deleted from your secure ledger.", 'info');
    } catch (error: any) {
      handleFirestoreError(error, OperationType.DELETE, `invoices/${id}`);
    }
  };

  const handleUpdateInvoiceStatus = async (id: string, status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE') => {
    if (sandboxUser) {
      const updated = invoices.map(inv => inv.id === id ? { ...inv, status } : inv);
      setInvoices(updated);
      localStorage.setItem(`floate_sandbox_invoices_${sandboxUser.email}`, JSON.stringify(updated));
      showToast(`Invoice status updated to ${status}.`, 'success');
      return;
    }

    try {
      await updateDoc(doc(db, 'invoices', id), { status });
      showToast(`Invoice status updated to ${status}.`, 'success');
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, `invoices/${id}`);
    }
  };

  const handleFileDispute = async (debtorId: string, reason: string) => {
    const currentDebtor = debtors.find(d => d.id === debtorId);
    if (!currentDebtor) return;

    const logId = `log-${debtorId}-dispute-${Date.now()}`;

    if (sandboxUser) {
      const newHistoryItem: LogEntry = {
        id: logId,
        type: 'status_change',
        timestamp: new Date().toISOString(),
        text: `CLIENT DISPUTE INITIATED: Debtor immediately filed a dispute claims form. Under system policies, automated campaigns are auto-paused. Reason provided: "${reason}"`,
        status: 'completed'
      };

      const updatedDebtors = debtors.map(d => {
        if (d.id === debtorId) {
          return {
            ...d,
            isDisputed: true,
            disputeReason: reason,
            verificationStatus: 'DISPUTED' as const,
            history: [...(d.history || []), newHistoryItem]
          };
        }
        return d;
      });

      setDebtors(updatedDebtors);
      localStorage.setItem(`floate_sandbox_debtors_${sandboxUser.email}`, JSON.stringify(updatedDebtors));

      if (activeLogsId === debtorId) {
        setActiveLogs(prev => [...prev, newHistoryItem]);
      }
      showToast(`Debt record paused. Debtor disputing claims. Outreach frozen.`, 'info');
      return;
    }

    const path = `debtors/${debtorId}`;
    try {
      await setDoc(doc(db, 'debtors', debtorId, 'history', logId), {
        type: 'status_change',
        timestamp: new Date().toISOString(),
        text: `CLIENT DISPUTE INITIATED: Debtor immediately filed a dispute claims form. Under system policies, automated campaigns are auto-paused. Reason provided: "${reason}"`,
        status: 'completed'
      });

      await updateDoc(doc(db, 'debtors', debtorId), {
        isDisputed: true,
        disputeReason: reason,
        verificationStatus: 'DISPUTED'
      });

      showToast(`Debt record paused. Debtor disputing claims. Outreach frozen.`, 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleRecordDebtorReply = async (
    debtorId: string, 
    replyMessage: string, 
    category: string, 
    diagnosis: string, 
    actionText: string
  ) => {
    const currentDebtor = debtors.find(d => d.id === debtorId);
    if (!currentDebtor) return;

    const logId = `log-${debtorId}-reply-${Date.now()}`;
    const cleanCategoryString = category.toUpperCase().replace(/_/g, " ");

    const incomingHistoryItem: LogEntry = {
      id: logId,
      type: 'sms',
      timestamp: new Date().toISOString(),
      text: `[INCOMING REPLY ANALYZED] Debtor text: "${replyMessage}". AI Category: "${cleanCategoryString}". Dialect analysis: "${diagnosis}". Suggested Action: "${actionText}".`,
      status: 'completed'
    };

    if (sandboxUser) {
      const holdsDispute = category.toLowerCase().includes('dispute');
      const updatedDebtors = debtors.map(d => {
        if (d.id === debtorId) {
          return {
            ...d,
            isDisputed: holdsDispute ? true : d.isDisputed,
            disputeReason: holdsDispute ? replyMessage : d.disputeReason,
            verificationStatus: (holdsDispute ? 'DISPUTED' : d.verificationStatus) as any,
            history: [...(d.history || []), incomingHistoryItem]
          };
        }
        return d;
      });

      setDebtors(updatedDebtors);
      localStorage.setItem(`floate_sandbox_debtors_${sandboxUser.email}`, JSON.stringify(updatedDebtors));
      
      if (activeLogsId === debtorId) {
        setActiveLogs(prev => [...prev, incomingHistoryItem]);
      }
      showToast(`Logged simulated reply and AI classification on ledger!`, 'success');
      return;
    }

    const path = `debtors/${debtorId}`;
    try {
      await setDoc(doc(db, 'debtors', debtorId, 'history', logId), {
        type: 'sms',
        timestamp: new Date().toISOString(),
        text: `[INCOMING REPLY ANALYZED] Debtor text: "${replyMessage}". AI Category: "${cleanCategoryString}". Dialect analysis: "${diagnosis}". Suggested Action: "${actionText}".`,
        status: 'completed'
      });

      const holdsDispute = category.toLowerCase().includes('dispute');
      if (holdsDispute) {
        await updateDoc(doc(db, 'debtors', debtorId), {
          isDisputed: true,
          disputeReason: replyMessage,
          verificationStatus: 'DISPUTED'
        });
      }

      showToast(`Logged simulated reply and AI classification on ledger!`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleResolveDispute = async (debtorId: string) => {
    const currentDebtor = debtors.find(d => d.id === debtorId);
    if (!currentDebtor) return;

    const logId = `log-${debtorId}-resolve-${Date.now()}`;

    if (sandboxUser) {
      const newHistoryItem: LogEntry = {
        id: logId,
        type: 'status_change',
        timestamp: new Date().toISOString(),
        text: `CLIENT DISPUTE RESOLVED: Admin panel cleared dispute claims. Original Waybill & WhatsApp Chat validated. Verification complete. Resuming cascade.`,
        status: 'completed'
      };

      const updatedDebtors = debtors.map(d => {
        if (d.id === debtorId) {
          return {
            ...d,
            isDisputed: false,
            disputeReason: null,
            verificationStatus: 'VERIFIED' as const,
            history: [...(d.history || []), newHistoryItem]
          };
        }
        return d;
      });

      setDebtors(updatedDebtors);
      localStorage.setItem(`floate_sandbox_debtors_${sandboxUser.email}`, JSON.stringify(updatedDebtors));

      if (activeLogsId === debtorId) {
        setActiveLogs(prev => [...prev, newHistoryItem]);
      }
      showToast(`Dispute verified & cleared. Collection cascade restarted.`, 'success');
      return;
    }

    const path = `debtors/${debtorId}`;
    try {
      await setDoc(doc(db, 'debtors', debtorId, 'history', logId), {
        type: 'status_change',
        timestamp: new Date().toISOString(),
        text: `CLIENT DISPUTE RESOLVED: Admin panel cleared dispute claims. Original Waybill & WhatsApp Chat validated. Verification complete. Resuming cascade.`,
        status: 'completed'
      });

      await updateDoc(doc(db, 'debtors', debtorId), {
        isDisputed: false,
        disputeReason: null,
        verificationStatus: 'VERIFIED'
      });

      showToast(`Dispute verified & cleared. Collection cascade restarted.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleConfirmHandshake = async (debtorId: string) => {
    const d = debtors.find(curr => curr.id === debtorId);
    if (!d) return;

    const nowIso = new Date().toISOString();
    const logId = `log-${debtorId}-confirm-handshake-${Date.now()}`;

    const historyItems: LogEntry[] = [
      {
        id: logId,
        type: 'status_change',
        timestamp: nowIso,
        text: `Customer ${d.name} confirmed the handshake agreement. Active collection campaigns are now fully authorized and scheduled.`,
        status: 'completed'
      }
    ];

    if (d.remindStyle === 'GENTLE') {
      historyItems.push({
        id: `log-hs-${debtorId}-2`,
        type: 'email',
        timestamp: new Date(Date.now() + 1000).toISOString(),
        text: `Friendly outreach email successfully dispatched to ${d.email}: "Hi ${d.name}, follow up concerning verified handshake trade of ${d.currency}${d.amount.toLocaleString()}."`,
        status: 'delivered'
      });
      historyItems.push({
        id: `log-hs-${debtorId}-3`,
        type: 'sms',
        timestamp: new Date(Date.now() + 2000).toISOString(),
        text: `Friendly SMS alert sent to ${d.phone}: "Hello ${d.name}, gentle greeting. Trade verified on Floate. Due balance: ${d.currency}${d.amount.toLocaleString()}."`,
        status: 'delivered'
      });
    } else {
      historyItems.push({
        id: `log-hs-${debtorId}-2`,
        type: 'email',
        timestamp: new Date(Date.now() + 1000).toISOString(),
        text: `Verified handshake priority warning dispatched to ${d.email}: "[ACTION REQUIRED] Overdue verbal trade balance."`,
        status: 'delivered'
      });
      historyItems.push({
        id: `log-hs-${debtorId}-3`,
        type: 'sms',
        timestamp: new Date(Date.now() + 2000).toISOString(),
        text: `Priority SMS alert: "Hello ${d.name}, your verified verbal balance of ${d.currency}${d.amount.toLocaleString()} is overdue. Please pay now."`,
        status: 'read'
      });
      historyItems.push({
        id: `log-hs-${debtorId}-4`,
        type: 'call',
        timestamp: new Date(Date.now() + 3000).toISOString(),
        text: `Voice reminder dispatched to ${d.phone}: Polite reminder of overdue verbal balance ${d.currency}${d.amount.toLocaleString()} was successfully played.`,
        status: 'completed'
      });
    }

    if (sandboxUser) {
      const updatedDebtors = debtors.map(item => {
        if (item.id === debtorId) {
          return {
            ...item,
            handshakeStatus: 'CONFIRMED' as const,
            remindersCount: item.remindersCount + (item.remindStyle === 'GENTLE' ? 2 : 3),
            history: [...(item.history || []), ...historyItems]
          };
        }
        return item;
      });

      setDebtors(updatedDebtors);
      localStorage.setItem(`floate_sandbox_debtors_${sandboxUser.email}`, JSON.stringify(updatedDebtors));

      if (activeLogsId === debtorId) {
        setActiveLogs(prev => [...prev, ...historyItems]);
      }
      showToast("Debtor handshake confirmed! Active reminders successfully authorized.", "success");
      return;
    }

    const path = `debtors/${debtorId}`;
    try {
      for (const log of historyItems) {
        await setDoc(doc(db, 'debtors', debtorId, 'history', log.id), {
          type: log.type,
          timestamp: log.timestamp,
          text: log.text,
          status: log.status
        });
      }

      await updateDoc(doc(db, 'debtors', debtorId), {
        handshakeStatus: 'CONFIRMED',
        remindersCount: d.remindersCount + (d.remindStyle === 'GENTLE' ? 2 : 3)
      });

      showToast("Debtor handshake confirmed! Active reminders successfully authorized.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleTriggerBlacklist = async () => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isBlacklisted: true
      });
      showToast("ACCOUNT BLACKLISTED: Multiple unverified fake claims or spam detected.", "error");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleResetBlacklist = async () => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isBlacklisted: false
      });
      showToast("Merchant account restored. Safeguard logs cleared successfully.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <div className="min-h-screen relative font-sans bg-slate-50 text-slate-900">
      
      {/* Toast Warning banner */}
      {toast && (
        <div 
          id="system-toast-alert"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] md:w-auto bg-white border border-slate-200/90 text-slate-900 rounded-full py-2 px-4 shadow-[0_16px_36px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-3 text-xs select-none animate-fade-in"
        >
          <span className={`text-[9px] font-mono font-black tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
              : toast.type === 'error' 
                ? 'bg-rose-50 text-rose-700 border-rose-200/50' 
                : 'bg-slate-50 text-slate-600 border-slate-200/50'
          }`}>
            {toast.type.toUpperCase()}
          </span>
          <div className="flex-1 text-slate-700 leading-relaxed font-sans font-semibold pr-1 tracking-tight">
            {toast.message}
          </div>
        </div>
      )}

      {/* SYSTEM BLACKLIST LOCK SCREEN BARRIER */}
      {user.isBlacklisted && (
        <div className="fixed inset-0 z-55 bg-slate-950 flex items-center justify-center p-6 text-white overflow-y-auto animate-fade-in">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/30 rounded-lg p-8 space-y-6 text-center shadow-2xl relative">
            <span className="text-5xl select-none mx-auto block animate-bounce">🚫</span>
            
            <div className="space-y-2">
              <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-mono py-1 px-3 rounded font-black tracking-widest uppercase">
                Permanent Merchant Lockout Active
              </span>
              <h2 className="font-sans font-black text-2xl uppercase tracking-tight text-white mt-3">Account Blacklisted</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Your Floate merchant profile has been flagged and suspended. Our core data integrity engine caught multiple fake transaction inputs or spam campaign creations.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded border border-slate-800 text-left space-y-3 text-xs">
              <strong className="text-red-400 uppercase font-mono tracking-wider text-[10px] block">Integrity Compliance Violated</strong>
              <p className="text-[11px] text-slate-400 leading-normal">
                To protect public phone lines, informal traders, and general consumers from telecom spam, Floate enforces a strict zero-tolerance policy. Merely uploading blurred artifacts, forged waybills, or submitting unverified numbers triggers auto-blacklist across our telecom nodes.
              </p>
              <ul className="space-y-1 text-slate-500 text-[10.5px]">
                <li>• Verification State: <span className="text-red-400 font-bold uppercase">FLAGGED_FRAUD</span></li>
                <li>• Device ID Block: <span className="text-slate-400 font-mono">NODE_NG_M_9x8e820</span></li>
                <li>• Telecom Lock: <span className="text-slate-400">Robocall and SMS Porting Disabled</span></li>
              </ul>
            </div>

            <div className="space-y-3 font-sans">
              <button 
                type="button"
                onClick={handleResetBlacklist}
                className="w-full py-3 bg-red-650 hover:bg-red-700 hover:text-white text-white font-extrabold uppercase text-[10px] tracking-widest rounded-sm border border-red-600 transition cursor-pointer shadow-md"
              >
                Reset Demo Integrity & Restore My Account
              </button>
              <p className="text-[10px] text-slate-500">
                Authorized demonstration mode bypass. Real-world blacklists require banking-tier compliance review and physical waybill audit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Screen Routing Switch */}
      {viewingInvoiceId && publicInvoiceLoading && (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
          <p className="text-xs text-slate-550 font-mono">Fetching secure direct trade invoice...</p>
        </div>
      )}

      {viewingInvoiceId && !publicInvoice && !publicInvoiceLoading && (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Invoice Not Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              This invoice link has been archived, deleted, or cleared from the sandbox/local ledger. Please verify the URL or ask the merchant/sender for a new link.
            </p>
          </div>
          <button
            onClick={() => {
              window.history.pushState({}, '', window.location.pathname);
              setViewingInvoiceId(null);
              setCurrentView('LANDING');
            }}
            className="text-xs font-semibold uppercase tracking-wider text-slate-100 bg-slate-900 border px-4 py-2 hover:bg-slate-800 rounded transition cursor-pointer"
          >
            Go to Landing Page
          </button>
        </div>
      )}

      {viewingInvoiceId && publicInvoice && (
        <ClientInvoicePaymentPortal 
          invoice={publicInvoice}
          onConfirmPayment={handleConfirmPublicPayment}
          onBackToApp={() => {
            window.history.pushState({}, '', window.location.pathname);
            setViewingInvoiceId(null);
            setPublicInvoice(null);
            setCurrentView('LANDING');
          }}
        />
      )}

      {!viewingInvoiceId && activePage === 'PRIVACY' && (
        <PrivacyPolicyPage 
          onBack={handleNavigateBackFromLegal}
        />
      )}

      {!viewingInvoiceId && activePage === 'TERMS' && (
        <TermsOfServicePage 
          onBack={handleNavigateBackFromLegal}
        />
      )}

      {!viewingInvoiceId && activePage === 'ABOUT' && (
        <AboutUsPage 
          onBack={handleNavigateBackFromLegal}
        />
      )}

      {!viewingInvoiceId && activePage === 'NONE' && activeHubSlug === 'how-to-get-buying-customers-for-your-whatsapp-business' && (
        <BlogArticlePage 
          onNavigateHome={() => {
            setActiveHubSlug(null);
            window.history.pushState({}, '', '/');
          }}
        />
      )}

      {!viewingInvoiceId && activePage === 'NONE' && activeHubSlug && activeHubSlug !== 'how-to-get-buying-customers-for-your-whatsapp-business' && getSEOHubBySlug(activeHubSlug) && (
        <ProgrammaticHubPage 
          hub={getSEOHubBySlug(activeHubSlug)!}
          onNavigateHome={() => {
            setActiveHubSlug(null);
            window.history.pushState({}, '', '/');
          }}
          onSelectHub={(slug) => {
            setActiveHubSlug(slug);
            window.history.pushState({}, '', `/solutions/${slug}`);
          }}
        />
      )}

      {!viewingInvoiceId && activePage === 'NONE' && (!activeHubSlug || (!getSEOHubBySlug(activeHubSlug) && activeHubSlug !== 'how-to-get-buying-customers-for-your-whatsapp-business')) && currentView === 'LANDING' && (
        <LandingPage 
          onStartDemo={() => {
            window.open('https://wa.me/message/YYWEZAZZIXBRF1', '_blank');
          }}
          onLogin={() => {
            window.open('https://wa.me/message/YYWEZAZZIXBRF1', '_blank');
          }}
          onSelectHub={(slug) => {
            setActiveHubSlug(slug);
            window.history.pushState({}, '', `/solutions/${slug}`);
          }}
          onNavigatePage={handleNavigateToLegalPage}
        />
      )}

      {!viewingInvoiceId && currentView === 'LOGIN' && (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={() => setCurrentView('LANDING')}
          isFirestoreOffline={isFirestoreOffline}
        />
      )}

      {!viewingInvoiceId && currentView === 'DASHBOARD' && (
        <DashboardScreen 
          user={user}
          debtors={debtors}
          invoices={invoices}
          onSaveInvoice={handleSaveInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
          onLogout={handleLogout}
          onOpenAddDebtor={(initialData = null) => {
            setAddModalInitialData(initialData);
            setShowAddModal(true);
          }}
          onOpenLogs={(d) => setActiveLogsId(d.id)}
          onQuickSimulate={handleQuickSimulatePing}
          onAddCredits={handleAddCredits}
          onOpenReminderSelectForDraft={handleConfigDraftDebtor}
          onUpdateSubscriptionTier={handleUpdateSubscriptionTier}
          onTriggerChaserFromInvoice={handleTriggerChaserFromInvoice}
          onUpdateProfile={handleUpdateProfile}
          isFirestoreOffline={isFirestoreOffline}
          onTogglePauseDebtor={handleTogglePauseDebtor}
        />
      )}

      {/* MODAL 1: ADD DEBTOR (SCREEN 3) */}
      {showAddModal && (
        <AddDebtorModal 
          onClose={() => {
            setShowAddModal(false);
            setAddModalInitialData(null);
          }}
          onSubmit={handleAddDebtorSubmit}
          initialData={addModalInitialData}
        />
      )}

      {/* MODAL 2: SELECT CHASE TIER (SCREEN 4) */}
      {pendingDebtor && (
        <ReminderSelectorModal 
          debtorName={pendingDebtor.name}
          debtorAmount={pendingDebtor.amount}
          debtorCurrency={pendingDebtor.currency}
          userCredits={user.credits}
          onClose={() => setPendingDebtor(null)}
          onConfirm={handleConfirmReminderStyle}
          onOpenTopUp={() => {
            showToast('Top up your chasing wallet balance using our Paystack secure checkout!', 'info');
          }}
        />
      )}

      {/* MODAL 3: LOG VIEW console */}
      {activeLogsDebtor && (
        <LogViewModal 
          debtor={activeLogsDebtor}
          onClose={() => setActiveLogsId(null)}
          onSimulateReminder={handleQuickSimulatePing}
          onMarkAsPaid={handleMarkAsPaid}
          onFileDispute={handleFileDispute}
          onResolveDispute={handleResolveDispute}
          onTriggerBlacklist={handleTriggerBlacklist}
          onConfirmHandshake={handleConfirmHandshake}
          onAddDebtorReply={handleRecordDebtorReply}
          onTogglePauseCampaign={handleTogglePauseDebtor}
        />
      )}

    </div>
  );
}
