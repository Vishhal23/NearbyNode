# 🎯 Claude Code Master Prompt

## NearbyNode — AI Development Blueprint

Use this prompt with Claude Code or any AI coding assistant to generate the full project.

---

## Master Prompt

```
You are building a full-stack web application called NearbyNode.

PROJECT DESCRIPTION:
NearbyNode is a trust-driven C2C (Consumer-to-Consumer) marketplace platform that enables
local and micro-business sellers to sell products online WITHOUT requiring mandatory trade
licenses (GST, etc.). The platform builds buyer trust through multi-level KYC verification,
dynamic credibility scoring, behavior-based monitoring, and a badge system — instead of
relying on strict legal documentation.

TECH STACK:
- Frontend: React.js 18 (Vite), Tailwind CSS 3, React Router v6, Axios
- Backend: Node.js 20, Express.js 4, JWT authentication, bcryptjs
- Database: MongoDB with Mongoose ODM
- Image Storage: Cloudinary
- KYC: Sandbox.co.in API (mock Aadhaar verification)

ARCHITECTURE:
- Frontend: Component-based with Context API for state management
- Backend: MVC (Model-View-Controller) pattern
- API: RESTful with consistent JSON response format
- Auth: JWT with access tokens (7 days) + refresh tokens (30 days)

PAGES TO BUILD:
1. Landing/Home Page - Hero section, featured products, trusted sellers, how it works
2. Register Page - Email signup with role selection (Buyer/Seller)
3. Login Page - Email/password login
4. Buyer Home - Product grid with filters (category, price, rating), search, pagination
5. Product Detail - Full product info, seller trust card, reviews, add to cart
6. Shopping Cart - Cart items, quantity controls, order summary, checkout
7. Seller Dashboard - Analytics cards, credibility score meter, recent orders, badge status
8. Add Product - Form with title, description, price, category, image upload
9. My Listings - Seller's products with edit/delete actions
10. Seller Profile (Public) - Seller info, verification status, trust badges, products, reviews
11. Admin Panel - User management, seller verification queue, flagged seller review

REUSABLE COMPONENTS:
- Navbar (responsive, auth-aware, cart count)
- Footer (links, copyright)
- ProductCard (image, title, price, seller badge, add to cart)
- TrustBadge (New/Verified/Trusted/Elite with icons and colors)
- Sidebar (dashboard navigation)
- StarRating (interactive + readonly modes)
- SearchBar (debounced search)
- CredibilityMeter (visual score with breakdown)
- StatusBadge (pending/verified/rejected)
- ImageUpload (drag & drop)
- Skeleton loaders for all data-heavy components

DATABASE MODELS:
1. User - name, email, password (hashed), role (buyer/seller/admin), KYC fields,
   credibility score, badge level, verification status, business info
2. Product - title, description, price, imageUrl, category, seller (ref User),
   status, stock, views
3. Review - rating (1-5), comment, buyer (ref User), seller (ref User),
   product (ref Product), isVerifiedPurchase
4. Order - buyer (ref User), items (product, seller, qty, price), totals,
   shipping address, status, payment status
5. Flag - reporter (ref User), seller (ref User), reason, description, status

CREDIBILITY SCORING SYSTEM:
Formula: Score = (Avg Rating × 0.4) + (Transaction Success Rate × 0.3) + (KYC Level × 0.2) + (Account Age × 0.1)
Badge Levels:
- New Seller: Score 0 - 2.0
- Verified Seller: Score 2.1 - 3.5 (KYC completed)
- Trusted Seller: Score 3.6 - 4.5 (10+ successful transactions)
- Elite Seller: Score 4.6 - 5.0 (50+ transactions, 4.5+ avg rating)

API ENDPOINTS:
Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
Users: GET /api/users/:id, PUT /api/users/:id, POST /api/users/kyc
Products: CRUD at /api/products, GET /api/products/search?q=
Reviews: GET /api/reviews/seller/:id, POST /api/reviews
Orders: POST /api/orders, GET /api/orders/my, PUT /api/orders/:id/status
Admin: GET /api/admin/users, PUT /api/admin/verify/:id, GET /api/admin/flags

DESIGN REQUIREMENTS:
- Modern, clean, professional aesthetic
- Blue (#2563EB) and Green (#10B981) trust-focused color scheme
- Inter font from Google Fonts
- Rounded cards with soft shadows
- Mobile-first responsive design
- Skeleton loading states
- Smooth micro-animations (hover, transitions, page fade-in)
- Trust badges and verification icons prominently displayed
- Consistent 8px spacing grid

CODE QUALITY:
- Functional React components only
- async/await for all async operations
- Input validation on both frontend and backend
- Centralized error handling
- Consistent API response format: { success, data, message, error }
- Environment variables for all secrets
- Proper HTTP status codes
- ESLint + Prettier configured

FOLDER STRUCTURE:
frontend/src/
  components/ (common/, product/, seller/, cart/, admin/)
  pages/
  services/ (api.js, authService.js, productService.js, etc.)
  context/ (AuthContext.jsx, CartContext.jsx)
  hooks/
  utils/

backend/src/
  config/
  controllers/
  middleware/ (auth.js, roleCheck.js, validate.js, errorHandler.js)
  models/
  routes/
  services/
  utils/

Please generate the complete project code following these specifications.
Start with the backend (models, routes, controllers, middleware) then the frontend
(pages, components, services, context).
```

---

## Quick Start Commands

### After code generation:

```bash
# Backend setup
cd backend
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv helmet morgan
npm install express-validator express-rate-limit multer cloudinary
npm install -D nodemon

# Frontend setup
cd frontend
npm create vite@latest . -- --template react
npm install react-router-dom axios react-hot-toast react-icons
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Run the project:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## Step-by-Step Development Plan

### Phase 1: Foundation (Week 1-2)
1. Initialize frontend (Vite + React + Tailwind)
2. Initialize backend (Express + Mongoose)
3. Set up MongoDB Atlas connection
4. Create User model with authentication
5. Build auth routes (register, login, me)
6. Build Login & Register pages
7. Implement JWT auth context
8. Build Navbar and Footer
9. Set up protected routes

### Phase 2: Core Features (Week 3-4)
10. Create Product model
11. Build Product CRUD API
12. Build Add Product page (seller)
13. Build Product listing page (buyer)
14. Build Product detail page
15. Build Search & filter functionality
16. Create Cart context & functionality
17. Build Cart page
18. Build Checkout page
19. Create Order model & API

### Phase 3: Trust System (Week 5-6)
20. Create Review model & API
21. Build Star Rating component
22. Build Seller Profile page (public)
23. Implement credibility scoring service
24. Build TrustBadge component
25. Build CredibilityMeter component
26. Implement seller KYC flow
27. Create Flag model & API
28. Build report seller functionality

### Phase 4: Admin & Polish (Week 7-8)
29. Build Admin panel (user management)
30. Build Seller verification queue
31. Build Flagged seller review
32. Add skeleton loading states
33. Add micro-animations
34. Mobile responsiveness pass
35. Error boundary & 404 pages
36. Testing & bug fixes
37. Deploy to Vercel + Render
38. Connect custom domain

---

*Document Version: 1.0*
*Last Updated: March 2, 2026*
