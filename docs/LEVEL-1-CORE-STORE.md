# Level 1: Core Store

> **The features every online shop needs, explained simply**

---

## 📋 At a Glance

| Question | Answer |
|----------|--------|
| **Who is it for?** | One owner, one warehouse, a few orders a day, mostly cash on delivery |
| **Monthly cost** | ৳3,600–7,200 ($29–58) |
| **One-time cost** | Domain ৳950–2,099, payment gateway setup from ৳4,999 |
| **Per order** | Gateway 1.5–2.9%, courier ৳70–160, SMS ৳0.53–0.57 |
| **Time to launch** | 1–2 weeks (mostly gateway paperwork) |
| **Prerequisites** | Trade license and bank account in business name |

**In short:** A complete shop for one owner — storefront, customer accounts, admin dashboard, orders, payments, security, and automated daily tasks.

---

## 🛍️ What the Shopper Sees

### Public Pages

| Page | What It Does |
|------|-------------|
| **Home** | Hero slider, popular products, trending items, warehouse deals, new arrivals, promo banners, brand logos, newsletter signup |
| **Shop** | Search, filters, sorting, pagination OR infinite scroll (shopper chooses) |
| **Product Page** | Photo gallery, specifications, warranty terms, ratings, reviews, add to cart/wishlist/compare |
| **Compare** | Up to 3 products side-by-side with full specification table (works for guests) |
| **Cart & Wishlist** | Change quantity, remove items, view subtotal, stock validation; both saved per customer |
| **Checkout** | Address input, delivery options, payment methods, save address option |
| **Order Success** | Order number, total, estimated delivery, tracking timeline |
| **Order Tracking** | Real-time status updates with delivery timeline |
| **Delivery Response** | Customer confirms: received / still waiting / cancel order |
| **Store Locator** | All store addresses, areas, and contact details on interactive map |
| **Company Pages** | About, Services, Privacy, Terms, Contact (all branded from settings) |
| **Help Pages** | FAQ, Returns, Support, Customer Service (linked from footer/menu) |
| **Maintenance** | Branded pause screen when shop is closed for maintenance |

### Universal Features

Every page includes:

- ✅ **Database-driven branding** - Name, fonts, colors, logos, favicon changed via dashboard (no redeploy)
- ✅ **Dark/light theme** - Automatic system detection + manual toggle
- ✅ **Live category menu** - Desktop mega-menu, mobile drawer
- ✅ **Multi-currency & language** - Per-customer display preferences
- ✅ **PWA (Installable app)** - Install to home screen on mobile/desktop
- ✅ **SEO optimized** - Meta titles, descriptions, share images, sitemap, robots.txt
- ✅ **Performance optimized** - Image sizes, lazy loading, caching for fast mobile experience

---

## 👤 What the Customer Gets

| Feature | Description |
|---------|-------------|
| **Saved Addresses** | Up to 5 addresses, one default, one-tap selection at checkout |
| **Reviews** | Star rating + text + up to 5 photos; rating calculated from real reviews only |
| **Order History** | All orders with status, tracking, and invoice download |
| **Notifications** | Inbox of order updates, shipping notifications, delivery confirmations |
| **Buy Again** | Quick re-add past purchases to cart |
| **Invoice PDF** | Download invoice for any order |
| **Sign-In Options** | Email/password OR Google OAuth (one-click) |
| **Account Settings** | Currency, language, notifications, data export, account deletion |
| **Password Security** | Changing password signs out all other devices |
| **Data Export** | Download complete account data as JSON |
| **Account Deletion** | Permanent deletion with confirmation (requires password + typing "DELETE") |

---

## 🛠️ What the Owner Gets

### Admin Dashboard

