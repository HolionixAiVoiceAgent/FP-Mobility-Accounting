# 🚀 WEEK-BY-WEEK IMPLEMENTATION ROADMAP
## Car Dealership Management Platform - Enterprise Edition

---

## 📅 WEEK 1: Foundation (Database & Dashboard)

### **Days 1-2: Database Migration**

**Tasks**:
```
[ ] Deploy Phase 1 migration to Supabase
    supabase db push
    
[ ] Verify all 14 new tables created:
    - sales_pipeline
    - leads
    - employees
    - employee_performance
    - commissions
    - customer_financing
    - financing_payments
    - test_drives
    - market_prices
    - qr_codes
    - vehicle_tracking
    - audit_logs_enhanced
    - communication_history
    - role_permissions

[ ] Verify RLS policies active for:
    - employees (owner + manager access)
    - customer_financing (customer + accountant)
    - communication_history (customer + employee)
    - audit_logs_enhanced (owner only)

[ ] Test data insertion with seed script
[ ] Verify views created (cash_flow_summary, sales_performance, inventory_aging_summary)
```

**Files to Create**:
```
supabase/seed.sql
- Insert test employees (owner, sales manager, 3 salespeople, accountant, hr manager)
- Insert test customers (10)
- Insert test vehicles (30)
- Insert test leads (15)
- Insert test sales pipeline (20 records in various stages)
```

**Validation**:
```bash
# Test RLS is working
supabase test

# Check table counts
SELECT COUNT(*) FROM employees;
SELECT COUNT(*) FROM sales_pipeline;
SELECT COUNT(*) FROM audit_logs_enhanced;
```

---

### **Days 2-3: Role-Based Access Control Implementation**

**Tasks**:
```
[ ] Update auth.ts to include role determination
[ ] Create useRole() hook
[ ] Implement permission checker utility
[ ] Update ProtectedRoute to support role-based routing
[ ] Create access control middleware
```

**Files to Create**:
```
src/hooks/useRole.ts
- Get current user's role
- Check permissions
- List accessible modules

src/lib/permissions.ts
- hasPermission(role, resource, action)
- getAccessibleModules(role)
- getAccessibleReports(role)

src/components/RoleBasedRoute.tsx
- Enhanced route wrapper
- Check specific permissions
- Redirect if denied

src/lib/rbac-config.ts
- Define all permission mappings
- Role hierarchy
- Module access matrix
```

**Validation**:
```bash
# Test login with different roles
# Verify dashboard changes based on role
# Check that restricted modules don't appear
```

---

### **Days 3-5: Enhanced Multi-Role Dashboard**

**Tasks**:
```
[ ] Redesign Dashboard.tsx to support 5+ role-specific views
[ ] Create OWNER dashboard (executive view)
[ ] Create SALESPERSON dashboard (pipeline view)
[ ] Create ACCOUNTANT dashboard (financial view)
[ ] Create HR_MANAGER dashboard (team view)
[ ] Create INVENTORY_MANAGER dashboard (stock view)

[ ] Build dashboard widgets:
    ✓ Cash Flow Forecast (30/60/90 days)
    ✓ Inventory Aging Report
    ✓ Top Performing Models
    ✓ Profit Margin Analysis
    ✓ Sales Pipeline Overview
    ✓ Team Performance Metrics
    ✓ Upcoming Obligations Calendar
    ✓ Customer Segmentation
    ✓ Key Performance Indicators (KPIs)
```

**Component Hierarchy**:
```
src/pages/Dashboard.tsx (root - determines role)
  ├─ src/components/DashboardVariants/
  │  ├─ OwnerDashboard.tsx
  │  ├─ SalesDashboard.tsx
  │  ├─ FinanceDashboard.tsx
  │  ├─ HRDashboard.tsx
  │  └─ InventoryDashboard.tsx
  │
  └─ src/components/DashboardWidgets/
     ├─ CashFlowWidget.tsx (with forecast chart)
     ├─ InventoryAgingWidget.tsx (with age buckets)
     ├─ TopModelsWidget.tsx (with sales trends)
     ├─ ProfitMarginWidget.tsx (with by-model breakdown)
     ├─ PipelineWidget.tsx (with stage distribution)
     ├─ TeamPerformanceWidget.tsx (with leaderboard)
     ├─ ObligationsWidget.tsx (with calendar)
     ├─ CustomerSegmentationWidget.tsx (with RFM)
     └─ AlertsWidget.tsx (with critical issues)
```

