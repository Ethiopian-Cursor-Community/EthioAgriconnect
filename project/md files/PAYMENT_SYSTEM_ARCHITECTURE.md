# Full AgriConnect Payment System Architecture

## 1. Payment System Overview

### Roles & Payment Interactions
- **Consumer**: Pays for products + delivery fee
- **Farmer**: Receives payment minus admin tax
- **Delivery Man**: Receives delivery fee (80%)
- **Admin**: Collects tax (7%) + delivery platform fee (20%)

---

## 2. Fee Structure

### Admin Tax (City Administration Fee)
- **Rate**: 7% of product price
- **Paid by**: Farmer (deducted from revenue)
- **Reason**: Marketplace commission
- **Example**: Product $100 → Farmer receives $93, Admin gets $7

### Delivery Fee
- **Paid by**: Consumer
- **Distribution**:
  - Delivery Man: 80%
  - Admin (Platform Fee): 20%
- **Example**: Delivery fee $10 → Delivery Man gets $8, Admin gets $2

### Total Consumer Payment
```
Total = Product Price + Delivery Fee
Example: $100 (product) + $10 (delivery) = $110
```

### Farmer Revenue
```
Farmer Revenue = Product Price - Admin Tax (7%)
Example: $100 - $7 = $93
```

### Delivery Man Revenue
```
Delivery Revenue = Delivery Fee × 80%
Example: $10 × 0.80 = $8
```

---

## 3. Payment Methods Supported

### A. Online Payment Methods
1. **Mobile Money**
   - Telebirr
   - M-Pesa
   - HelloCash
   - CBE Birr
   - Status: Instant verification

2. **Credit/Debit Cards**
   - Visa, Mastercard
   - Status: Instant verification

3. **Bank Transfer**
   - Manual upload receipt
   - Status: Pending admin verification

### B. Cash on Delivery (COD)
- Consumer pays delivery man at handover
- Delivery man marks payment as "Received"
- Admin validates the transaction
- Status: Pending verification → Verified

### C. Wallet System (Optional)
- Store credits in app
- Admin can load funds
- Consumers pay using wallet balance
- Instant transactions

---

## 4. Payment Flow by Role

### 🛒 Consumer Payment Flow

**Step 1: Checkout**
1. Review cart items
2. Enter delivery address
3. See payment breakdown:
   - Product subtotal: $100
   - Delivery fee: $10
   - **Total: $110**

**Step 2: Payment Method Selection**
- Choose: Mobile Money / Card / Bank Transfer / COD / Wallet

**Step 3: Payment Processing**
- Online: Instant confirmation
- COD: Pending delivery
- Bank Transfer: Upload receipt → Admin verifies

**Step 4: Confirmation**
- Order created with payment status
- Notification sent to farmer
- Delivery assigned

**Step 5: Track Payment**
- View in "My Orders"
- See payment status
- Download receipt

### 🌾 Farmer Payment Flow

**Step 1: Order Received**
- Notification of new order
- See payment status (Paid/Pending)

**Step 2: Fulfill Order**
- Prepare product
- Hand over to delivery man

**Step 3: Delivery Completed**
- Order marked as delivered
- Payment becomes "Pending Payout"

**Step 4: View Earnings**
- Total revenue
- Admin tax deducted (7%)
- Net earnings
- Pending payouts

**Step 5: Request Payout**
- Click "Request Payout"
- Enter bank details
- Submit request

**Step 6: Receive Payment**
- Admin approves payout
- Money transferred to farmer's account
- Status: "Paid"

### 🚚 Delivery Man Payment Flow

**Step 1: Accept Delivery**
- See delivery fee amount
- Accept assignment

**Step 2: Complete Delivery**
- If COD: Collect cash from consumer
- Mark as delivered
- Upload proof (optional)

**Step 3: View Earnings**
- Total deliveries completed
- Delivery fees earned (80% of fee)
- Pending payouts
- COD cash collected

**Step 4: Request Payout**
- Click "Request Payout"
- If COD: Deduct cash collected
- Enter bank details

**Step 5: Receive Payment**
- Admin approves payout
- Money transferred
- Status: "Paid"

### 🏛️ Admin Payment Flow