| Area | Capabilities |
|------|-------------|
| **Overview** | Revenue, orders, customers, best sellers, recent orders; daily KPIs at top |
| **Analytics** | Profit by day/week/month/year, cost breakdown, product engagement, CSV/PDF exports |
| **Products & Categories** | Add/edit/delete with photos, badges, optional stock tracking; sell count & profit per product |
| **Home Slider & Banners** | Slides from real products + 2 promo blocks with live preview |
| **Orders & Transactions** | Search, filter, status management, customer response tracking, complete payment records |
| **Users & Roles** | User management, role assignment, account status control |
| **Reviews** | Moderation, approve/reject, delete inappropriate content |
| **Messages** | Contact form submissions with delivery status (email sent/failed) |
| **Notifications** | Store bell for new orders, low stock alerts, moderation needs |
| **Profile** | Staff member details, password management |
| **Settings** | 8-tab control panel for entire store appearance and behavior |
| **Maintenance Mode** | Pause shop for customers while staff continue working |

### Settings - 8 Control Tabs

1. **Identity & Meta** - Site name, tagline, SEO titles/descriptions
2. **Typography** - Google Fonts selection for body and headings
3. **Theme & Palettes** - Industry-specific color schemes + custom palette creator
4. **Shipping & Delivery** - Fees, thresholds, delivery estimates
5. **Top Bar & Layout** - Announcement bar, custom action links
6. **Logos & Media** - Light/dark logos, favicon, brand wordmark
7. **Contact & Socials** - Phone, email, address, social links, opening hours
8. **System & Security** - Currency, timezone, maintenance mode toggle

---

## 🔐 User Roles & Permissions

| Role | Access Level |
|------|-------------|
| **Guest** | Browse, search, compare, read reviews, add to cart, send contact messages |
| **Customer** | All guest actions + place orders, track shipments, write reviews after delivery, export data |
| **Admin** | Full platform control: products, prices, orders, users, reports, settings |
| **Demo Admin** | Catalog editing only (sandboxed; changes auto-restored daily) |

---

## 🔒 Security Features

### Authentication
- ✅ Email/password with bcrypt hashing
- ✅ Google OAuth integration
- ✅ JWT-based sessions
- ✅ Password reset via email (1-hour expiry)
- ✅ Session revocation on password change

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Route guards (frontend + backend)
- ✅ Ownership checks (users see only their data)
- ✅ Admin-only actions protected

### Data Protection
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (MongoDB/Mongoose)
- ✅ XSS protection (React auto-escaping)
- ✅ HTTPS enforcement (production)
- ✅ Secure cookies (HttpOnly, SameSite)

---

## 💳 Payment & Shipping

### Payment Methods
- **Cash on Delivery (COD)** - Standard for Bangladesh market
- **Mobile Wallets** - bKash, Rocket, Nagad (with transaction ID)
- **Payment Gateway Ready** - Integration points for Stripe/SSLCommerz

### Shipping Options
- **Standard Delivery** - Configurable fee + estimated days
- **Express Delivery** - Higher fee, faster delivery
- **Free Shipping** - Above configurable threshold
- **Courier Integration** - ৳70-160 per order

### Transaction Tracking
- Every order creates transaction record
- Status: Pending → Success / Failed
- COD marked successful on delivery
- Complete audit trail

---

## 📧 Email Notifications

**Automated emails via SMTP:**
- Order confirmation
- Order status updates
- Delivery notifications
- Password reset links
- Contact form acknowledgments

**Branded templates:**
- Store logo and colors
- Consistent typography
- Responsive design
- Fallback fonts for email clients

---

## 🎨 Customization Without Code

### Brand Identity
Change instantly from admin dashboard:
- Site name and tagline
- Logo (light/dark variants)
- Favicon
- Color palette (8 industry presets + custom)
- Typography (curated Google Fonts)

### Content Management
- Homepage slider (product-based)
- Promo banners (2 zones)
- About page content
- Opening hours
- Contact information
- Social media links

### Behavior Settings
- Default browse mode (pagination/infinite scroll)
- Shipping fees and thresholds
- Currency and timezone
- Announcement bar text
- Maintenance mode

**No deployment required** - All changes take effect immediately.

