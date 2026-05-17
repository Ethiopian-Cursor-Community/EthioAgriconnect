# Payment System Implementation Guide

## Files Created

### ✅ Core Files
1. `src/types/payment.ts` - TypeScript interfaces
2. `src/lib/payment.ts` - Payment utility functions
3. `PAYMENT_SYSTEM_ARCHITECTURE.md` - Complete architecture

---

## Pages to Implement

### 🛒 Consumer Portal (6 pages)

#### 1. `/consumer/checkout` - Checkout Page
**File**: `src/pages/consumer/Checkout.tsx`

**Features**:
- Cart summary
- Delivery address form
- Payment method selector (Mobile Money, Card, Bank Transfer, COD)
- Payment breakdown display
- Place order button

**Key Functions**:
```typescript
- calculatePaymentBreakdown()
- handlePaymentMethodChange()
- handlePlaceOrder()
- processPayment()
```

#### 2. `/consumer/orders` - My Orders (Enhanced)
**File**: Update existing `src/pages/consumer/MyOrders.tsx`

**Add**:
- Payment status badge
- Payment method display
- Transaction ID
- Download receipt button
- Payment breakdown modal

#### 3. `/consumer/payment-history` - Payment History
**File**: `src/pages/consumer/PaymentHistory.tsx`

**Features**:
- All transactions list
- Filter by date/status
- Search by order ID
- Export to CSV
- Receipt download

#### 4. `/consumer/wallet` - Wallet (Optional)
**File**: `src/pages/consumer/Wallet.tsx`

**Features**:
- Current balance display
- Add funds button
- Transaction history
- Auto-pay toggle

---

### 🌾 Farmer Portal (3 pages)

#### 5. `/farmer/earnings` - Earnings Dashboard
**File**: `src/pages/farmer/Earnings.tsx`

**Features**:
- Total revenue card
- Admin tax deducted
- Net earnings
- Pending payouts
- Available to withdraw
- Request payout button
- Earnings chart (monthly)

**Display**:
```
Total Sales:         $1,000.00
Admin Tax (7%):      $   70.00
─────────────────────────────
Net Earnings:        $  930.00

Pending Payout:      $  500.00
Available:           $  430.00
```

#### 6. `/farmer/payouts` - Payout History
**File**: `src/pages/farmer/Payouts.tsx`

**Features**:
- Payout requests list
- Status tracking
- Bank details display
- Request new payout modal
- Filter by status

#### 7. `/farmer/orders` - Orders (Enhanced)
**File**: Update existing `src/pages/farmer/OrdersReceived.tsx`

**Add**:
- Payment status per order
- Revenue per order
- Tax breakdown tooltip
- Payout status

---

### 🚚 Delivery Man Portal (2 pages)

#### 8. `/delivery/earnings` - Earnings Dashboard
**File**: `src/pages/delivery/Earnings.tsx`

**Features**:
- Total deliveries completed
- Delivery fees earned (80%)
- Platform fee (20%)
- COD cash collected
- Pending payouts
- Request payout button

**Display**:
```
Total Deliveries:    50
Delivery Fees:       $400.00
Platform Fee:        $100.00
─────────────────────────────
Your Earnings:       $400.00

COD Collected:       $150.00
Pending Payout:      $250.00
```

#### 9. `/delivery/payout-history` - Payout History
**File**: `src/pages/delivery/PayoutHistory.tsx`

**Features**:
- Payout requests
- COD reconciliation
- Bank details
- Status tracking

---

### 🏛️ Admin Portal (4 pages)

#### 10. `/admin/payments` - Payment Management
**File**: `src/pages/admin/PaymentManagement.tsx`

**Features**:
- All transactions table
- Filter by payment method/status
- Verify bank transfers
- Validate COD payments
- Search functionality
- Approve/Reject actions

#### 11. `/admin/payouts` - Payout Management
**File**: `src/pages/admin/PayoutManagement.tsx`

**Features**:
- Farmer payout requests tab
- Delivery man payout requests tab
- Approve/Reject with reason
- Bulk approval
- Export reports
- Bank details verification

#### 12. `/admin/financial-reports` - Financial Reports
**File**: `src/pages/admin/FinancialReports.tsx`

**Features**:
- Revenue summary cards
- Platform income breakdown
- Payouts summary
- Net profit calculation
- Date range filter
- Export to PDF/CSV
- Charts and graphs

**Report Display**:
```
FINANCIAL SUMMARY

Revenue:
  Product Sales:      $10,000.00
  Delivery Fees:      $ 1,000.00
  Total:              $11,000.00

Platform Income:
  Admin Tax (7%):     $   700.00
  Delivery Fee (20%): $   200.00
  Total:              $   900.00

Payouts:
  To Farmers:         $ 9,300.00
  To Delivery Men:    $   800.00
  Total:              $10,100.00

Net Profit:           $   900.00
```

#### 13. `/admin/transactions` - Transaction Logs
**File**: `src/pages/admin/TransactionLogs.tsx`

**Features**:
- All transactions audit trail
- Failed payments
- Refunds
- Disputes
- Export logs

---

## Components to Create

### Payment Components

#### 1. `PaymentMethodSelector.tsx`
```typescript
<PaymentMethodSelector
  selected={paymentMethod}
  onChange={setPaymentMethod}
  methods={['mobile_money', 'card', 'bank_transfer', 'cod']}
/>
```

