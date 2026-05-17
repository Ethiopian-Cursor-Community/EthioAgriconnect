// Payment System Types

export type PaymentMethod = 'mobile_money' | 'card' | 'bank_transfer' | 'cod' | 'wallet';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'paid';
export type UserRole = 'farmer' | 'delivery_man';

export interface Payment {
  id: string;
  orderId: string;
  consumerId: string;
  consumerName: string;
  farmerId: string;
  farmerName: string;
  deliveryManId?: string;
  deliveryManName?: string;
  
  // Amounts
  productAmount: number;
  deliveryFee: number;
  totalAmount: number;
  adminTax: number;
  deliveryPlatformFee: number;
  farmerPayout: number;
  deliveryPayout: number;
  
  // Payment Details
  paymentMethod: PaymentMethod;
  paymentProvider?: string;
  transactionId?: string;
  receiptUrl?: string;
  
  // Status
  paymentStatus: PaymentStatus;
  verificationStatus: VerificationStatus;
  
  // Timestamps
  createdAt: any;
  paidAt?: any;
  verifiedAt?: any;
  
  // Additional
  notes?: string;
  verifiedBy?: string;
}

export interface Payout {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  
  // Amount
  amount: number;
  codCashCollected?: number;
  netPayout: number;
  
  // Bank Details
  bankName: string;
  accountNumber: string;
  accountName: string;
  
  // Status
  status: PayoutStatus;
  
  // Related Orders
  orderIds: string[];
  paymentIds: string[];
  
  // Timestamps
  requestedAt: any;
  approvedAt?: any;
  paidAt?: any;
  
  // Admin Actions
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'payout' | 'refund' | 'wallet_topup';
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: any;
  metadata?: any;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: 'USD' | 'ETB';
  transactions: WalletTransaction[];
  createdAt: any;
  updatedAt: any;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: any;
}

export interface PaymentBreakdown {
  productAmount: number;
  deliveryFee: number;
  totalAmount: number;
  adminTax: number;
  farmerPayout: number;
  deliveryPayout: number;
  deliveryPlatformFee: number;
}