**Database Queries**:
```sql
-- Cash Flow Forecast (next 30/60/90 days)
SELECT
  DATE_TRUNC('week', sp.expected_close_date) as week,
  SUM(sp.deal_value * (sp.probability_percentage / 100)) as forecasted_revenue
FROM sales_pipeline sp
WHERE sp.expected_close_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'
GROUP BY week;

-- Inventory Aging
SELECT
  CASE
    WHEN (EXTRACT(DAY FROM NOW() - vt.received_date)) <= 30 THEN '0-30'
    WHEN (EXTRACT(DAY FROM NOW() - vt.received_date)) <= 60 THEN '31-60'
    WHEN (EXTRACT(DAY FROM NOW() - vt.received_date)) <= 90 THEN '61-90'
    ELSE '90+'
  END as age_bucket,
  COUNT(*) as count
FROM vehicle_tracking vt
WHERE vt.current_status != 'sold'
GROUP BY age_bucket;

-- Top Performing Models
SELECT
  vs.vehicle_make,
  vs.vehicle_model,
  COUNT(*) as units_sold,
  AVG(vs.profit) as avg_profit,
  AVG(
    EXTRACT(DAY FROM vs.sale_date - vt.received_date)
  ) as avg_days_to_sell
FROM vehicle_sales vs
JOIN vehicle_tracking vt ON vs.id = vt.vehicle_id
WHERE vs.payment_status = 'completed'
GROUP BY vs.vehicle_make, vs.vehicle_model
ORDER BY units_sold DESC, avg_profit DESC
LIMIT 10;
```

**UI/UX**: Use Recharts for all visualizations
- Line charts for forecasts
- Bar charts for comparisons
- Pie charts for distributions
- Heatmaps for aging reports

**Validation**:
```
[ ] All 5 dashboard variants display correctly
[ ] Widgets show accurate data from new tables
[ ] Performance: Load time < 1 second
[ ] Mobile responsive (tested on mobile device)
[ ] Charts interactive and informative
```

---

## 📅 WEEK 2: Sales Pipeline & Advanced Search

### **Days 1-3: Sales Pipeline Module (Kanban Board)**

**Tasks**:
```
[ ] Build sales pipeline Kanban board
[ ] Implement drag-drop between stages
[ ] Create lead detail views
[ ] Add lead interaction history
[ ] Build deal value calculator
[ ] Implement probability-weighted forecasting
```

**Files to Create**:
```
src/pages/SalesPipeline.tsx (main page)
src/components/Pipeline/
  ├─ PipelineKanban.tsx (Kanban board - react-beautiful-dnd)
  ├─ PipelineCard.tsx (individual deal card)
  ├─ LeadDetailModal.tsx (full lead details)
  ├─ LeadForm.tsx (create/edit lead)
  ├─ InteractionHistory.tsx (timeline of interactions)
  ├─ PipelineMetrics.tsx (forecast, conversion, cycle time)
  ├─ StageColumn.tsx (each column in Kanban)
  └─ DealCalculator.tsx (value & probability calculator)

src/hooks/useSalesPipeline.ts (React Query hooks)
  ├─ useGetPipeline()
  ├─ useGetLeads()
  ├─ useUpdateDealStage()
  ├─ useCreateLead()
  └─ useGetPipelineMetrics()
```

**Kanban Board Stages**:
```
Lead → Contact Made → Interest Shown → 
Test Drive Scheduled → Test Drive Completed → 
Negotiation → Offer Made → Accepted → 
Sale → Closed Lost (side track)
```

**Features**:
- Drag & drop deals between stages
- Deal details on click
- Add notes/interactions
- Set probability & deal value
- Track expected close date
- Deal status history
- Email notifications on stage change

**Validation**:
- [x] Kanban board displays all stages
- [x] Drag & drop updates database
- [x] Cards show lead + deal info
- [x] Click shows full details
- [x] Forecast calculates correctly
- [x] Mobile view optimized

---

### **Days 2-4: Advanced Search & Quick Filters**

**Tasks**:
```
[ ] Implement fuzzy search across all modules
[ ] Create saved filter system
[ ] Build advanced filter UI
[ ] Add quick report generation
[ ] Implement export capabilities
```

**Files to Create**:
```
src/components/AdvancedSearch/
  ├─ SearchBar.tsx (main search input)
  ├─ SearchResults.tsx (display results)
  ├─ FilterBuilder.tsx (advanced filters)
  ├─ SavedFilters.tsx (saved searches)
  ├─ QuickReports.tsx (one-click reports)
  └─ ExportOptions.tsx (CSV, PDF, Excel)

src/lib/search-utils.ts
  ├─ fuzzySearch()
  ├─ buildQuery()
  ├─ applyFilters()
  └─ exportData()

src/hooks/useAdvancedSearch.ts
```

