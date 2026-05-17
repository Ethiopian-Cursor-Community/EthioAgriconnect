import { PaymentBreakdown } from '../types/payment';

// Fee Configuration
export const ADMIN_TAX_RATE = 0.07; // 7%
export const DELIVERY_MAN_SHARE = 0.80; // 80%
export const ADMIN_DELIVERY_SHARE = 0.20; // 20%
export const DEFAULT_DELIVERY_FEE = 10.00; // $10

/**
 * Calculate payment breakdown for an order
 */
export function calculatePaymentBreakdown(
  productAmount: number,
  deliveryFee: number = DEFAULT_DELIVERY_FEE
): PaymentBreakdown {
  // Admin tax (7% of product amount)
  const adminTax = productAmount * ADMIN_TAX_RATE;
  
  // Farmer payout (product amount - admin tax)
  const farmerPayout = productAmount - adminTax;
  
  // Delivery fee split
  const deliveryPayout = deliveryFee * DELIVERY_MAN_SHARE; // 80% to delivery man
  const deliveryPlatformFee = deliveryFee * ADMIN_DELIVERY_SHARE; // 20% to admin
  
  // Total amount consumer pays
  const totalAmount = productAmount + deliveryFee;
  
  return {
    productAmount,
    deliveryFee,
    totalAmount,
    adminTax,
    farmerPayout,
    deliveryPayout,
    deliveryPlatformFee,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Get payment method display name
 */
export function getPaymentMethodName(method: string): string {
  const names: Record<string, string> = {
    mobile_money: 'Mobile Money',
    card: 'Credit/Debit Card',
    bank_transfer: 'Bank Transfer',
    cod: 'Cash on Delivery',
    wallet: 'Wallet',
  };
  return names[method] || method;
}

/**
 * Get payment status color
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get payout status color
 */
export function getPayoutStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Generate transaction ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `TXN-${timestamp}-${random}`;
}

/**
 * Validate bank account number
 */
export function validateBankAccount(accountNumber: string): boolean {
  // Basic validation: 10-20 digits
  const cleaned = accountNumber.replace(/\s/g, '');
  return /^\d{10,20}$/.test(cleaned);
}

/**
 * Calculate platform revenue from an order
 */
export function calculatePlatformRevenue(
  productAmount: number,
  deliveryFee: number
): number {
  const adminTax = productAmount * ADMIN_TAX_RATE;
  const deliveryPlatformFee = deliveryFee * ADMIN_DELIVERY_SHARE;
  return adminTax + deliveryPlatformFee;
}
