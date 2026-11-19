# Level 2: Growth Store

> **Everything from Level 1 + loyalty, warranties, and customer engagement features**

---

## 📋 At a Glance

| Question | Answer |
|----------|--------|
| **Who is it for?** | Growing stores ready to build loyalty and handle more customer support |
| **Monthly cost** | ৳7,200–14,400 ($58–116) |
| **Additional one-time** | None (uses Level 1 infrastructure) |
| **Per order** | Same as Level 1 + warranty tracking overhead |
| **Time to upgrade** | 2-3 days configuration + staff training |
| **Prerequisites** | Level 1 running + commitment to customer service |

**In short:** Level 1 + loyalty points system, comprehensive warranty management, advanced customer dashboard, and deeper analytics.

---

## 🆕 What's New in Level 2

### For Customers

✅ **Loyalty Points System** - Earn on every purchase, redeem at checkout  
✅ **Membership Tiers** - Silver, Gold, Platinum, Diamond with visible progress  
✅ **Warranty Management** - Track coverage, file claims with photo evidence  
✅ **Enhanced Dashboard** - Spending analytics, savings charts, transaction history  
✅ **Delivery Response** - Confirm receipt, report issues, request returns  
✅ **Advanced Notifications** - Warranty updates, points earned, tier upgrades  

### For Admins

✅ **Warranty Claims Desk** - Review claims, approve/reject, extend coverage  
✅ **Points Management** - Manual adjustments, tier overrides, expiry rules  
✅ **Customer Analytics** - Lifetime value, repeat purchase rate, churn risk  
✅ **Advanced Reports** - Cohort analysis, RFM segmentation, customer journeys  
✅ **Email Composer** - Send branded emails directly to customers  
✅ **Notification Center** - Unified inbox for all platform events  

---

## 💎 Loyalty Points System

### How It Works

```
EARNING
Customer buys ৳500 worth of products
→ Earns 500 points (1 point = ৳1 spent)
→ Credited on delivery (not at checkout)

REDEMPTION
Customer has 1,000 points
→ Can redeem as ৳10 discount (100 points = ৳1)
→ Minimum redemption: 100 points
→ Maximum: Can cover product cost only (not shipping)
```

### Membership Tiers

| Tier | Points Required | Badge | Benefits |
|------|----------------|-------|----------|
| 🥈 **Silver** | 0 - 999 | Entry tier | Basic member benefits |
| 🥇 **Gold** | 1,000 - 3,999 | Mid tier | Priority support |
| 💎 **Platinum** | 4,000 - 9,999 | Premium | Early access to deals |
| 💎 **Diamond** | 10,000+ | Elite | VIP treatment |

### Points Rules

**Earning:**
- 1 point per ৳1 spent (after discounts)
- Rounded down (৳147.50 → 147 points)
- Credited only after successful delivery
- Revoked if order cancelled/returned

**Redemption:**
- 100 points = ৳1 discount
- Applied before checkout
- Can only cover product total (not shipping)
- Non-refundable once spent

**Expiry:**
- Points valid for 1 year from earning date
- 30-day warning before expiry
- Auto-removal of expired points

**Admin Controls:**
- Manual point adjustments (with reason logging)
- Tier overrides for VIP customers
- Bulk point grants for promotions
- Points expiry policy configuration

---

## 🛡️ Warranty Management

### 5 Warranty Types

| Type | Who Handles | Can Extend? | Description |
|------|------------|-------------|-------------|
| **Manufacturer** | Brand | ❌ | Factory warranty handled by brand service center |
| **Seller** | Platform | ❌ | Store-provided warranty, repairs/replacements by you |
| **Extended** | Platform | ✅ | Paid extra coverage beyond standard (extendable 3x) |
| **Other** | Per Terms | ❌ | Custom warranty with specific terms |
| **None** | Nobody | ❌ | No warranty coverage |

### Warranty Lifecycle