**Search Across**:
- Vehicles (make, model, year, price, VIN, color)
- Customers (name, phone, email, purchase history)
- Leads (name, vehicle interest, budget)
- Employees (name, role, performance)
- Sales (vehicle, customer, date, amount)
- Transactions (date, amount, description)

**Saved Filters Examples**:
- "Vehicles under 30 days in stock"
- "High-value leads (> €100k)"
- "Overdue payments"
- "Top sales this month"
- "Vehicles needing detail"

**Validation**:
- [x] Search finds results instantly
- [x] Fuzzy matching handles typos
- [x] Filters work correctly
- [x] Export formats accurate
- [x] Saved filters persist
- [x] Performance < 500ms for 100 vehicles

---

### **Days 3-5: Test Drive Management**

**Tasks**:
```
[ ] Create test drive booking system
[ ] Build customer notification system
[ ] Create test drive history
[ ] Implement odometer tracking
[ ] Add customer feedback form
[ ] Create test drive reports
```

**Files to Create**:
```
src/pages/TestDriveManagement.tsx
src/components/TestDrives/
  ├─ TestDriveCalendar.tsx
  ├─ BookTestDriveForm.tsx
  ├─ TestDriveHistory.tsx
  ├─ TestDriveDetails.tsx
  ├─ OdometerTracker.tsx
  ├─ CustomerFeedbackForm.tsx
  └─ TestDriveReports.tsx

src/hooks/useTestDrives.ts
```

**Features**:
- Calendar view of scheduled test drives
- One-click booking
- SMS/Email confirmation
- Automatic reminders (24h, 1h before)
- In-drive notes
- Post-drive feedback form
- Odometer tracking (before/after)
- Result classification (positive/neutral/negative)

---

## 📅 WEEK 3: Inventory Management

### **Days 1-3: Advanced Inventory Module**

**Tasks**:
```
[ ] Build inventory aging reports
[ ] Create vehicle status workflow
[ ] Implement bulk operations
[ ] Add inventory alerts
[ ] Build location tracking system
[ ] Create pricing management dashboard
```

**Files to Create**:
```
src/pages/InventoryManagement.tsx
src/components/Inventory/
  ├─ AgingReport.tsx (0-30, 31-60, 61-90, 90+ buckets)
  ├─ BulkOperations.tsx (bulk status change, pricing, etc.)
  ├─ VehicleStatusBoard.tsx (Kanban-like status view)
  ├─ LocationTracking.tsx (lot + building tracking)
  ├─ InventoryAlerts.tsx (age alerts, missing info)
  ├─ PricingDashboard.tsx (compare to market)
  ├─ VehicleAging.tsx (visual aging report)
  └─ InventoryMetrics.tsx (KPIs - turnover, average age)

src/hooks/useInventory.ts
```

**Reports to Build**:
1. **Aging Report**
   - Bucket vehicles by days in stock
   - Show profit margin by age bucket
   - Identify slow-moving inventory
   - Recommendations for markdown

2. **Turnover Analysis**
   - Average days to sell by model
   - Inventory turnover ratio
   - Revenue per square foot
   - Stock rotation analysis

3. **Pricing Intelligence**
   - Compare to market prices
   - Show markdown opportunities
   - Identify overpriced vehicles
   - Price recommendations

**Bulk Operations**:
- [x] Change status for multiple vehicles
- [x] Update prices (absolute or percentage)
- [x] Move location
- [x] Add to marketing campaign
- [x] Request detail/maintenance
- [x] Change available status

**Validation**:
- [x] Aging buckets calculate correctly
- [x] Bulk operations update all selected
- [x] Alerts trigger for 90+ day vehicles
- [x] Location tracking accurate
- [x] Performance with 100 vehicles

---

### **Days 3-5: Market Price Integration & Pricing Management**

**Tasks**:
```
[ ] Setup AutoScout24 API integration (if available)
[ ] Setup Mobile.de API integration (if available)
[ ] Create market price sync job (daily/weekly)
[ ] Build pricing recommendation engine
[ ] Create price comparison dashboard
[ ] Implement markdown suggestions
```

**Edge Functions**:
```
supabase/functions/market-price-sync/index.ts
- Call AutoScout24 API for current prices
- Call Mobile.de API for market data
- Calculate market average by make/model/year
- Store in market_prices table
- Scheduled daily (e.g., 2 AM)

supabase/functions/pricing-recommendations/index.ts
- Compare own price to market
- Calculate suggested price
- Identify markdown opportunities
- Generate pricing report
```

