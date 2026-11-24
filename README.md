<div align="center">

# ⚡ Sparq

**Modern Electronics E-Commerce Platform**

Full-stack marketplace with multi-vendor support, loyalty system, and comprehensive admin controls

[![Live Demo](https://img.shields.io/badge/Demo-Live-success?style=flat-square)](https://sparq-electronics.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js_16-black?style=flat-square&logo=next.js)](https://github.com/demoprojectbdsoft/Sparq-Electronics-Store)
[![Backend](https://img.shields.io/badge/Backend-Express_5-green?style=flat-square&logo=express)](https://github.com/demoprojectbdsoft/Sparq-Server)

</div>

---

## 📖 Table of Contents

1. [What is Sparq?](#what-is-sparq)
2. [Key Features](#key-features)
3. [How It Works](#how-it-works)
4. [Tech Stack](#tech-stack)
5. [Quick Start](#quick-start)
6. [Project Structure](#project-structure)
7. [Environment Setup](#environment-setup)
8. [Development](#development)
9. [Deployment](#deployment)
10. [Demo Accounts](#demo-accounts)

---

## What is Sparq?

Sparq is a **production-ready e-commerce platform** for electronics with complete multi-vendor marketplace capabilities. Everything is database-driven - no hardcoded content.

### At a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    SPARQ PLATFORM                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👥 CUSTOMERS          🏪 VENDORS         👨‍💼 ADMIN          │
│  • Browse & Shop       • Sell Products   • Manage Platform │
│  • Track Orders        • Fulfillment     • Site Settings   │
│  • Reviews             • Analytics       • Reports         │
│  • Loyalty Points      • Coupons         • Users           │
│  • Warranties          • Promotions      • Support         │
│                                                             │
│  🛵 RIDERS             🧪 DEMO ADMIN                        │
│  • Deliveries          • Sandbox Mode                      │
│  • Earnings            • Auto-Restore                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 🛍️ For Customers

- **Smart Shopping**: Search, filters, comparison (up to 3 products)
- **Flexible Browsing**: Pagination OR infinite scroll
- **Checkout Options**: COD, bKash, Rocket, Nagad
- **Loyalty Rewards**: Earn & redeem points (1 point = $1 spent)
- **Order Tracking**: Real-time status with delivery map
- **Reviews**: Star ratings + photos
- **Warranties**: File claims with photo evidence
- **Saved Addresses**: Up to 5 addresses with default
- **Data Export**: Download your data as JSON

### 🏪 For Vendors (Multi-Vendor)

- **Own Storefront**: Custom branding at `/stores/your-shop`
- **Product Management**: With plan limits (10/50/unlimited)
- **Order Fulfillment**: Accept → Process → Ready → Ship
- **Discount Coupons**: Create codes for your products
- **Featured Promotions**: Buy slots to feature products
- **Sales Analytics**: Revenue, top products, commission tracking
- **Subscription Plans**: Free, Basic ($29/mo), Pro ($99/mo)

### 🛵 For Riders

- **Delivery Jobs**: Accept requests, track deliveries
- **Live Tracking**: GPS location sharing
- **Earnings Dashboard**: Total, monthly, per-delivery stats
- **Order History**: Completed and cancelled deliveries

### 👨‍💼 For Admins

- **Complete Control**: Products, categories, orders, users
- **CMS Branding**: Logos, colors, fonts, content - no redeploy
- **User Management**: Role assignment, per-role suspension
- **Vendor Control**: Approve applications, grant promotions
- **Support Tools**: Warranties, reviews, contact messages
- **Reports & Analytics**: CSV + PDF exports with charts
- **Maintenance Mode**: Close site for customers, keep admin access

### 🧪 Demo Admin (Sandbox)

- **Safe Exploration**: Edit products, categories, reviews freely
- **Protected Data**: Cannot change users, orders, site settings
- **Auto Restore**: All changes reverted daily at midnight

---

## How It Works

### System Overview

```
Browser                    Frontend (Next.js)              Backend (Express)        Database
   │                              │                              │                      │
   │────── Login ────────────────►│                              │                      │
   │                              │──── Generate JWT ───────────►│                      │
   │                              │                              │                      │
   │◄──── JWT Token ──────────────│                              │                      │
   │                              │                              │                      │
   │────── Shop/Order ───────────►│                              │                      │
   │                              │──── API + JWT ──────────────►│                      │
   │                              │                              │──── Verify JWT ─────►│
   │                              │                              │                      │
   │                              │                              │◄──── User Data ──────│
   │                              │                              │                      │
   │                              │                              │──── Process ────────►│
   │                              │◄──── Response ───────────────│                      │
   │◄──── Display ────────────────│                              │                      │
```

### Authentication Flow

1. **User logs in** → Frontend (better-auth)
2. **JWT generated** → Stored in browser
3. **API request** → JWT sent with every request
4. **Backend verifies** → Via JWKS endpoint (no shared secret)
5. **Authorization** → Role checked on every endpoint
6. **Fresh roles** → Always read from DB, never cached in token

### Order Processing

```
Place Order                                              Delivered
    │                                                         │
    ├─ Validate stock                                        ├─ Mark payment success
    ├─ Redeem points (atomic)                                ├─ Credit loyalty points
    ├─ Calculate totals (server-side)                        ├─ Update sell counts
    ├─ Create order + transaction                            └─ Issue warranties
    ├─ Decrement stock
    ├─ Clear cart
    └─ Split into vendor groups (if multi-vendor)

Status Flow:  confirmed → processing → shipped → delivered
                   │            │         │
                   └────────────┴─────────┴──────► cancelled
```

### Multi-Vendor Order Splitting

When a customer orders from multiple vendors:

```
Customer Cart:
  - Product A (Vendor X)
  - Product B (Vendor X)  
  - Product C (Vendor Y)
  - Product D (Platform)
          │
          ▼
    One Payment
    One Order ID
          │
          ├──► VendorOrder (Vendor X) → Products A + B
          ├──► VendorOrder (Vendor Y) → Product C
          └──► Parent Order → Product D (platform stock)
```

Each vendor manages their own group independently, but delivery is coordinated by platform.

### Loyalty Points System

```
EARNING:  $147.50 order → 147 points credited on delivery
          (1 point per $1 spent, rounded down)

REDEMPTION: 100 points = $1 discount
            Minimum: 100 points
            Maximum: Product total (shipping always paid in cash)

TIERS:
  🥈 Silver:   0 - 999 points
  🥇 Gold:     1,000 - 3,999 points  
  💎 Platinum: 4,000 - 9,999 points
  💎 Diamond:  10,000+ points
```

### Warranty System

**5 Types:**
- **Manufacturer**: Brand handles repairs
- **Seller**: Platform handles repairs  
- **Extended**: Extra coverage (can extend up to 3 times)
- **Other**: Custom terms
- **None**: No coverage

**Lifecycle:**  
`Issued on Delivery` → `Active` → `Claim Filed` → `Under Review` → `Resolved/Rejected`

### Discount Coupons (Two-Level System)

```
ADMIN COUPONS (Store-Wide)          VENDOR COUPONS (Shop-Specific)
        │                                    │
        ├─ Any product/category              ├─ Only vendor's products
        ├─ Created by platform               ├─ Created by vendor
        └─ Applies to full cart              └─ Only their items discounted

Both types:
  • Percentage (1-100%) or Fixed amount
  • Optional: min order, max discount, usage limits
  • Date range with auto expiry
  • Per-customer limits
```

### Dynamic Branding (CMS)

Everything controlled from admin dashboard:

```
SITE SETTINGS
  ├─ Identity: Name, tagline, SEO meta
  ├─ Typography: Google Fonts selection
  ├─ Theme: 8 industry palettes + custom color creator
  ├─ Logos: Light/dark variants, favicon
  ├─ Shipping: Fees, thresholds, delivery estimates
  ├─ Contact: Phone, email, hours, social links
  └─ System: Currency, timezone, maintenance mode

All changes take effect immediately - no redeploy needed.
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16.2 (App Router), React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4, HeroUI v3
- **Auth**: better-auth 1.7 (JWT + MongoDB adapter)
- **Charts**: Recharts
- **PDF**: jsPDF (client-side)
- **Maps**: Leaflet + OpenStreetMap

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 5.2
- **Language**: TypeScript (CommonJS)
- **Database**: MongoDB 7 + Mongoose 9
- **Validation**: Zod 4
- **Auth**: jose-cjs (JWKS verification)
- **Email**: Nodemailer (SMTP)
- **Jobs**: node-cron + Vercel Cron

### Infrastructure
- **Hosting**: Vercel (frontend + backend serverless)
- **Database**: MongoDB Atlas
- **Images**: ImgBB CDN
- **Email**: SMTP (Gmail compatible)

---

## Quick Start

### Prerequisites

```bash
✓ Node.js 20+
✓ MongoDB (Atlas or local)
✓ SMTP credentials (for emails)
✓ ImgBB API key (for uploads)
```

### 1. Clone & Install

```bash
# Clone frontend
git clone https://github.com/demoprojectbdsoft/Sparq-Electronics-Store.git
cd Sparq-Electronics-Store
npm install

# Clone backend (separate terminal)
git clone https://github.com/demoprojectbdsoft/Sparq-Server.git
cd Sparq-Server
npm install
```

### 2. Configure Backend First

Create `sparq-server/.env.local`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017
DATABASE=sparq

# Server
PORT=5000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000

# Security
INTERNAL_API_KEY=your_random_32_char_key_here
CRON_SECRET=your_random_32_char_key_here

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=your-email@gmail.com

# Demo
DEMO_ADMIN_EMAIL=demoadmin@example.com
```

### 3. Configure Frontend

Create `sparq/.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_random_32_char_secret
JWT_SECRET=your_random_32_char_secret

# Database (same as backend)
MONGODB_URI=mongodb://localhost:27017
DATABASE=sparq

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Internal Key (MUST match backend)
INTERNAL_API_KEY=your_random_32_char_key_here

# Image Uploads
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

### 4. Start Both Servers

```bash
# Terminal 1: Backend
cd sparq-server
npm run dev
# Runs at http://localhost:5000

# Terminal 2: Frontend  
cd sparq
npm run dev
# Runs at http://localhost:3000
```

### 5. Test It!

Open http://localhost:3000 and:
1. Register a customer account
2. Browse products
3. Add to cart & checkout
4. Check admin dashboard (create admin via MongoDB)

---

## Project Structure

```
sparq/
├── src/
│   ├── app/                          # Next.js 16 App Router
│   │   ├── (auth)/auth/              # Login, register, password reset
│   │   ├── (dashboard)/dashboard/    # Role-based dashboards
│   │   │   ├── admin/                # Platform management
│   │   │   ├── customer/             # Customer portal
│   │   │   ├── vendor/               # Seller workspace
│   │   │   └── rider/                # Delivery management
│   │   ├── (main)/                   # Public storefront
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── shop/                 # Product catalog
│   │   │   ├── stores/               # Vendor storefronts
│   │   │   ├── cart/                 # Shopping cart
│   │   │   ├── checkout/             # Checkout flow
│   │   │   └── ...                   # Other public pages
│   │   ├── api/auth/[...all]/        # better-auth endpoints
│   │   ├── maintenance/              # Maintenance page
│   │   └── proxy.ts                  # Middleware (maintenance gate)
│   │
│   ├── components/
│   │   ├── dashboard/                # Dashboard components
│   │   ├── homepage/                 # Homepage sections
│   │   ├── shared/                   # Reusable UI
│   │   ├── shop/                     # Shopping components
│   │   └── vendor/                   # Vendor components
│   │
│   ├── lib/
│   │   ├── api/                      # Server-side API clients
│   │   ├── action/                   # Server actions (mutations)
│   │   ├── core/                     # Core utilities
│   │   ├── auth.ts                   # better-auth config
│   │   ├── compare.ts                # Product comparison
│   │   ├── csvExport.ts              # CSV reports
│   │   ├── dashboardPdf.ts           # PDF reports with charts
│   │   └── ...                       # Other utilities
│   │
│   ├── types/                        # TypeScript definitions
│   ├── context/                      # React contexts
│   └── hooks/                        # Custom hooks
│
├── public/                           # Static assets
├── .env.local                        # Environment (DO NOT COMMIT)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Environment Setup

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `BETTER_AUTH_SECRET` | Signs JWT tokens | 32+ random chars |
| `BETTER_AUTH_URL` | Frontend URL | `http://localhost:3000` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017` |
| `DATABASE` | Database name | `sparq` |
| `INTERNAL_API_KEY` | Shared with backend | Match backend value |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Image uploads |

### Important Notes

- ⚠️ **Never commit `.env.local`** to git
- ⚠️ **`INTERNAL_API_KEY` must match backend** exactly
- ⚠️ **Rebuild after changing `NEXT_PUBLIC_*`** variables
- ⚠️ **Emails sent by backend** - configure SMTP there
- ⚠️ **Restrict `next/image` hosts** - `next.config.ts` currently allows any
  `https` host, so the image optimizer can fetch an arbitrary URL. Narrow
  `images.remotePatterns` to your own CDN/hosts before going live.
- ⚠️ **Keep the document URL the API returns** - application documents are read
  through a signed link, so store `payload.data.url` from `/api/documents`
  as-is instead of rebuilding it.

---

## Development

### Available Scripts

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
```

### Development Workflow

**Server Components** (default)
- Fetch data directly from API
- No client state management needed
- Example: Product listing, order history

**Client Components** (`"use client"`)
- Interactive UI elements
- Named `*Client.tsx` by convention
- Example: Cart button, wishlist toggle

**Server Actions** (`"use server"`)
- Handle mutations (add to cart, place order)
- Located in `lib/action/`
- Automatic revalidation

### Adding a Feature

1. Define types in `src/types/`
2. Create API client in `src/lib/api/` (if reading data)
3. Create server action in `src/lib/action/` (if mutating)
4. Build components in `src/components/`
5. Create page in `src/app/`
6. Add backend route (see backend README)

---

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**
3. **Set environment variables** (all from `.env.local`)
4. **Deploy**

### Production Checklist

- [ ] Set production `NEXT_PUBLIC_API_URL`
- [ ] Generate strong `BETTER_AUTH_SECRET` and `JWT_SECRET`
- [ ] Configure MongoDB Atlas whitelist
- [ ] Set up Google OAuth (production credentials)
- [ ] Update `INTERNAL_API_KEY` (match backend)
- [ ] Test all user flows
- [ ] Verify maintenance mode works
- [ ] Check mobile responsiveness

### Important URLs

After deployment, update:
- `BETTER_AUTH_URL` → Your Vercel URL
- `NEXT_PUBLIC_API_URL` → Your backend URL
- Google OAuth redirect → Your Vercel URL

---

## Demo Accounts

### Test Users

**Customer**
- Register at `/auth/register`
- Full shopping experience

**Admin**
- Create via MongoDB: `db.users.updateOne({email: "..."}, {$set: {role: "admin"}})`
- Access all dashboards

**Demo Admin**
- Email configured in backend `DEMO_ADMIN_EMAIL`
- Sandbox mode with auto-restore

**Vendor**
- Apply at `/become-a-vendor`
- Admin must approve application

### Test Payments

**Cash on Delivery**: Works immediately  
**Mobile Wallets**: Enter any transaction ID (demo mode)

---

## Implementation Status

### ✅ Currently Implemented

| Feature | Status |
|---------|--------|
| **Core Platform** ||
| Public Storefront | ✅ Complete |
| Shopping Cart & Checkout | ✅ Complete |
| Customer Dashboard | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| Dynamic CMS/Branding | ✅ Complete |
| Demo Admin Mode | ✅ Complete |
| **Loyalty & Points** ||
| Points System | ✅ Complete |
| Earn/Redeem at Checkout | ✅ Complete |
| Membership Tiers | ✅ Complete |
| **Marketplace** ||
| Multi-Vendor Platform | ✅ Complete |
| Vendor Dashboard | ✅ Complete |
| Subscription Plans | ✅ Complete |
| Order Splitting | ✅ Complete |
| Commission System | ✅ Complete |
| **Delivery** ||
| Rider Dashboard | ✅ Complete |
| Delivery Assignment | ✅ Complete |
| GPS Tracking | ✅ Complete |
| **Marketing** ||
| Discount Coupons | ✅ Complete |
| Featured Promotions | ✅ Complete |
| Activity Notifications | ✅ Complete |

### 📋 Future Enhancements (On Demand)

| Feature | Description |
|---------|-------------|
| **Warranty Claims** | Full claim processing system |
| **Payment Gateways** | Stripe, SSLCommerz, cryptocurrency |
| **Real-Time** | WebSocket, live chat, push notifications |
| **Mobile Apps** | React Native (iOS + Android) |
| **Security** | Rate limiting, Helmet.js, Redis caching |
| **DevOps** | Docker, Kubernetes, CI/CD pipeline |
| **AI/ML** | Product recommendations, fraud detection |
| **International** | Multi-currency, i18n, global shipping |

---

## Documentation

- **[Level 1 Docs](./docs/LEVEL-1-CORE-STORE.md)** - Core store features
- **[Level 2 Docs](./docs/LEVEL-2-GROWTH-STORE.md)** - Loyalty & growth
- **[Level 3 Docs](./docs/LEVEL-3-FULL-PLATFORM.md)** - Full marketplace
- **[Backend API](https://github.com/demoprojectbdsoft/Sparq-Server)** - API documentation

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

**Guidelines:**
- Follow existing code structure
- Use TypeScript with proper types
- Test thoroughly
- Update documentation

---

## Support & Links

- **Backend Docs**: [Sparq-Server README](https://github.com/demoprojectbdsoft/Sparq-Server)
- **Issues**: [GitHub Issues](https://github.com/demoprojectbdsoft/Sparq-Electronics-Store/issues)
- **Live Demo**: [sparq-electronics.vercel.app](https://sparq-electronics.vercel.app)

---

## License

MIT License - See [LICENSE](LICENSE)

---

<div align="center">

**Built with ❤️ by [BD Soft](https://github.com/demoprojectbdsoft)**

⚡ Sparq - Better products. A brighter you.

</div>
