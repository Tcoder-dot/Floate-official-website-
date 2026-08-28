import { Debtor } from './types';

export const INITIAL_DEBTORS: Debtor[] = [
  {
    id: 'debtor-1',
    name: 'Chinedu Okafor',
    email: 'chinedu.okafor@example.com',
    phone: '+234 812 345 6789',
    amount: 45000,
    currency: '₦',
    receiptName: 'chinedu_office_supplies.pdf',
    receiptUrl: '#',
    remindStyle: 'AGGRESSIVE',
    status: 'ACTIVE',
    remindersCount: 3,
    createdAt: '2026-05-20T10:00:00Z',
    lastRemindedAt: '2026-06-01T15:30:00Z',
    merchantBusinessName: 'Rich Tech Solutions',
    merchantLocation: 'Enugu, Nigeria',
    merchantEthnicity: 'Igbo',
    merchantWhatTheySell: 'Custom database software development',
    debtorLocation: 'Onitsha, Nigeria',
    paymentDueDate: '2026-05-15',
    isFreelancer: true,
    history: [
      {
        id: 'log-1-1',
        type: 'status_change',
        timestamp: '2026-05-20T10:05:00Z',
        text: 'Debtor registered. Reminder style setup locked on AGGRESSIVE (₦1,500).',
        status: 'completed'
      },
      {
        id: 'log-1-2',
        type: 'email',
        timestamp: '2026-05-21T09:00:00Z',
        text: 'Primary demand email dispatched: [URGENT] Payment Required for Invoice #45000.',
        status: 'delivered'
      },
      {
        id: 'log-1-3',
        type: 'sms',
        timestamp: '2026-05-23T14:15:00Z',
        text: 'SMS ping sent: "Hi Chinedu, this is a formal status alert regarding your unpaid debt of ₦45,000. Resolve immediately using paylink.floate.xyz."',
        status: 'read'
      },
      {
        id: 'log-1-4',
        type: 'call',
        timestamp: '2026-05-26T11:00:00Z',
        text: 'Automated Robocall dispatch to +234 812 345 6789. Duration: 42s. Call answered. Chinedu pressed 1 to acknowledge receipt.',
        status: 'completed'
      },
      {
        id: 'log-1-5',
        type: 'email',
        timestamp: '2026-06-01T15:30:00Z',
        text: 'Agressive Email follow-up: [FINAL NOTICE] Impending direct legal escalation threat with reference receipt chinedu_office_supplies.pdf attached.',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'debtor-2',
    name: 'Amina Bello',
    email: 'amina.bello@cookinghub.ng',
    phone: '+234 905 555 1234',
    amount: 12500,
    currency: '₦',
    receiptName: 'amina_baking_loan.png',
    receiptUrl: '#',
    remindStyle: 'GENTLE',
    status: 'PAID',
    remindersCount: 1,
    createdAt: '2026-05-28T08:30:00Z',
    lastRemindedAt: '2026-05-29T10:00:00Z',
    merchantBusinessName: 'Supreme Flour Millers',
    merchantLocation: 'Kano, Nigeria',
    merchantEthnicity: 'Hausa',
    merchantWhatTheySell: 'Premium baking ingredients and bags of flour',
    debtorLocation: 'Zaria, Nigeria',
    paymentDueDate: '2026-05-25',
    isFreelancer: false,
    history: [
      {
        id: 'log-2-1',
        type: 'status_change',
        timestamp: '2026-05-28T08:35:00Z',
        text: 'Debtor registered. Reminder style locked on GENTLE (₦500).',
        status: 'completed'
      },
      {
        id: 'log-2-2',
        type: 'email',
        timestamp: '2026-05-29T10:00:00Z',
        text: 'Polite reminder email dispatched: "Hi Amina, hope your baking supply store is thriving! Here is a friendly heads up for the ₦12,500 backing ingredients invoice when you get a moment."',
        status: 'read'
      },
      {
        id: 'log-2-3',
        type: 'status_change',
        timestamp: '2026-06-01T09:12:00Z',
        text: 'Payment received via automatic Paystack bank transfer. Amina Bello cleared ₦12,500. Balance recovered!',
        status: 'completed'
      }
    ]
  },
  {
    id: 'debtor-3',
    name: 'Tunde Bakare',
    email: 'tundebakare@creativeworkspace.com',
    phone: '+234 811 000 9999',
    amount: 150000,
    currency: '₦',
    receiptName: null,
    receiptUrl: null,
    remindStyle: null,
    status: 'DRAFT',
    remindersCount: 0,
    createdAt: '2026-06-01T17:45:00Z',
    lastRemindedAt: null,
    merchantBusinessName: 'Ayo Creative Agency',
    merchantLocation: 'Lagos, Nigeria',
    merchantEthnicity: 'Yoruba',
    merchantWhatTheySell: 'Visual graphics & logo design services',
    debtorLocation: 'Ibadan, Nigeria',
    paymentDueDate: '2026-05-30',
    isFreelancer: true,
    history: [
      {
        id: 'log-3-1',
        type: 'status_change',
        timestamp: '2026-06-01T17:45:00Z',
        text: 'Draft added. Awaiting reminder tier setup to dispatch first message.',
        status: 'completed'
      }
    ]
  }
];