```
Purchase → Delivery → Warranty Issued
                         ↓
                    [ACTIVE]
                         ↓
              Customer Files Claim
              (with photos + description)
                         ↓
                  [CLAIM SUBMITTED]
                         ↓
              Admin Reviews Claim
                         ↓
         ┌───────────────┴───────────────┐
         ↓                               ↓
    [UNDER REVIEW]                  [RESOLVED]
         ↓                               ↓
  Approve/Reject                    Complete
         ↓
    [EXPIRED/RESOLVED]
```

### Customer Warranty Panel

**What Customers See:**
- Warranty status badge (Active/Expired/Claimed)
- Coverage type and duration
- Start date and expiry date
- Days remaining counter
- Terms and conditions
- Claim history (if filed)

**Filing a Claim:**
- Reason selection (dropdown)
- Problem description (text)
- Photo evidence (up to 5 images)
- Submit once per warranty
- Email confirmation sent

### Admin Warranty Desk

**Claims Management:**
- Filter by: Status, Type, Product, Date range
- Search by: Order ID, Customer name, Product
- Bulk actions: Approve, Reject, Archive

**Per-Claim Actions:**
- Mark Under Review
- Request More Information
- Approve Claim → Generate return label
- Reject Claim → Send reason to customer
- Extend Coverage (Extended warranties only, max 3x)
- Email Customer (with pre-filled template)

**Extension Rules:**
- Only "Extended Warranty" type can be extended
- Maximum 3 extensions per warranty
- 1-60 months per extension
- Requires reason (logged in history)
- Customer notified by email

**Reporting:**
- Claims by status (funnel chart)
- Claims by product (identify problem items)
- Resolution time averages
- Customer satisfaction scores

---

## 📊 Enhanced Customer Dashboard

### Overview Tab

**Visual Analytics:**
- Spending trends chart (last 12 months)
- Savings breakdown (discounts, points, coupons)
- Order status pipeline
- Membership tier progress bar

**Quick Stats:**
- Total orders
- Total spent
- Points balance
- Current tier
- Active warranties
- Pending reviews

### Transactions Tab

**Complete Payment History:**
- All transactions with receipts
- Filter by: Method, Status, Date
- Sort by: Newest, Oldest, Amount
- Search by: Order ID, Transaction ID
- Download receipt as PDF

**Transaction Details:**
- Receipt number
- Order number
- Payment method
- Amount charged
- Points used/earned
- Status with timestamp
- Download PDF receipt

### Analytics Tab (NEW)

**Personal Insights:**
- Monthly spending trends
- Category preferences
- Average order value
- Repeat purchase items
- Seasonal patterns
- Savings from loyalty

**Downloadable Reports:**
- Spending summary (PDF)
- Transaction history (CSV)
- Points ledger (CSV)
- Warranty records (PDF)

---

## 📈 Advanced Admin Analytics

### Customer Insights

**Segmentation:**
- New vs Returning customers
- High-value vs Low-value
- Active vs At-risk
- Loyal vs One-time

**Metrics:**
- Customer Lifetime Value (CLV)
- Repeat Purchase Rate
- Average Order Value
- Customer Acquisition Cost
- Churn rate by cohort

### Product Performance

**Beyond Sales:**
- Return rate per product
- Warranty claim rate
- Review sentiment analysis
- Price elasticity data
- Cross-sell opportunities

### Cohort Analysis

Track customer groups by:
- Sign-up month
- First purchase month
- Tier achieved
- Retention over time

### RFM Analysis

Segment customers by:
- **Recency** - Last purchase date
- **Frequency** - Purchase count
- **Monetary** - Total spent

**Auto-generated segments:**
- Champions (best customers)
- Loyal customers
- At-risk (need re-engagement)
- Lost (win-back campaigns)

---

## 🔔 Notification Center

### Platform Activity Feed

**Real-time notifications for:**
- New orders placed
- Payments received
- Claims filed
- Reviews submitted
- Low stock alerts
- User sign-ups
- Account deletions

**For Customers:**
- Order status updates
- Delivery notifications
- Warranty expiry warnings
- Points earned/redeemed
- Tier upgrades
- Promotions