#### 2. `PaymentBreakdownCard.tsx`
```typescript
<PaymentBreakdownCard
  productAmount={100}
  deliveryFee={10}
  showDetails={true}
/>
```

#### 3. `PaymentStatusBadge.tsx`
```typescript
<PaymentStatusBadge status="completed" />
```

#### 4. `PayoutRequestModal.tsx`
```typescript
<PayoutRequestModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  availableAmount={500}
  onSubmit={handlePayoutRequest}
/>
```

#### 5. `TransactionTable.tsx`
```typescript
<TransactionTable
  transactions={transactions}
  onSort={handleSort}
  onFilter={handleFilter}
/>
```

#### 6. `EarningsCard.tsx`
```typescript
<EarningsCard
  title="Total Earnings"
  amount={1000}
  subtitle="This month"
  icon={<DollarSign />}
/>
```

---

## Database Operations

### Firestore Collections to Create

1. **payments** - All payment records
2. **payouts** - Payout requests
3. **transactions** - Transaction logs
4. **wallets** - User wallets (optional)

### Update Existing Collections

#### orders
Add fields:
```typescript
{
  paymentId: string,
  paymentMethod: string,
  paymentStatus: string,
  totalAmount: number,
  productAmount: number,
  deliveryFee: number,
  adminTax: number,
  farmerPayout: number,
  deliveryPayout: number,
  farmerPayoutStatus: string,
  deliveryPayoutStatus: string,
}
```

---

## Implementation Steps

### Phase 1: Core Setup (Day 1)
1. ✅ Create type definitions
2. ✅ Create utility functions
3. ✅ Create architecture document
4. ⏳ Set up Firestore collections
5. ⏳ Create payment components

### Phase 2: Consumer Flow (Day 2-3)
1. ⏳ Checkout page
2. ⏳ Payment method integration
3. ⏳ Order creation with payment
4. ⏳ Payment history page
5. ⏳ Receipt generation

### Phase 3: Earnings & Payouts (Day 4-5)
1. ⏳ Farmer earnings dashboard
2. ⏳ Delivery earnings dashboard
3. ⏳ Payout request system
4. ⏳ Bank details form
5. ⏳ Payout history pages

### Phase 4: Admin Management (Day 6-7)
1. ⏳ Payment management page
2. ⏳ Payout approval system
3. ⏳ Financial reports
4. ⏳ Transaction logs
5. ⏳ Export functionality

### Phase 5: Testing & Polish (Day 8)
1. ⏳ End-to-end testing
2. ⏳ Fee calculation verification
3. ⏳ UI/UX improvements
4. ⏳ Error handling
5. ⏳ Documentation

---

## Quick Start Commands

### Create Consumer Checkout Page
```bash
# Create the file
touch src/pages/consumer/Checkout.tsx

# Import required dependencies
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculatePaymentBreakdown } from '../../lib/payment';
import PaymentMethodSelector from '../../components/PaymentMethodSelector';
import PaymentBreakdownCard from '../../components/PaymentBreakdownCard';
```

### Create Farmer Earnings Page
```bash
touch src/pages/farmer/Earnings.tsx
```

### Create Admin Payment Management
```bash
touch src/pages/admin/PaymentManagement.tsx
```

---

## Testing Checklist

### Consumer Tests
- [ ] Add items to cart
- [ ] Proceed to checkout
- [ ] Select each payment method
- [ ] Complete payment
- [ ] Verify order created
- [ ] Check payment status
- [ ] Download receipt

### Farmer Tests
- [ ] View earnings dashboard
- [ ] Check tax calculations
- [ ] Request payout
- [ ] View payout history
- [ ] Verify payout amounts

### Delivery Tests
- [ ] Complete delivery
- [ ] Collect COD payment
- [ ] View earnings
- [ ] Request payout
- [ ] Check COD reconciliation

### Admin Tests
- [ ] View all payments
- [ ] Verify bank transfers
- [ ] Approve payouts
- [ ] Generate financial reports
- [ ] Export data

### Fee Calculation Tests
- [ ] Product $100 → Admin tax $7
- [ ] Farmer receives $93
- [ ] Delivery fee $10 → Delivery man $8, Admin $2
- [ ] Consumer pays $110 total
- [ ] Platform revenue $9 per order

---

## Next Steps

1. **Start with Phase 1**: Create all components and utilities
2. **Implement Consumer Flow**: Checkout and payment processing
3. **Add Earnings Dashboards**: For farmers and delivery personnel
4. **Build Admin Tools**: Payment and payout management
5. **Test Everything**: Verify all calculations and flows
6. **Deploy**: Launch payment system

---

## Support & Resources

- Architecture: `PAYMENT_SYSTEM_ARCHITECTURE.md`
- Types: `src/types/payment.ts`
- Utils: `src/lib/payment.ts`
- Firebase Docs: https://firebase.google.com/docs/firestore
- Payment Integration: Refer to provider documentation

---

## Summary

The payment system is architected and ready for implementation. All calculations, flows, and database structures are defined. Follow the implementation phases to build out each component systematically.

**Total Pages to Create**: 13
**Total Components**: 6+
**Estimated Time**: 8 days
**Complexity**: Medium-High

Start with the core utilities and components, then build out each portal's payment features systematically.