**Pricing Strategy**:
```
Market Analysis:
├─ Average market price
├─ Price range (min-max)
├─ Days on market average
├─ Inventory count
└─ Trend direction

Recommendation Engine:
├─ If own > market + 10% → REDUCE (suggests amount)
├─ If own < market - 10% → INCREASE (suggests amount)
├─ If days_in_stock > 60 → MARKDOWN (specific %)
├─ If market_trend down → REDUCE (reactive)
└─ If market_trend up → INCREASE (proactive)
```

---

## 📅 WEEK 4: HR Module Begins

### **Days 1-5: Employee Management & Commission System**

**Tasks**:
```
[ ] Build employee management module
[ ] Create role-based permission system
[ ] Implement commission tracking & calculations
[ ] Build performance metrics dashboard
[ ] Create payroll integration framework
[ ] Add leave management
```

**Files to Create**:
```
src/pages/HRDashboard.tsx
src/pages/EmployeeManagement.tsx
src/components/HR/
  ├─ EmployeeForm.tsx
  ├─ EmployeeList.tsx
  ├─ EmployeeDetails.tsx
  ├─ EmployeePerformance.tsx
  ├─ CommissionCalculator.tsx
  ├─ CommissionHistory.tsx
  ├─ PerformanceMetrics.tsx
  ├─ RolePermissions.tsx
  ├─ LeaveManagement.tsx
  ├─ AttendanceTracker.tsx
  └─ PayrollOverview.tsx

src/hooks/useEmployees.ts
src/hooks/useCommissions.ts
src/hooks/usePerformance.ts
```

**Employee Fields**:
```
- First/Last Name
- Email, Phone
- Role (owner, manager, salesperson, accountant, etc.)
- Department
- Position
- Hire Date
- Base Salary
- Commission Structure:
  {
    "base_salary": 2500,
    "commission_rate": 5, // percentage of sale
    "bonus_per_vehicle": 200, // fixed bonus per sale
    "team_bonus_threshold": 15000, // cumulative sales for team bonus
    "performance_bonus": true/false
  }
- Manager (reporting structure)
- Is Active
```

**Commission Calculation**:
```javascript
// Simple calculation
commission = sale_price * (commission_rate / 100) + bonus_per_vehicle

// With tiered rates
if (monthly_sales < 50000) commission_rate = 3%
else if (monthly_sales < 100000) commission_rate = 5%
else commission_rate = 7%

// Team bonus
if (team_total_sales > threshold) {
  team_bonus = (team_total_sales - threshold) * 0.5% / team_size
}
```

**Performance Metrics Dashboard** (for HR Manager):
```
┌──────────────────────────────────────┐
│ TEAM PERFORMANCE (This Month)         │
├──────────────────────────────────────┤
│                                      │
│ 🏆 TOP PERFORMERS                    │
│ 1. John Smith: 8 cars, €45,000       │
│ 2. Maria G: 6 cars, €38,000          │
│ 3. Klaus W: 5 cars, €32,000          │
│                                      │
│ 📊 TEAM METRICS                      │
│ Total Sales: 22 vehicles             │
│ Team Revenue: €185,000               │
│ Avg Sale Price: €8,409               │
│ Conversion Rate: 72%                 │
│                                      │
│ 💰 COMMISSION PAYOUT                 │
│ Pending: €12,450 (5 employees)       │
│ Approved: €8,925 (3 employees)       │
│ Paid: €45,200 (YTD)                  │
│                                      │
└──────────────────────────────────────┘
```

---

## 📅 WEEK 5: Customer Financing System

### **Days 1-5: Complete Customer Financing Module**

**Tasks**:
```
[ ] Build financing options UI
[ ] Create monthly payment calculator
[ ] Implement payment schedule tracker
[ ] Add interest calculation engine
[ ] Create financing approval workflow
[ ] Build payment collection system
[ ] Create financing reports
```

**Files to Create**:
```
src/pages/CustomerFinancing.tsx
src/components/Financing/
  ├─ FinancingCalculator.tsx (main calculator)
  ├─ FinancingForm.tsx (create financing)
  ├─ PaymentSchedule.tsx (display schedule)
  ├─ PaymentTracker.tsx (record payments)
  ├─ FinancingDetails.tsx (view/edit)
  ├─ FinancingDocuments.tsx (generate contracts)
  ├─ ApprovalWorkflow.tsx (approval process)
  ├─ FinancingReports.tsx (reports)
  └─ FinancingAlerts.tsx (overdue, etc.)

src/hooks/useFinancing.ts
src/lib/financing-calculator.ts
```