**Features:**
- Unread badge counter
- Mark as read/unread
- Search notifications
- Filter by type
- Date range selection
- Desktop push notifications (optional)

### Email Composer

**Send branded emails directly:**
- Pre-filled templates for common scenarios
- Warranty updates
- Order issues resolution
- Custom messages
- Merge tags: {customer_name}, {order_id}, etc.
- Email preview before send
- Delivery tracking (sent/bounced/opened)

---

## 💼 Customer Data Management

### Enhanced Profile

**Additional Fields:**
- Date of birth (for birthday campaigns)
- Phone number (for SMS)
- Preferred contact method
- Communication preferences

### Privacy Controls

**Customer Can:**
- Export complete data (JSON format)
- Request data deletion
- Manage email preferences
- Control notification settings
- Download invoice history

**Data Includes:**
- Profile information
- Order history
- Transaction records
- Points ledger
- Warranty records
- Reviews written
- Saved addresses
- Wishlist items
- Cart contents

---

## 📧 Enhanced Email System

### Automated Emails (NEW)

**Warranty-Related:**
- Warranty issued (on delivery)
- Claim received confirmation
- Claim status update
- Coverage expiry reminder (30 days)
- Extension granted notification

**Points-Related:**
- Points earned (after delivery)
- Points redeemed (after order)
- Tier upgrade achieved
- Points expiring soon (30 days)

**Engagement:**
- Welcome email (new customers)
- Order anniversary
- Win-back campaign (inactive users)
- Birthday discount (if DOB provided)

### Email Templates

**Branded Design:**
- Store logo and colors
- Consistent typography
- Responsive layout
- Social media links
- Unsubscribe link

**Customizable:**
- Subject lines
- Body content
- Call-to-action buttons
- Footer text

---

## 🎨 Enhanced Customization

### New Branding Options

**Customer Dashboard Themes:**
- Choose accent colors
- Custom tier badge designs
- Dashboard layout preferences

**Email Customization:**
- HTML email templates
- Custom header/footer
- Personalization tokens

---

## 🔒 Additional Security

### Fraud Detection

**Monitoring:**
- Multiple failed login attempts
- Unusual order patterns
- High-value orders from new accounts
- Mismatched shipping/billing addresses

**Actions:**
- Auto-flag suspicious orders
- Require admin approval
- Request additional verification
- Block repeat offenders

### Warranty Fraud Prevention

**Checks:**
- Product must be delivered
- One claim per warranty
- Photo evidence required
- Serial number verification (if applicable)

---

## 📊 Enhanced Reporting

### Available Reports

**Customer Reports:**
- Customer acquisition trends
- Lifetime value distribution
- Cohort retention rates
- RFM segmentation
- Points liability (outstanding)

**Warranty Reports:**
- Claims by product
- Claims by type
- Resolution time metrics
- Extension history
- Claim fraud patterns

**Financial Reports:**
- Revenue with points impact
- Warranty costs
- Refund/return rates
- Payment method breakdown

### Export Formats

- **CSV** - Detailed data tables
- **PDF** - Visual charts + summary
- **Excel** - Pivot-ready data
- **JSON** - API integration

---

## 🚀 Technical Enhancements

### Performance

**Database Optimization:**
- Indexed queries for analytics
- Cached dashboard data
- Efficient point calculations
- Warranty status precomputed

**Frontend Improvements:**
- Lazy loading for charts
- Virtual scrolling for large lists
- Optimized image loading
- Code splitting per route

### Scalability

**Handles:**
- 100+ orders/day
- 10,000+ registered customers
- 50,000+ warranty records
- 1M+ points transactions

---

## 💰 Cost Breakdown

### Monthly Costs (Level 2)

| Service | Level 1 | Level 2 | Increase |
|---------|---------|---------|----------|
| **Hosting** | ৳0–3,600 | ৳3,600–7,200 | 100% |
| **Database** | ৳0–1,200 | ৳2,400–3,600 | 200% |
| **Email** | ৳0–1,200 | ৳1,200–2,400 | 100% |
| **Storage** | Free | ৳0–1,200 | New |
| **Total** | ৳3,600–7,200 | ৳7,200–14,400 | 100% |