---

## 📊 Reports & Analytics

### Available Reports
- **Revenue** - By day, week, month, year
- **Orders** - Status breakdown, totals
- **Products** - Best sellers, profit/loss per item
- **Customers** - New signups, activity

### Export Formats
- **CSV** - For Excel/Sheets analysis
- **PDF** - With charts and branding

### Real-Time Metrics
Dashboard shows live:
- Today's revenue
- Pending orders
- Low stock alerts
- Recent customer activity

---

## 🚀 Technical Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- HeroUI v3

### Backend
- Express 5
- Node.js 20+
- MongoDB 7
- Mongoose 9

### Infrastructure
- Vercel (hosting)
- MongoDB Atlas (database)
- ImgBB (image CDN)
- SMTP (email delivery)

---

## ⚙️ Automated Daily Tasks

**Runs automatically via cron jobs:**
- Demo admin data restoration
- Low stock alerts
- Order status updates
- Email queue processing
- Database cleanup

**No manual intervention required** - System maintains itself.

---

## 📈 What's NOT in Level 1

These features come in higher tiers:

❌ Multi-vendor marketplace  
❌ Loyalty points system  
❌ Warranty management  
❌ Discount coupons  
❌ Advanced analytics  
❌ Rider delivery system  
❌ Subscription plans  
❌ SMS notifications  
❌ Real-time chat  
❌ Inventory forecasting  

**Level 1 focuses on:** Getting a professional store online quickly with essential features.

---

## 🎯 Perfect For

✅ Small businesses starting online  
✅ Single-location stores  
✅ Electronics/gadget shops  
✅ Local retailers expanding to web  
✅ Stores with 5-50 orders/day  
✅ Primarily COD payment model  

---

## 💰 Cost Breakdown

### One-Time Costs
- Domain name: ৳950–2,099/year
- SSL certificate: Free (Let's Encrypt)
- Payment gateway setup: ৳4,999+

### Monthly Costs
- Hosting (Vercel): ৳0–3,600 ($0–29)
- Database (MongoDB Atlas): ৳0–1,200 ($0–10)
- Image CDN (ImgBB): ৳0–1,200 ($0–10)
- Email (SMTP): ৳0–1,200 ($0–10)

**Total: ৳3,600–7,200/month ($29–58)**

### Per-Order Costs
- Payment gateway: 1.5–2.9%
- Courier: ৳70–160
- SMS: ৳0.53–0.57

---

## ⏱️ Launch Timeline

**Week 1:**
- Day 1-2: Deploy frontend + backend
- Day 3-4: Configure branding, add products
- Day 5: Test checkout flow
- Day 6-7: Gateway paperwork begins

**Week 2:**
- Day 8-10: Payment gateway approval (usually slowest)
- Day 11-12: Final testing (orders, payments, emails)
- Day 13-14: Soft launch + monitoring

**Blockers:**
- Trade license requirement
- Bank account in business name
- Payment gateway approval (2-7 days)

---

## 📞 Support & Maintenance

**Included:**
- Bug fixes
- Security updates
- Performance optimization
- Technical support

**Not Included:**
- Content updates (you manage via dashboard)
- Custom feature development
- Third-party integrations
- Design changes

---

## ✅ Ready to Launch Checklist

Before going live:

- [ ] Domain purchased and DNS configured
- [ ] MongoDB Atlas account created
- [ ] SMTP email configured
- [ ] ImgBB API key obtained
- [ ] Products added with images
- [ ] Categories created
- [ ] Shipping fees configured
- [ ] Payment methods tested
- [ ] About/Contact pages filled
- [ ] Test orders completed
- [ ] Mobile responsiveness verified
- [ ] Email deliverability tested

---

**Level 1 = Core Store**  
Everything you need to sell online professionally, nothing you don't.

Next: [Level 2 - Growth Store](./LEVEL-2-GROWTH-STORE.md) adds loyalty, warranties, and advanced features.