**Step 1: Monitor Payments**
- View all transactions
- Verify bank transfers
- Validate COD payments

**Step 2: Approve Payouts**
- Review farmer payout requests
- Review delivery man payout requests
- Approve/Reject with reason

**Step 3: Financial Reports**
- Total revenue
- Tax collected (7% of sales)
- Delivery platform fees (20% of delivery fees)
- Pending payouts
- Completed payouts

---

## 5. Pages & Features by Role

### 🛒 Consumer Portal

#### A. Checkout Page (`/consumer/checkout`)
**Features:**
- Cart summary
- Delivery address input
- Payment method selection
- Fee breakdown display
- Place order button

**Payment Breakdown:**
```
Product Subtotal:    $100.00
Delivery Fee:        $ 10.00
─────────────────────────────
Total:               $110.00
```

#### B. My Orders Page (`/consumer/orders`)
**Features:**
- Order list with payment status
- Payment method used
- Transaction ID
- Download receipt button
- Reorder button

**Payment Status:**
- ✅ Paid
- ⏳ Pending
- ❌ Failed
- 💰 COD (Pending)

#### C. Payment History Page (`/consumer/payment-history`)
**Features:**
- All transactions
- Filter by date/status
- Search by order ID
- Export to CSV

#### D. Wallet Page (`/consumer/wallet`) - Optional
**Features:**
- Current balance
- Add funds button
- Transaction history
- Auto-pay toggle

---

### 🌾 Farmer Portal

#### A. Earnings Dashboard (`/farmer/earnings`)
**Features:**
- Total revenue (all-time)
- This month's earnings
- Pending payouts
- Completed payouts
- Admin tax deducted

**Display:**
```
Total Sales:         $1,000.00
Admin Tax (7%):      $   70.00
─────────────────────────────
Net Earnings:        $  930.00

Pending Payout:      $  500.00
Available to Withdraw: $430.00
```

#### B. Payout History (`/farmer/payouts`)
**Features:**
- Payout requests list
- Status (Pending/Approved/Rejected)
- Bank details
- Request new payout button

#### C. Orders Page (Enhanced)
**Features:**
- Payment status per order
- Revenue per order
- Tax breakdown

---

### 🚚 Delivery Man Portal

#### A. Earnings Dashboard (`/delivery/earnings`)
**Features:**
- Total deliveries completed
- Total delivery fees earned
- Pending payouts
- COD cash collected
- Request payout button

**Display:**
```
Total Deliveries:    50
Delivery Fees:       $400.00 (80% of $500)
Platform Fee:        $100.00 (20% to Admin)
─────────────────────────────
Your Earnings:       $400.00

COD Cash Collected:  $150.00
Pending Payout:      $250.00
```

#### B. Payout History (`/delivery/payout-history`)
**Features:**
- Payout requests
- COD reconciliation
- Bank details
- Status tracking

---

### 🏛️ Admin Portal

#### A. Payment Management (`/admin/payments`)
**Features:**
- All transactions list
- Filter by payment method
- Verify bank transfers
- Validate COD payments
- Search by order/user

**Actions:**
- Approve/Reject bank transfers
- Mark COD as verified
- Refund payments

#### B. Payout Management (`/admin/payouts`)
**Features:**
- Farmer payout requests
- Delivery man payout requests
- Approve/Reject with reason
- Bulk approval
- Export payout reports

#### C. Financial Reports (`/admin/financial-reports`)
**Features:**
- Total platform revenue
- Tax collected (7%)
- Delivery platform fees (20%)
- Total payouts (Farmers + Delivery)
- Net profit
- Date range filter
- Export to PDF/CSV

**Report Display:**
```
FINANCIAL SUMMARY (This Month)

Revenue:
  Product Sales:           $10,000.00
  Delivery Fees:           $ 1,000.00
  ─────────────────────────────────
  Total Revenue:           $11,000.00

Platform Income:
  Admin Tax (7%):          $   700.00
  Delivery Fee (20%):      $   200.00
  ─────────────────────────────────
  Total Platform Income:   $   900.00

Payouts:
  To Farmers:              $ 9,300.00
  To Delivery Men:         $   800.00
  ─────────────────────────────────
  Total Payouts:           $10,100.00

Net Profit:                $   900.00
```

