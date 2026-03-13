# 🎨 Wireframe & Design Concept

## NearbyNode — UI/UX Design Specification

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#2563EB` | Primary actions, links, CTAs |
| `--primary-dark` | `#1D4ED8` | Hover states, active elements |
| `--primary-light` | `#DBEAFE` | Backgrounds, highlights |
| `--secondary` | `#10B981` | Trust indicators, success, badges |
| `--secondary-dark` | `#059669` | Verified states |
| `--secondary-light` | `#D1FAE5` | Trust score backgrounds |
| `--accent` | `#F59E0B` | Warnings, star ratings |
| `--danger` | `#EF4444` | Errors, delete actions |
| `--bg-primary` | `#FFFFFF` | Main background |
| `--bg-secondary` | `#F8FAFC` | Cards, sections |
| `--bg-tertiary` | `#F1F5F9` | Sidebar, muted areas |
| `--text-primary` | `#1E293B` | Headings, body text |
| `--text-secondary` | `#64748B` | Captions, labels |
| `--text-muted` | `#94A3B8` | Placeholder text |
| `--border` | `#E2E8F0` | Card borders, dividers |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 32px / 2rem | 700 (Bold) |
| H2 | Inter | 24px / 1.5rem | 600 (Semi-bold) |
| H3 | Inter | 20px / 1.25rem | 600 |
| Body | Inter | 16px / 1rem | 400 (Regular) |
| Small | Inter | 14px / 0.875rem | 400 |
| Caption | Inter | 12px / 0.75rem | 500 |
| Button | Inter | 14px / 0.875rem | 600 |

### Spacing Scale
`4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px`

### Border Radius
- Small: `6px` (buttons, inputs)
- Medium: `12px` (cards, modals)
- Large: `16px` (hero sections)
- Full: `9999px` (avatars, badges)

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
```

---

## Page Layouts

### 📄 1. Home / Landing Page

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                      │
│  ┌──────┐  ┌──────────────────────┐  [Login] [Register] 🛒  │
│  │ Logo │  │    🔍 Search...      │                          │
│  └──────┘  └──────────────────────┘                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              ┌────────────────────────────┐                  │
│              │     HERO SECTION           │                  │
│              │                            │                  │
│              │  "Buy Local. Trust Smart." │                  │
│              │                            │                  │
│              │  Discover trusted sellers  │                  │
│              │  in your neighborhood      │                  │
│              │                            │                  │
│              │  [Browse Products]  [Sell]  │                  │
│              └────────────────────────────┘                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  HOW IT WORKS                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  📝      │  │  ✅      │  │  🛒      │  │  ⭐      │    │
│  │ Register │  │ Verify   │  │ Buy/Sell │  │ Build    │    │
│  │          │  │ Identity │  │          │  │ Trust    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├──────────────────────────────────────────────────────────────┤
│  FEATURED PRODUCTS                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ [Image]  │  │ [Image]  │  │ [Image]  │  │ [Image]  │    │
│  │ Title    │  │ Title    │  │ Title    │  │ Title    │    │
│  │ ₹Price   │  │ ₹Price   │  │ ₹Price   │  │ ₹Price   │    │
│  │ ⭐ 4.5   │  │ ⭐ 4.2   │  │ ⭐ 4.8   │  │ ⭐ 3.9   │    │
│  │ 🟢Seller │  │ 💎Seller │  │ ⭐Seller │  │ ✅Seller │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├──────────────────────────────────────────────────────────────┤
│  TRUSTED SELLERS                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ [Avatar] │  │ [Avatar] │  │ [Avatar] │                  │
│  │ Name     │  │ Name     │  │ Name     │                  │
│  │ 💎 Elite │  │ ⭐Trusted│  │ ✅Verify │                  │
│  │ 120 sales│  │ 45 sales │  │ 12 sales │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
│  About | Contact | Privacy | Terms       © 2026 NearbyNode  │
└──────────────────────────────────────────────────────────────┘
```

---