**Financing Options**:
```
1. CASH
   - 100% paid upfront
   - No interest

2. BANK LOAN
   - Customer arranges with bank
   - We track payment schedule
   - Monthly payment monitoring

3. DEALER FINANCING
   - We provide the financing
   - Define interest rate
   - Generate payment schedule
   - Track collections

4. LEASE
   - Monthly lease payments
   - Residual value
   - Maintenance tracking

5. CREDIT
   - Line of credit for business customers
   - Track balance, usage
   - Payment terms (Net 30/60/90)
```

**Payment Calculator**:
```javascript
function calculatePayment(
  principal,
  monthlyRate,
  numberOfMonths
) {
  return principal * 
    (monthlyRate * (1 + monthlyRate)^numberOfMonths) /
    ((1 + monthlyRate)^numberOfMonths - 1)
}

// Example: €20,000 at 6% APR for 60 months
monthlyRate = 0.06 / 12 = 0.005
payment = 20000 * (0.005 * 1.005^60) / (1.005^60 - 1)
payment ≈ €386.66
```

**Payment Schedule** (what gets displayed):
```
┌─────────────────────────────────┐
│ Payment Schedule                │
├─────────────────────────────────┤
│ Financed Amount:  €20,000.00    │
│ Interest Rate:    6.0% p.a.     │
│ Term:             60 months     │
│ Monthly Payment:  €386.66       │
│ Total Interest:   €1,199.60     │
│ Total Amount:     €21,199.60    │
├─────────────────────────────────┤
│                                 │
│ Payment #1: €386.66 (Due Nov 15)│
│ Payment #2: €386.66 (Due Dec 15)│
│ Payment #3: €386.66 (Due Jan 15)│
│ ... (57 more payments)          │
│                                 │
└─────────────────────────────────┘
```

**Validation**:
- [x] Calculator produces correct payments
- [x] Schedule totals match
- [x] Payment tracking works
- [x] Overdue alerts trigger
- [x] Reports accurate

---

## 📅 WEEKS 6-8: External Integrations

### **Integration Priorities** (Week 6-8):

1. **WhatsApp Business Integration** (Week 6)
2. **AutoScout24 & Mobile.de** (Week 6)
3. **Market Price Sync Job** (Week 6)
4. **Stripe Payment Processing** (Week 7)
5. **Google Maps Integration** (Week 7)
6. **Email/SMS Services** (Week 7)
7. **VIN Decoder API** (Week 8)

[Continue with detailed integration specs in Part 2...]

---

## 📅 WEEK 9-10: Mobile Optimization

### Mobile-First Responsive Design

**Priorities**:
- [ ] Touch-friendly UI (44px minimum touch targets)
- [ ] Simplified navigation (hamburger menu)
- [ ] Optimized dashboards for small screens
- [ ] Mobile-specific workflows
- [ ] Progressive Web App features
- [ ] Offline mode for critical features

---

## 📅 WEEK 11-12: Advanced Reporting & Analytics

### Custom Report Builder

- [ ] Cash Flow Forecasting
- [ ] Profitability Analysis
- [ ] Customer Lifetime Value
- [ ] Sales Forecasting (ML)
- [ ] Aging Reports (all types)
- [ ] Salesperson Rankings

---

## 📅 WEEK 13: Testing & Deployment

### Final QA & Optimization

- [ ] Performance testing (100+ vehicles)
- [ ] Security hardening
- [ ] Load testing
- [ ] Mobile testing
- [ ] User acceptance testing
- [ ] Documentation

---

## 🎯 DELIVERABLES CHECKLIST

**Week 1:**
- ✅ 14 new database tables
- ✅ RLS policies for all roles
- ✅ 5 role-specific dashboards
- ✅ 8 dashboard widgets
- ✅ Role-based access control

**Week 2:**
- ✅ Sales pipeline Kanban board
- ✅ Advanced search system
- ✅ Saved filters
- ✅ Test drive management

**Week 3:**
- ✅ Inventory management module
- ✅ Aging reports
- ✅ Bulk operations
- ✅ Market price integration

**Week 4-5:**
- ✅ HR module
- ✅ Commission tracking
- ✅ Customer financing system
- ✅ Payment scheduling

**Week 6-8:**
- ✅ WhatsApp integration
- ✅ Market price APIs
- ✅ Payment processing
- ✅ All external integrations

**Week 9-10:**
- ✅ Mobile optimization
- ✅ Advanced reports
- ✅ Analytics dashboard

**Week 11-13:**
- ✅ GDPR compliance
- ✅ Performance optimization
- ✅ Documentation
- ✅ Deployment ready

---

**Total Development Time**: ~13 weeks of focused development
**Result**: Enterprise-grade car dealership management platform
**Ready**: For SaaS deployment globally

🚀 **Ready to start Week 1?**