#### D. Transaction Logs (`/admin/transactions`)
**Features:**
- All payment transactions
- Audit trail
- Failed payments
- Refunds
- Disputes

---

## 6. Database Structure (Firestore)

### Collection: `payments`
```javascript
{
  id: string,
  orderId: string,
  consumerId: string,
  consumerName: string,
  farmerId: string,
  farmerName: string,
  deliveryManId: string,
  deliveryManName: string,
  
  // Amounts
  productAmount: number,        // $100
  deliveryFee: number,          // $10
  totalAmount: number,          // $110
  adminTax: number,             // $7 (7% of product)
  deliveryPlatformFee: number,  // $2 (20% of delivery)
  farmerPayout: number,         // $93 (product - tax)
  deliveryPayout: number,       // $8 (80% of delivery)
  
  // Payment Details
  paymentMethod: 'mobile_money' | 'card' | 'bank_transfer' | 'cod' | 'wallet',
  paymentProvider: string,      // 'Telebirr', 'M-Pesa', etc.
  transactionId: string,
  receiptUrl: string,           // For bank transfers
  
  // Status
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded',
  verificationStatus: 'pending' | 'verified' | 'rejected',
  
  // Timestamps
  createdAt: Timestamp,
  paidAt: Timestamp,
  verifiedAt: Timestamp,
  
  // Additional
  notes: string,
  verifiedBy: string,           // Admin ID
}
```

### Collection: `payouts`
```javascript
{
  id: string,
  userId: string,
  userName: string,
  userRole: 'farmer' | 'delivery_man',
  
  // Amount
  amount: number,
  codCashCollected: number,     // For delivery men
  netPayout: number,            // amount - codCash
  
  // Bank Details
  bankName: string,
  accountNumber: string,
  accountName: string,
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'paid',
  
  // Related Orders
  orderIds: string[],
  paymentIds: string[],
  
  // Timestamps
  requestedAt: Timestamp,
  approvedAt: Timestamp,
  paidAt: Timestamp,
  
  // Admin Actions
  approvedBy: string,
  rejectionReason: string,
  notes: string,
}
```

### Collection: `transactions`
```javascript
{
  id: string,
  type: 'payment' | 'payout' | 'refund' | 'wallet_topup',
  userId: string,
  amount: number,
  status: 'pending' | 'completed' | 'failed',
  paymentMethod: string,
  transactionId: string,
  createdAt: Timestamp,
  metadata: object,
}
```

### Collection: `wallets` (Optional)
```javascript
{
  id: string,
  userId: string,
  balance: number,
  currency: 'USD' | 'ETB',
  transactions: [
    {
      id: string,
      type: 'credit' | 'debit',
      amount: number,
      description: string,
      timestamp: Timestamp,
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### Update to `orders` Collection
```javascript
{
  // Existing fields...
  
  // Payment Fields
  paymentId: string,
  paymentMethod: string,
  paymentStatus: 'pending' | 'paid' | 'failed',
  totalAmount: number,
  productAmount: number,
  deliveryFee: number,
  adminTax: number,
  farmerPayout: number,
  deliveryPayout: number,
  
  // Payout Status
  farmerPayoutStatus: 'pending' | 'requested' | 'paid',
  deliveryPayoutStatus: 'pending' | 'requested' | 'paid',
  farmerPayoutId: string,
  deliveryPayoutId: string,
}
```

---

## 7. Payment Calculation Formulas

### Consumer Payment
```javascript
const productAmount = cartItems.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);
const deliveryFee = 10.00; // Fixed or calculated by distance
const totalAmount = productAmount + deliveryFee;
```

### Admin Tax (7%)
```javascript
const adminTax = productAmount * 0.07;
```

### Farmer Payout
```javascript
const farmerPayout = productAmount - adminTax;
// Example: $100 - $7 = $93
```

### Delivery Fee Split
```javascript
const deliveryPayout = deliveryFee * 0.80;        // 80% to delivery man
const deliveryPlatformFee = deliveryFee * 0.20;   // 20% to admin
// Example: $10 → $8 (delivery) + $2 (admin)
```

### Platform Revenue
```javascript
const platformRevenue = adminTax + deliveryPlatformFee;
// Example: $7 + $2 = $9 per order
```

---

## 8. Payment Status Flow

### Online Payment (Mobile Money, Card)
```
Pending → Processing → Completed
                    ↓
                  Failed
