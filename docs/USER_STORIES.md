# 📋 User Stories & Feature List

## NearbyNode — Prioritized Feature Breakdown

---

## 🔥 Priority 1 — Core Marketplace (MVP Must-Have)

### 👤 US-01: User Registration & Authentication

| ID | User Story | Acceptance Criteria |
|----|-----------|-------------------|
| US-01a | As a **user**, I want to sign up with my email so I can create an account | Email validation, password strength check, success confirmation |
| US-01b | As a **user**, I want to sign in with email/password so I can access my account | JWT token issued, redirect to dashboard |
| US-01c | As a **user**, I want my password to be securely stored | Passwords hashed with bcrypt (min 10 salt rounds) |
| US-01d | As a **user**, I want to stay logged in across sessions | JWT stored in httpOnly cookie or localStorage with refresh |
| US-01e | As a **user**, I want to log out securely | Token invalidated, redirect to home |

**Technical Requirements:**
- JWT authentication with access + refresh tokens
- bcrypt password hashing
- Input validation (express-validator)
- Protected route middleware

---

### 🧑 US-02: Seller Onboarding

| ID | User Story | Acceptance Criteria |
|----|-----------|-------------------|
| US-02a | As a **seller**, I want to create a seller profile so I can start selling | Profile form with name, description, location, business type |
| US-02b | As a **seller**, I want to submit basic KYC (Aadhaar) so buyers trust me | Aadhaar number input, mock verification API call |
| US-02c | As a **seller**, I want to see my verification status | Status displayed: Pending → Verified → Rejected |
| US-02d | As a **seller**, I want to upload a profile photo | Image upload via Cloudinary/Firebase |
| US-02e | As a **seller**, I want to add my business address and type | Free-text address + category dropdown |

**Technical Requirements:**
- Seller profile model with verification fields
- KYC sandbox API integration (Sandbox.co.in)
- File upload middleware (multer)
- Verification status enum: PENDING, VERIFIED, REJECTED

---

### 🛒 US-03: Product Listing Management

| ID | User Story | Acceptance Criteria |
|----|-----------|-------------------|
| US-03a | As a **seller**, I want to add a new product | Form: title, description, price, image, category |
| US-03b | As a **seller**, I want to upload product images | Image preview + upload to cloud storage |
| US-03c | As a **seller**, I want to set product price and category | Price validation, category selection from predefined list |
| US-03d | As a **seller**, I want to edit my existing products | Pre-filled edit form, save changes |
| US-03e | As a **seller**, I want to delete a product listing | Confirm dialog, soft delete with status update |
| US-03f | As a **seller**, I want to see all my listed products | Paginated list with status indicators |

**Technical Requirements:**
- Product CRUD API endpoints
- Image upload + optimization
- Pagination (limit/offset or cursor-based)
- Seller ownership validation middleware

---

### 🛍 US-04: Buyer Experience

| ID | User Story | Acceptance Criteria |
|----|-----------|-------------------|
| US-04a | As a **buyer**, I want to browse all products | Product grid with cards, lazy loading |
| US-04b | As a **buyer**, I want to search products by name/category | Search bar with debounced API calls |
| US-04c | As a **buyer**, I want to see seller credibility score on product cards | Trust badge + numeric score visible |
| US-04d | As a **buyer**, I want to view product details | Detail page with images, description, seller info |
| US-04e | As a **buyer**, I want to add products to cart | Cart state management, quantity controls |
| US-04f | As a **buyer**, I want to checkout (mock payment) | Order summary, address input, confirmation |
| US-04g | As a **buyer**, I want to view my order history | List of past orders with status |

**Technical Requirements:**
- Product search with filtering + sorting
- Cart management (localStorage or DB-backed)
- Order model with status tracking
- Responsive product grid layout

---

## 🔥 Priority 2 — Trust & Reputation System

### ⭐ US-05: Rating & Credibility System

| ID | User Story | Acceptance Criteria |
|----|-----------|-------------------|
| US-05a | As a **buyer**, I want to rate a seller (1-5 stars) after purchase | Star rating UI, submit review |
| US-05b | As a **buyer**, I want to leave a text review | Comment field with character limit |
| US-05c | As a **seller**, I want to see my credibility score | Calculated from ratings + transactions + KYC |
| US-05d | As a **buyer**, I want to see seller badge level | Visual badge: New → Verified → Trusted → Elite |
| US-05e | As a **seller**, I want my score to improve with successful transactions | Auto-recalculation after each completed order |

**Credibility Score Formula:**
```
Score = (Avg Rating × 0.4) + (Successful Transactions × 0.3) + (KYC Level × 0.2) + (Account Age × 0.1)
```

**Badge Levels:**
| Badge | Score Range | Requirements |
|-------|-----------|-------------|
| 🆕 New Seller | 0 - 2.0 | Just registered |
| ✅ Verified Seller | 2.1 - 3.5 | KYC completed |
| ⭐ Trusted Seller | 3.6 - 4.5 | 10+ successful transactions |
| 💎 Elite Seller | 4.6 - 5.0 | 50+ transactions, 4.5+ avg rating |

---

### 🔍 US-06: Behavior Monitoring

| ID | User Story | Acceptance Criteria |
|----|-----------|-------------------|
| US-06a | As a **buyer**, I want to flag a suspicious seller | Report button with reason selection |
| US-06b | As an **admin**, I want flagged sellers' scores to auto-reduce | -0.5 score per verified flag |
| US-06c | As an **admin**, I want to restrict repeated offenders | Auto-suspend after 3 verified flags |
| US-06d | As an **admin**, I want to review flagged sellers | Admin panel with flag queue |

---

## 🔥 Priority 3 — Advanced Features (Post-MVP)

### 🤖 US-07: Smart Features

| ID | User Story | Priority |
|----|-----------|---------|
| US-07a | As a **buyer**, I want personalized product recommendations | P3 |
| US-07b | As an **admin**, I want a comprehensive admin dashboard | P3 |
| US-07c | As an **admin**, I want fraud analytics and reports | P3 |
| US-07d | As a **buyer**, I want to report a product listing | P3 |
| US-07e | As an **admin**, I want to moderate reviews | P3 |
| US-07f | As a **buyer**, I want real-time chat with sellers | P4 |
| US-07g | As a **user**, I want the app in my local language | P4 |

---

## Feature Dependency Map

```
Registration → Seller Onboarding → Product Listing
     ↓                                    ↓
  Login/Auth                        Buyer Browsing
     ↓                                    ↓
  JWT Tokens                        Cart & Checkout
                                          ↓
                                    Order Completion
                                          ↓
                                   Rating & Reviews
                                          ↓
                                  Credibility Scoring
                                          ↓
                                    Badge Assignment
```

---

*Document Version: 1.0*
*Last Updated: March 2, 2026*
