# Payment System - Quick Start Guide

## 🚀 Getting Started

The payment system is now live! Here's how to use it:

---

## For Consumers 🛒

### Making a Purchase

1. **Browse Products**
   - Go to `/marketplace`
   - Add products to cart

2. **Checkout**
   - Navigate to `/consumer/checkout`
   - Enter delivery address
   - Select payment method:
     - 📱 Mobile Money (Telebirr, M-Pesa, etc.)
     - 💳 Credit/Debit Card
     - 🏦 Bank Transfer
     - 💵 Cash on Delivery

3. **Review & Pay**
   - See payment breakdown:
     ```
     Product:    $100.00
     Delivery:   $ 10.00
     ─────────────────────
     Total:      $110.00
     ```
   - Click "Place Order"

4. **Track Order**
   - View in `/consumer/orders`
   - See payment status
   - Download receipt

---

## For Farmers 🌾

### Viewing Earnings

1. **Go to Earnings Dashboard**
   - Navigate to `/farmer/earnings`

2. **See Your Income**
   ```
   Total Sales:        $1,000.00
   Admin Tax (7%):     $   70.00
   ─────────────────────────────
   Net Earnings:       $  930.00
   
   Available:          $  500.00
   ```

3. **Request Payout**
   - Click "Request Payout"
   - Enter bank details:
     - Bank name
     - Account number
     - Account holder name
   - Submit request

4. **Track Payout**
   - Status: Pending → Approved → Paid
   - Receive money in 3-5 business days

---

## For Delivery Personnel 🚚

### Viewing Earnings

1. **Go to Earnings Dashboard**
   - Navigate to `/delivery/earnings`

2. **See Your Income**
   ```
   Total Deliveries:   50
   Delivery Fees:      $400.00 (80%)
   Platform Fee:       $100.00 (20%)
   ─────────────────────────────
   Your Earnings:      $400.00
   
   COD Collected:      $150.00
   Available:          $250.00
   ```

3. **Request Payout**
   - Click "Request Payout"
   - COD cash will be deducted automatically
   - Enter bank details
   - Submit request

4. **COD Reconciliation**
   - Cash collected is tracked
   - Deducted from your payout
   - Ensure cash is submitted to admin

---

## Fee Structure 💰

### What Consumers Pay
```
Product Price + Delivery Fee = Total
$100 + $10 = $110
```

### How It's Distributed
```
Farmer:         $93  (Product - 7% tax)
Admin:          $7   (7% platform fee)
Delivery Man:   $8   (80% of delivery)
Admin:          $2   (20% of delivery)
─────────────────────────────────────
Platform:       $9   (Total revenue)
```

---

## Payment Methods 💳

### 1. Mobile Money 📱
- **Providers**: Telebirr, M-Pesa, HelloCash, CBE Birr
- **Status**: Instant verification
- **Best for**: Quick payments

### 2. Credit/Debit Card 💳
- **Providers**: Visa, Mastercard
- **Status**: Instant verification
- **Best for**: International payments

### 3. Bank Transfer 🏦
- **Process**: Upload receipt
- **Status**: Pending admin verification
- **Best for**: Large amounts

### 4. Cash on Delivery 💵
- **Process**: Pay delivery man
- **Status**: Pending verification
- **Best for**: Trust-based transactions

---

## Common Questions ❓

### For Consumers

**Q: When will my order be delivered?**
A: Delivery time depends on farmer preparation and delivery man availability. Track status in "My Orders".

**Q: Can I cancel my order?**
A: Contact support immediately. Refunds depend on order status.

**Q: Is my payment secure?**
A: Yes! All online payments are encrypted and secure.

---

### For Farmers

**Q: When do I get paid?**
A: After delivery is completed, request a payout. Processed in 3-5 business days.

**Q: Why is 7% deducted?**
A: This is the platform fee for marketplace services, payment processing, and support.

**Q: Can I withdraw anytime?**
A: Yes, once your available balance is above $10.

---

### For Delivery Personnel

**Q: How much do I earn per delivery?**
A: You receive 80% of the delivery fee. Platform keeps 20%.

**Q: What about COD payments?**
A: Cash collected is tracked and deducted from your payout. Submit cash to admin.

**Q: When can I request a payout?**
A: Anytime your available balance is above $10.

---

## Navigation Links 🗺️

### Consumer
- Checkout: `/consumer/checkout`
- My Orders: `/consumer/orders`

### Farmer
- Earnings: `/farmer/earnings`
- Orders: `/farmer/orders`

### Delivery Man
- Earnings: `/delivery/earnings`
- Assigned: `/delivery/assigned`

---

## Support 📞

Need help?
1. Check the full documentation: `PAYMENT_SYSTEM_ARCHITECTURE.md`
2. Review implementation guide: `PAYMENT_IMPLEMENTATION_GUIDE.md`
3. Contact admin support

---

## Tips for Success 💡

### Consumers
- ✅ Double-check delivery address
- ✅ Choose payment method carefully
- ✅ Keep transaction ID for reference
- ✅ Rate your experience

### Farmers
- ✅ Fulfill orders promptly
- ✅ Maintain quality products
- ✅ Request payouts regularly
- ✅ Keep bank details updated

### Delivery Personnel
- ✅ Complete deliveries on time
- ✅ Handle COD carefully
- ✅ Submit cash promptly
- ✅ Request payouts regularly

---

## Quick Reference 📋

### Fee Rates
- Admin Tax: **7%** of product price
- Delivery Split: **80%** to delivery man, **20%** to platform

### Minimum Payout
- **$10** minimum withdrawal amount

### Processing Time
- Payouts: **3-5 business days**
- COD Verification: **1-2 business days**

### Payment Status
- 🟡 Pending - Awaiting processing
- 🟢 Completed - Payment successful
- 🔴 Failed - Payment unsuccessful
- ⚪ Refunded - Money returned

---

## Success! 🎉

You're all set to use the payment system. Start by:
1. **Consumers**: Browse and checkout
2. **Farmers**: Check your earnings
3. **Delivery**: View your income

Happy trading! 🌾💰🚚
