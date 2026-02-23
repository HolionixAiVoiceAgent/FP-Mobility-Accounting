# Vehicle Purchases Payable - Complete Implementation Guide

## Quick Start

### 1. **Record a Vehicle Purchase**
- Navigate to **Vehicle Purchases** page
- Click **"Record Vehicle Purchase"** button
- Fill in the form:
  - **Seller Name*** (e.g., "John Smith")
  - **Seller Type*** (Customer, Dealer, Auction, Trade-In)
  - **Seller Contact** (Phone/Email)
  - **Seller Address** (Optional)
  - **Purchase Date*** (When you bought the vehicle)
  - **Purchase Price*** (Amount you owe to seller)
  - **Payment Terms*** (0 = immediate, 30 = 1 month, 60 = 2 months)
  - **Payment Method** (Bank Transfer, Cash, Check)
  - **Notes** (Optional - additional details)
- Click **"Record Purchase"**

### 2. **View All Purchases**
- Go to **Vehicle Purchases** page
- See dashboard summary cards:
  - **Total Outstanding** - Total amount owed to all sellers
  - **Overdue Payments** - Amount past due (shown in red)
  - **Due This Week** - Amount due in next 7 days
  - **Due This Month** - Amount due in next 30 days

### 3. **Record a Payment**
For any unpaid purchase:
1. Find the purchase in the list
2. Click **"Record Payment"** button
3. In the dialog, you'll see:
   - **Payment Terms** (e.g., "Pay within 1 month")
   - **Due Date** automatically calculated
   - **Outstanding Balance** to remind you what's owed
   - Previous payments (if any)
4. Enter payment details:
   - **Payment Date** (when payment was made)
   - **Amount** (defaults to full outstanding balance, edit as needed for partial payments)
   - **Payment Method**
   - **Reference Number** (check #, transaction ID, etc.)
   - **Notes** (optional)
5. Click **"Record Payment"**

### 4. **Track Status**
Each purchase shows its current status:
- 🔵 **Pending** - No payments recorded yet
- 🟡 **Partial** - Some payment received but balance remains
- 🟢 **Paid** - Full amount paid
- 🔴 **Overdue** - Payment due date has passed

**Status is automatically updated** when you record payments!

### 5. **Search & Export**
- **Search** - Use search box to find by seller name or type
- **Export** - Click "Export" to download all purchases as CSV for accounting

---

## 🔄 How Payment Status Updates Work (Automatic)

When you record a payment, the system automatically:

1. **Sums all payments** for that purchase
2. **Updates the Outstanding Balance** (Purchase Price - Total Payments)
3. **Updates the Payment Status**:
   - If total paid ≥ purchase price → **"Paid"** ✅
   - If total paid > 0 but < purchase price → **"Partial"** 🟡
   - If today's date > due date → **"Overdue"** ⚠️
   - Otherwise → **"Pending"** 

All done in the database automatically - no manual updates needed!

---

## 📊 Dashboard Metrics Explained

### Total Outstanding
**What it tracks:** Total amount you still owe across all purchases
**Formula:** Sum of (Purchase Price - Amount Paid) for all non-paid purchases
**Use case:** Know your total payables liability

### Overdue Payments
**What it tracks:** Amount owed where payment date has passed
**Alert:** Shown in RED if > €0
**Use case:** Identify urgent payments that need immediate action

### Due This Week
**What it tracks:** Amount due in the next 7 days
**Use case:** Weekly cash flow planning

### Due This Month
**What it tracks:** Amount due in the next 30 days
**Use case:** Monthly cash flow planning

---

## 💾 Data Stored for Each Purchase

| Field | Purpose |
|-------|---------|
| **Seller Name** | Who you bought from |
| **Seller Type** | Category (Customer, Dealer, Auction, Trade-In) |
| **Seller Contact** | Phone/Email for communication |
| **Seller Address** | Address for records |
| **Purchase Date** | When purchase occurred |
| **Purchase Price** | Full amount owed to seller |
| **Payment Terms (Days)** | How many days until payment is due |
| **Payment Due Date** | Auto-calculated: Purchase Date + Terms |
| **Amount Paid** | Auto-calculated sum of all payments |
| **Outstanding Balance** | Auto-calculated: Purchase Price - Amount Paid |
| **Payment Status** | Auto-calculated: Pending/Partial/Paid/Overdue |
| **Payment Method** | How payment will be/was made |
| **Notes** | Additional details or references |
| **Payment History** | All individual payments recorded |

---

## 🎯 Common Scenarios

### Scenario 1: Full Payment on Purchase Date
1. Record purchase with 0 days payment terms (pay immediately)
2. Record full payment same day
3. Status automatically becomes "Paid" ✅

### Scenario 2: Partial Payments Over Time
1. Record purchase with 30-day terms
2. Day 15: Record partial payment (50%)
   - Status becomes "Partial" 🟡
   - Outstanding shows remaining 50%
3. Day 28: Record final payment
   - Status becomes "Paid" ✅
   - Outstanding shows €0

### Scenario 3: Overdue Payment
1. Record purchase with 30-day terms (due date = 30 days from now)
2. Day 35 (today is 5 days past due):
   - Status automatically shows "Overdue" 🔴
   - Appears in red in dashboard
   - Overdue amount metric includes this

### Scenario 4: Multiple Sellers
Track multiple purchases from different sellers:
- Each seller's outstanding tracked separately
- Dashboard shows total across all sellers
- Filter by seller name in search

---

## 🔐 Data Security & RLS

- Each purchase is associated with your user account
- Row-Level Security (RLS) ensures only authorized users can view
- All payment history is auditable with dates and records
- Timestamps track when records were created/modified

---

## 📈 Accounting Integration

### Export for Accounting Software
1. Go to Vehicle Purchases page
2. Click "Export" button
3. CSV file downloads with all purchases
4. Import into QuickBooks, Excel, or other accounting software

**CSV Includes:**
- Purchase Date
- Seller Name & Type
- Purchase Price
- Amount Paid
- Outstanding Balance
- Payment Status
- Due Date
- Payment Terms

---

## ⚙️ Technical Details

### Database Tables

**vehicle_purchases**
- Stores purchase records
- Tracks seller info, amounts, terms
- Automatically updated when payments recorded

**purchase_payments**
- Stores each individual payment
- Links to vehicle_purchases
- Immutable payment history

### Automatic Calculations (Database Triggers)

When a payment is recorded, database trigger `update_purchase_payment_status()`:
- Calculates total paid (SUM of all payments)
- Updates outstanding balance
- Determines correct payment status
- Updates timestamp

**No manual intervention needed!**

---

## ✨ Key Features Summary

✅ Record purchases from sellers/dealers  
✅ Track seller information & contact  
✅ Manage payment terms (days to pay)  
✅ Automatic payment due date calculation  
✅ Record partial or full payments  
✅ Auto-calculate payment status (Pending/Partial/Paid/Overdue)  
✅ Track payment history per purchase  
✅ Dashboard metrics for cash flow  
✅ Overdue alerts (red highlighting)  
✅ Search & filter capabilities  
✅ Export to CSV for accounting  
✅ Delete purchases (with confirmation)  

---

## 🚀 Next Steps

All core features are implemented and production-ready. The system is designed to:
- Help you **track what you owe sellers**
- Alert you to **overdue payments**
- Plan **cash flow** based on payment due dates
- **Automatically manage** payment status and balances

Start recording vehicle purchases today and stay on top of your Accounts Payable!