```

### Bank Transfer
```
Pending → Receipt Uploaded → Admin Verifying → Verified
                                             ↓
                                          Rejected
```

### Cash on Delivery
```
Pending → Delivered → Cash Collected → Admin Verified
```

### Payout Request
```
Requested → Admin Review → Approved → Processing → Paid
                        ↓
                     Rejected
```

---

## 9. UI Components Needed

### Payment Method Selector
- Radio buttons for each method
- Icons for each payment type
- Description text
- Selected state styling

### Payment Breakdown Card
- Line items with amounts
- Subtotals
- Bold total
- Tax/fee explanations

### Payment Status Badge
- Color-coded by status
- Icon indicators
- Tooltip with details

### Payout Request Form
- Amount display
- Bank details input
- Confirmation modal
- Success/error feedback

### Transaction Table
- Sortable columns
- Filter dropdowns
- Search bar
- Pagination
- Export button

---

## 10. Security Considerations

### Payment Security
- ✅ HTTPS only
- ✅ Payment data encryption
- ✅ PCI DSS compliance (for cards)
- ✅ Secure API keys
- ✅ Transaction logging
- ✅ Fraud detection

### Payout Security
- ✅ Admin approval required
- ✅ Bank details verification
- ✅ Two-factor authentication
- ✅ Audit trail
- ✅ Withdrawal limits

### Data Protection
- ✅ Sensitive data encryption
- ✅ Access control
- ✅ Regular backups
- ✅ GDPR compliance

---

## 11. Implementation Priority

### Phase 1: Core Payment (Week 1)
1. ✅ Database structure
2. ✅ Consumer checkout page
3. ✅ Payment method selection
4. ✅ COD implementation
5. ✅ Order payment status

### Phase 2: Earnings & Payouts (Week 2)
1. ✅ Farmer earnings dashboard
2. ✅ Delivery earnings dashboard
3. ✅ Payout request system
4. ✅ Admin payout approval

### Phase 3: Online Payments (Week 3)
1. ✅ Mobile money integration
2. ✅ Card payment integration
3. ✅ Bank transfer with receipt
4. ✅ Payment verification

### Phase 4: Reports & Analytics (Week 4)
1. ✅ Financial reports
2. ✅ Transaction logs
3. ✅ Export functionality
4. ✅ Dashboard analytics

### Phase 5: Wallet System (Optional)
1. ✅ Wallet creation
2. ✅ Top-up functionality
3. ✅ Wallet payments
4. ✅ Transaction history

---

## 12. Testing Scenarios

### Test Case 1: Consumer Online Payment
1. Add products to cart
2. Proceed to checkout
3. Select Mobile Money
4. Complete payment
5. ✅ Order created with "Paid" status
6. ✅ Farmer notified
7. ✅ Payment record created

### Test Case 2: Cash on Delivery
1. Consumer selects COD
2. Order created with "Pending Payment"
3. Delivery man delivers
4. Consumer pays cash
5. Delivery man marks "Cash Received"
6. ✅ Admin verifies
7. ✅ Payment status updated

### Test Case 3: Farmer Payout
1. Farmer has completed orders
2. Views earnings dashboard
3. Requests payout
4. Admin reviews request
5. Admin approves
6. ✅ Payout marked as "Paid"
7. ✅ Farmer notified

### Test Case 4: Fee Calculations
1. Product: $100
2. Delivery: $10
3. ✅ Consumer pays: $110
4. ✅ Admin tax: $7
5. ✅ Farmer gets: $93
6. ✅ Delivery man gets: $8
7. ✅ Admin gets: $9

---

## Summary

This payment system provides:
- ✅ Multiple payment methods
- ✅ Fair fee distribution
- ✅ Transparent earnings tracking
- ✅ Secure payout system
- ✅ Comprehensive admin controls
- ✅ Detailed financial reporting

All roles have clear payment workflows and the platform generates revenue through marketplace tax and delivery fees while ensuring fair compensation for farmers and delivery personnel.