### 📄 2. Registration / Login Page

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR (minimal — logo only)                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│         ┌────────────────────────────────┐                   │
│         │        NearbyNode Logo         │                   │
│         │                                │                   │
│         │    Create Your Account         │                   │
│         │                                │                   │
│         │  Full Name                     │                   │
│         │  ┌──────────────────────────┐  │                   │
│         │  │                          │  │                   │
│         │  └──────────────────────────┘  │                   │
│         │                                │                   │
│         │  Email Address                 │                   │
│         │  ┌──────────────────────────┐  │                   │
│         │  │                          │  │                   │
│         │  └──────────────────────────┘  │                   │
│         │                                │                   │
│         │  Password                      │                   │
│         │  ┌──────────────────────────┐  │                   │
│         │  │                    👁    │  │                   │
│         │  └──────────────────────────┘  │                   │
│         │                                │                   │
│         │  Role: ( ) Buyer  ( ) Seller   │                   │
│         │                                │                   │
│         │  [     Create Account      ]   │                   │
│         │                                │                   │
│         │  ── or continue with ──        │                   │
│         │  [G] Google                    │                   │
│         │                                │                   │
│         │  Already have account? Login   │                   │
│         └────────────────────────────────┘                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 📄 3. Seller Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                      │
│  Logo    Search              [Notifications] [Profile] 🛒   │
├────────────┬─────────────────────────────────────────────────┤
│  SIDEBAR   │  MAIN CONTENT                                   │
│            │                                                  │
│  📊 Dash   │  Welcome back, Seller Name!                     │
│  ➕ Add    │                                                  │
│  📦 List   │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  ⭐ Score  │  │ Total    │ │ Active   │ │ Revenue  │       │
│  📋 Orders │  │ Products │ │ Orders   │ │ ₹12,500  │       │
│  ⚙ Settings│  │ 24       │ │ 5        │ │          │       │
│            │  └──────────┘ └──────────┘ └──────────┘       │
│            │                                                  │
│            │  CREDIBILITY SCORE                               │
│            │  ┌────────────────────────────────┐             │
│            │  │ ⭐⭐⭐⭐☆  4.2 / 5.0          │             │
│            │  │ Badge: ⭐ Trusted Seller       │             │
│            │  │ ████████████░░░░  84%          │             │
│            │  │                                │             │
│            │  │ Ratings: 4.5  Txns: 45         │             │
│            │  │ KYC: ✅      Age: 6 months     │             │
│            │  └────────────────────────────────┘             │
│            │                                                  │
│            │  RECENT ORDERS                                   │
│            │  ┌─────────────────────────────────────────┐    │
│            │  │ #1001 │ Product A │ ₹250 │ Delivered  │    │
│            │  │ #1002 │ Product B │ ₹450 │ Shipped    │    │
│            │  │ #1003 │ Product C │ ₹120 │ Pending    │    │
│            │  └─────────────────────────────────────────┘    │
│            │                                                  │
└────────────┴─────────────────────────────────────────────────┘
```

---

### 📄 4. Product Listing Page (Buyer View)

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FILTERS SIDEBAR          PRODUCT GRID                       │
│  ┌──────────┐            ┌──────────┐ ┌──────────┐          │
│  │ Category │            │ [Image]  │ │ [Image]  │          │
│  │ □ Food   │            │ Title    │ │ Title    │          │
│  │ □ Crafts │            │ ₹Price   │ │ ₹Price   │          │
│  │ □ Clothes│            │ ⭐ 4.5   │ │ ⭐ 4.2   │          │
│  │ □ Other  │            │ 💎 Elite │ │ ✅ Verify│          │
│  │          │            │[Add Cart]│ │[Add Cart]│          │
│  │ Price    │            └──────────┘ └──────────┘          │
│  │ ₹0 ──── │                                                │
│  │   ₹5000  │            ┌──────────┐ ┌──────────┐          │
│  │          │            │ [Image]  │ │ [Image]  │          │
│  │ Rating   │            │ Title    │ │ Title    │          │
│  │ ⭐⭐⭐+  │            │ ₹Price   │ │ ₹Price   │          │
│  │          │            │ ⭐ 4.8   │ │ ⭐ 3.9   │          │
│  │ Sort By  │            │ ⭐Trusted│ │ 🆕 New  │          │
│  │ [Price▼] │            │[Add Cart]│ │[Add Cart]│          │
│  └──────────┘            └──────────┘ └──────────┘          │
│                                                              │
│              [1] [2] [3] [4] ... [Next →]                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 📄 5. Product Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌──────────────────────────────┐      │
│  │                  │  │ Product Title                 │      │
│  │   [Product       │  │ ₹499                         │      │
│  │    Image]        │  │                               │      │
│  │                  │  │ ⭐⭐⭐⭐☆ (42 reviews)       │      │
│  │                  │  │                               │      │
│  │  [📷] [📷] [📷] │  │ Description text goes here    │      │
│  └─────────────────┘  │ with detailed information      │      │
│                        │ about the product...           │      │
│                        │                               │      │
│                        │ Category: 🏷 Homemade Food    │      │
│                        │                               │      │
│                        │ Qty: [-] 1 [+]                │      │
│                        │                               │      │
│                        │ [  Add to Cart  ]  [♡ Save]   │      │
│                        └──────────────────────────────────┘      │
│                                                              │
│  SELLER INFO                                                 │
│  ┌──────────────────────────────────────────────────┐       │
│  │ [Avatar] Seller Name  💎 Elite Seller            │       │
│  │ ⭐ 4.7 Credibility  │ 120 Sales │ Joined 2025  │       │
│  │ ✅ Aadhaar Verified  │ ✅ Google │ ✅ Mobile     │       │
│  │ [View Profile]                                   │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  REVIEWS                                                     │
│  ┌──────────────────────────────────────────────────┐       │
│  │ ⭐⭐⭐⭐⭐ — "Excellent product!" — Buyer1      │       │
│  │ ⭐⭐⭐⭐☆ — "Good quality, fast delivery" — B2   │       │
│  │ [Load More Reviews]                              │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 📄 6. Add Product Page (Seller)

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                      │
├────────────┬─────────────────────────────────────────────────┤
│  SIDEBAR   │                                                  │
│            │   Add New Product                                │
│            │                                                  │
│            │   Product Title                                  │
│            │   ┌──────────────────────────────┐              │
│            │   │                              │              │
│            │   └──────────────────────────────┘              │
│            │                                                  │
│            │   Description                                    │
│            │   ┌──────────────────────────────┐              │
│            │   │                              │              │
│            │   │                              │              │
│            │   └──────────────────────────────┘              │
│            │                                                  │
│            │   Price (₹)          Category                    │
│            │   ┌────────────┐    ┌────────────────┐          │
│            │   │            │    │ Select...    ▼ │          │
│            │   └────────────┘    └────────────────┘          │
│            │                                                  │
│            │   Product Image                                  │
│            │   ┌────────────────────────────┐                │
│            │   │                            │                │
│            │   │   📷 Drag & drop or click  │                │
│            │   │      to upload image       │                │
│            │   │                            │                │
│            │   └────────────────────────────┘                │
│            │                                                  │
│            │   [Cancel]  [  Publish Product  ]                │
│            │                                                  │
└────────────┴─────────────────────────────────────────────────┘
```

