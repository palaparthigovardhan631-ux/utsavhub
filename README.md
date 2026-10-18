# 🎪 UtsavHub — Multi-Vendor Catering & Event Services Marketplace

[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo%20SDK-52-000020?logo=expo&logoColor=white)](https://expo.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment%20Gateway-0C2340?logo=razorpay&logoColor=white)](https://razorpay.com)
[![Android Play Store Ready](https://img.shields.io/badge/Android-Google%20Play%20Ready-34A853?logo=google-play&logoColor=white)](https://play.google.com)

A 100% production-ready, fully functional multi-vendor catering and event services marketplace app built with **React Native & Expo**, backed by **Supabase PostgreSQL** with strict Row Level Security (RLS) policies, real-time WebSocket messaging, cloud storage for vendor portfolios, and a dual-tier subscription engine with **live Razorpay hooks** and **Direct Bank Transfer (IMPS/NEFT/UPI) verification**.

---

## 🌟 Key Features & Architectural Modules

### 1. Dual-Role Authentication & Protected Routing
- **Dual Personas:** Dedicated account creation and login for **Clients** (*"I want to book events"*) vs. **Vendors** (*"I am an event service provider"*).
- **Strict Role-Based Guards:** Vendors cannot enter client-only checkout dashboards; clients cannot access vendor lead management or catalog editing.
- **Supabase Auth Integration:** Email/Password and session caching across native mobile (`AsyncStorage`) and web.

### 2. Client Marketplace (E-Commerce Style)
- **Home Feed & Category Filtering:** Dynamic category tabs for **Catering & Food**, **Band Mela & Dhol**, **Tent & Hangars**, **Shamiana & Drapes**, **Lighting**, **Decoration**, **Sound & DJ**, and **Photography**.
- **Real-Time Search:** Search bar filtering live partners by service name, specialties, and city (e.g., Delhi NCR, Mumbai, Jaipur, Bengaluru).
- **Vendor Detail Portfolio:** Image showcase, verified partner trust badges, itemized pricing packages, and menus (Silver, Gold Shahi Feast, Imperial Maharaja Banquet).
- **Direct Communication:**
  - **Click-to-Call Button:** Direct integration with the native phone dialer via the `tel:` protocol.
  - **Real-Time In-App Messaging:** Live bidirectional chat per booking lead synchronized over Supabase Realtime WebSockets.
- **Interactive Booking Checkout:** Event type picker, event date selection, guest count estimator, custom notes, and live quotation calculation writing directly to the `bookings` database table.

### 3. Vendor Business Hub & Subscription Gate
- **Monthly Subscription Gate:**
  - Vendors without an active subscription (`is_subscribed: false`) are restricted from public catalog listings and cannot receive new leads.
  - Subscription Renewal Modal with two payment channels:
    1. **Razorpay Payment Gateway:** Instant activation hook updating `subscription_expires_at` in the database.
    2. **Direct Bank Transfer (IMPS/NEFT/UPI):** Displays the platform's official bank details (Account Name, Account Number, IFSC, UPI ID, and QR code) and provides a UTR / Reference ID submission audit trail.
- **Vendor Lead Manager:**
  - Live incoming booking inquiries with instant **Accept** or **Reject** triggers.
  - Real-time updates directly reflected in both the vendor lead dashboard and the client's booking tracker.
- **Business Profile & Catalog Manager:**
  - Full CRUD manager for business identity, address, phone, and services.
  - Cloud image uploads to the Supabase Storage bucket `vendor-portfolio`.
  - Dynamic JSON Pricing Package editor (add, edit, and delete tiers).
  - Settlement Bank Account Manager (Bank Name, Account Holder, Account Number, IFSC, UPI ID) for receiving client advances and platform payouts.

---

## 🗄️ Database Architecture & Setup

The database uses PostgreSQL on Supabase with Row Level Security (RLS) policies.

### Tables
1. `profiles`: Extends `auth.users` with `role` (`client` | `vendor`), name, and contact details.
2. `vendors`: Stores business catalog, category, address, pricing packages (JSONB), portfolio images (ARRAY), subscription status, and bank settlement details.
3. `bookings`: Real-world event inquiries linking clients to vendors with status (`pending`, `confirmed`, `cancelled`, `completed`), guest counts, and estimated budgets.
4. `chats`: Real-time WebSocket-synchronized chat messages per booking lead.
5. `subscription_transactions`: Audit log of Razorpay orders and direct bank transfer UTR submissions.

### Applying the Schema to Your Supabase Instance
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy and run the contents of [`schema.sql`](./schema.sql).
4. Run [`seed.sql`](./seed.sql) to populate authentic sample catering and event vendor profiles across all categories.

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and fill in your genuine credentials:

```bash
cp .env.example .env
```

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Razorpay Payment Gateway Hook
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourKeyHere

# Platform Official Subscription Bank Details
EXPO_PUBLIC_PLATFORM_BANK_NAME=HDFC Bank
EXPO_PUBLIC_PLATFORM_BANK_ACCOUNT=50200084920194
EXPO_PUBLIC_PLATFORM_BANK_IFSC=HDFC0001234
EXPO_PUBLIC_PLATFORM_BANK_HOLDER=UtsavHub Marketplace Pvt Ltd
EXPO_PUBLIC_PLATFORM_UPI_ID=utsavhub@okhdfcbank
EXPO_PUBLIC_SUBSCRIPTION_MONTHLY_PRICE=1499
```

---

## 📱 Running & Testing the App

### 1. Interactive Web Preview
```bash
npm run web
```
This runs the Metro web bundler and opens the responsive mobile viewport in your browser.

### 2. Run on Android Device / Expo Go
```bash
npm start
```
Scan the displayed QR code with the **Expo Go** app on your Android device.

---

## 🚀 Building for Google Play Store (Android APK / AAB)

UtsavHub is configured with package `com.utsavhub.app` and production Android permissions in `app.json`.

To build an Android App Bundle (AAB) ready for Google Play Store upload:

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Configure the build:
   ```bash
   eas build:configure
   ```
4. Build the production Android App Bundle (AAB):
   ```bash
   eas build --platform android --profile production
   ```
   *EAS Build compiles the native Android bundle in the cloud and provides a direct `.aab` download link ready for the Google Play Console!*

To generate a standalone `.apk` for direct testing on an Android phone:
```bash
eas build --platform android --profile preview
```

---

## 📤 Pushing to GitHub

To push this codebase to your GitHub repository:

```bash
# 1. Initialize git (already completed locally)
git add .
git commit -m "Initial commit: Production-ready UtsavHub multi-vendor marketplace app"

# 2. Add your GitHub remote repository URL
git remote add origin https://github.com/<YOUR_USERNAME>/utsavhub.git

# 3. Push to main branch
git branch -M main
git push -u origin main
```

---

## 📄 License
MIT License. Built for production deployment by UtsavHub Marketplace.