**Why the increase:**
- More database reads/writes (points, warranties)
- Higher email volume (automated campaigns)
- Additional storage (warranty photos, analytics data)

### Per-Order Costs

**Same as Level 1:**
- Payment gateway: 1.5–2.9%
- Courier: ৳70–160
- SMS: ৳0.53–0.57

**Additional:**
- Warranty tracking overhead (included)
- Points calculation (included)
- Email notifications (included)

---

## ⏱️ Upgrade Timeline

**Day 1: Configuration**
- Enable loyalty system
- Configure points rules
- Set up warranty types
- Customize email templates

**Day 2: Data Migration**
- Import existing customer data
- Backfill historical orders for points
- Assign initial tiers
- Issue past warranties

**Day 3: Training & Launch**
- Staff training on warranty desk
- Test loyalty flows
- Soft launch to subset
- Monitor and adjust

**Day 4-7: Optimization**
- Fine-tune points rules
- Adjust tier thresholds
- Optimize email deliverability
- Gather customer feedback

---

## 📈 Success Metrics

### Track These KPIs

**Loyalty Program:**
- Points redemption rate
- Tier distribution
- Repeat purchase rate
- Average days between orders

**Warranty Management:**
- Claims per 100 orders
- Average resolution time
- Customer satisfaction (post-resolution)
- Warranty cost as % of revenue

**Customer Engagement:**
- Email open rates
- Notification click-through
- Dashboard active users
- Data export requests

---

## 🎯 Perfect For

✅ Stores with 50-200 orders/day  
✅ Building customer loyalty programs  
✅ Selling products with warranties  
✅ Growing customer base (1,000-10,000)  
✅ Focus on repeat customers  
✅ Ready for advanced analytics  
✅ Strong customer service commitment  

---

## ❌ What's Still NOT Included

These come in Level 3:

❌ Multi-vendor marketplace  
❌ Vendor subscriptions  
❌ Rider delivery system  
❌ Discount coupons  
❌ Featured promotions  
❌ Advanced inventory management  
❌ SMS campaigns  
❌ Live chat support  

---

## ✅ Upgrade Checklist

Before upgrading from Level 1:

- [ ] Level 1 stable and running smoothly
- [ ] At least 100 orders completed
- [ ] Staff trained on customer support
- [ ] Customer service email monitored daily
- [ ] Budget approved for higher hosting tier
- [ ] Points rules defined
- [ ] Warranty terms written
- [ ] Email templates designed
- [ ] Analytics goals identified

---

## 📚 Training Resources

**For Staff:**
- Warranty desk walkthrough (video + PDF)
- Points management guide
- Email composer tutorial
- Analytics dashboard guide

**For Customers:**
- How to earn/redeem points
- Filing warranty claims
- Understanding membership tiers
- Reading your analytics

---

## 🆘 Support & Maintenance

**Included in Level 2:**
- ✅ All Level 1 support
- ✅ Loyalty system support
- ✅ Warranty desk training
- ✅ Analytics consultation
- ✅ Email template customization

**Not Included:**
- ❌ Custom loyalty rules beyond provided
- ❌ Manual warranty processing (you review via desk)
- ❌ Marketing campaign management
- ❌ Customer service staffing

---

## 📞 Getting Help

**Documentation:**
- Loyalty system guide
- Warranty management manual
- Analytics playbook
- Email best practices

**Support Channels:**
- Email support (24-48h response)
- Video tutorials
- FAQ database
- Community forum

---

**Level 2 = Growth Store**  
Build lasting customer relationships with loyalty, warranties, and insights.

Previous: [Level 1 - Core Store](./LEVEL-1-CORE-STORE.md)  
Next: [Level 3 - Full Platform](./LEVEL-3-FULL-PLATFORM.md) adds multi-vendor marketplace and delivery system.