---

### 📄 7. Admin Verification Panel

```
┌──────────────────────────────────────────────────────────────┐
│  ADMIN NAVBAR                                                │
├────────────┬─────────────────────────────────────────────────┤
│  SIDEBAR   │                                                  │
│            │  Seller Verification Queue                       │
│  📊 Dash   │                                                  │
│  ✅ Verify │  ┌─────────────────────────────────────────┐    │
│  🚩 Flags  │  │ [Av] Seller1  │ Aadhaar: ✅ │ [Approve]│    │
│  👥 Users  │  │               │ Google: ✅  │ [Reject] │    │
│  📦 Products│ └─────────────────────────────────────────┘    │
│  📈 Analytics│                                                │
│            │  ┌─────────────────────────────────────────┐    │
│            │  │ [Av] Seller2  │ Aadhaar: ⏳ │ [Approve]│    │
│            │  │               │ Google: ✅  │ [Reject] │    │
│            │  └─────────────────────────────────────────┘    │
│            │                                                  │
│            │  FLAGGED SELLERS                                 │
│            │  ┌─────────────────────────────────────────┐    │
│            │  │ [Av] Seller5  │ Flags: 3  │ [Suspend] │    │
│            │  │ Reason: Fake products, price gouging     │    │
│            │  └─────────────────────────────────────────┘    │
│            │                                                  │
└────────────┴─────────────────────────────────────────────────┘
```

---

### 📄 8. Shopping Cart & Checkout

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Your Cart (3 items)                                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Img] Product A  │ ₹250 │ Qty: [-] 2 [+] │ ₹500 🗑│   │
│  │ [Img] Product B  │ ₹450 │ Qty: [-] 1 [+] │ ₹450 🗑│   │
│  │ [Img] Product C  │ ₹120 │ Qty: [-] 3 [+] │ ₹360 🗑│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│                              ┌─────────────────────┐        │
│                              │ Subtotal:    ₹1,310 │        │
│                              │ Delivery:    ₹50    │        │
│                              │ ──────────────────  │        │
│                              │ Total:       ₹1,360 │        │
│                              │                     │        │
│                              │ [Proceed to Checkout]│        │
│                              └─────────────────────┘        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Library

### Reusable Components

| Component | Description | Props |
|-----------|------------|-------|
| `Navbar` | Top navigation with search, auth, cart | `isLoggedIn, userRole, cartCount` |
| `Footer` | Bottom navigation with links | — |
| `ProductCard` | Product display card | `product, onAddToCart` |
| `TrustBadge` | Seller credibility badge | `level, score` |
| `Sidebar` | Dashboard sidebar navigation | `activeItem, role` |
| `StarRating` | Interactive star rating | `rating, onRate, readonly` |
| `SearchBar` | Debounced search input | `onSearch, placeholder` |
| `CategoryFilter` | Category checkbox filter | `categories, selected, onChange` |
| `ImageUpload` | Drag-and-drop image uploader | `onUpload, preview` |
| `StatusBadge` | Verification status indicator | `status` (pending/verified/rejected) |
| `CredibilityMeter` | Visual credibility score display | `score, breakdown` |
| `OrderCard` | Order summary card | `order` |

---

## Interaction & Animation Specs

| Element | Animation | Duration |
|---------|-----------|----------|
| Page transitions | Fade in | 300ms |
| Card hover | Scale 1.02 + shadow elevation | 200ms |
| Button hover | Background darken + slight lift | 150ms |
| Toast notifications | Slide in from top-right | 400ms |
| Modal open | Scale from 0.95 + fade | 250ms |
| Loading states | Skeleton placeholder shimmer | Continuous |
| Badge reveal | Pop-in with bounce | 500ms |
| Score update | Counter animation (count up) | 1000ms |

---

*Document Version: 1.0*
*Last Updated: March 2, 2026*
