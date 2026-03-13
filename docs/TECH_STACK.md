# ⚙️ Tech Stack Definition

## NearbyNode — Technical Architecture

---

## Stack Overview

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                  │
│                                                      │
│   React.js + Tailwind CSS + React Router + Axios     │
│                                                      │
├──────────────────────────────────────────────────────┤
│                    API LAYER                          │
│                                                      │
│   Node.js + Express.js + JWT + express-validator      │
│                                                      │
├──────────────────────────────────────────────────────┤
│                    DATABASE                           │
│                                                      │
│   MongoDB (Mongoose ODM) / PostgreSQL (Prisma ORM)   │
│                                                      │
├──────────────────────────────────────────────────────┤
│                EXTERNAL SERVICES                     │
│                                                      │
│   Cloudinary (Images) │ Sandbox.co.in (KYC)          │
│   Firebase (Auth opt) │ SendGrid (Email opt)         │
│                                                      │
├──────────────────────────────────────────────────────┤
│                 DEPLOYMENT                           │
│                                                      │
│   Vercel (FE) │ Render/Railway (BE) │ MongoDB Atlas  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React.js** | 18.x | UI component library |
| **Vite** | 5.x | Build tool & dev server |
| **React Router** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Axios** | 1.x | HTTP client for API calls |
| **React Hot Toast** | 2.x | Toast notifications |
| **React Icons** | 4.x | Icon library |
| **React Hook Form** | 7.x | Form management |
| **Zustand** / **Context API** | — | State management |

### Frontend Folder Structure
```
frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/              # Static assets (images, fonts)
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Navbar, Footer, SearchBar, etc.
│   │   ├── product/         # ProductCard, ProductGrid, etc.
│   │   ├── seller/          # SellerCard, TrustBadge, etc.
│   │   ├── cart/            # CartItem, CartSummary, etc.
│   │   └── admin/           # AdminTable, VerificationCard, etc.
│   ├── pages/               # Page-level components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── BuyerHome.jsx
│   │   ├── SellerDashboard.jsx
│   │   ├── AddProduct.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── SellerProfile.jsx
│   │   └── AdminPanel.jsx
│   ├── services/            # API service layer
│   │   ├── api.js           # Axios instance configuration
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── userService.js
│   │   └── kycService.js
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useCart.js
│   ├── utils/               # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x LTS | Runtime environment |
| **Express.js** | 4.x | Web framework |
| **Mongoose** | 8.x | MongoDB ODM |
| **JWT** (jsonwebtoken) | 9.x | Authentication tokens |
| **bcryptjs** | 2.x | Password hashing |
| **express-validator** | 7.x | Input validation |
| **multer** | 1.x | File upload handling |
| **cloudinary** | 1.x | Cloud image storage |
| **cors** | 2.x | Cross-origin requests |
| **dotenv** | 16.x | Environment variables |
| **helmet** | 7.x | Security headers |
| **morgan** | 1.x | HTTP request logging |
| **express-rate-limit** | 7.x | Rate limiting |

### Backend Folder Structure (MVC Architecture)
```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.js            # MongoDB connection
│   │   ├── cloudinary.js    # Cloudinary config
│   │   └── env.js           # Environment variables
│   ├── controllers/         # Route handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── userController.js
│   │   ├── reviewController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # JWT verification
│   │   ├── roleCheck.js     # Role-based access control
│   │   ├── upload.js        # File upload middleware
│   │   ├── validate.js      # Input validation
│   │   └── errorHandler.js  # Global error handler
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Review.js
│   │   ├── Order.js
│   │   └── Flag.js
│   ├── routes/              # Express routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── userRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── orderRoutes.js
│   │   └── adminRoutes.js
│   ├── services/            # Business logic layer
│   │   ├── credibilityService.js
│   │   ├── kycService.js
│   │   └── emailService.js
│   ├── utils/               # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── apiResponse.js
│   └── app.js               # Express app setup
├── server.js                # Entry point
├── .env
├── .env.example
└── package.json
```

---

## Database Design

### Primary Option: MongoDB + Mongoose

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│   Users   │────→│ Products  │     │  Reviews  │
│           │     │           │     │           │
│ _id       │     │ _id       │     │ _id       │
│ name      │     │ title     │     │ rating    │
│ email     │     │ desc      │     │ comment   │
│ password  │     │ price     │     │ buyerId   │
│ role      │     │ imageUrl  │     │ sellerId  │
│ credScore │     │ category  │     │ productId │
│ isVerified│     │ sellerId  │     │ createdAt │
│ kyc{}     │     │ status    │     └───────────┘
│ badges[]  │     │ createdAt │
│ createdAt │     └───────────┘     ┌───────────┐
└───────────┘                       │  Orders   │
      │                             │           │
      │         ┌───────────┐       │ _id       │
      └────────→│   Flags   │       │ buyerId   │
                │           │       │ items[]   │
                │ _id       │       │ total     │
                │ reporterId│       │ status    │
                │ sellerId  │       │ address   │
                │ reason    │       │ createdAt │
                │ status    │       └───────────┘
                │ createdAt │
                └───────────┘
```

### Alternative Option: PostgreSQL + Prisma

See `DATABASE_SCHEMA.md` for the full Prisma schema.

---

## API Architecture

### RESTful API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh JWT token |

#### Users / Sellers
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update user profile |
| POST | `/api/users/kyc` | Submit KYC documents |
| GET | `/api/users/:id/credibility` | Get credibility score |
| GET | `/api/sellers` | List all sellers |
| GET | `/api/sellers/:id` | Get seller profile with products |

#### Products
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/products` | List all products (with filters) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (seller only) |
| PUT | `/api/products/:id` | Update product (owner only) |
| DELETE | `/api/products/:id` | Delete product (owner only) |
| GET | `/api/products/search?q=` | Search products |

#### Reviews
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/reviews/seller/:id` | Get seller reviews |
| POST | `/api/reviews` | Add review (buyer only) |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

#### Orders
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my` | Get user's orders |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/status` | Update order status |

#### Admin
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/verify/:id` | Verify/reject seller |
| GET | `/api/admin/flags` | Get flagged sellers |
| PUT | `/api/admin/flags/:id` | Resolve flag |
| GET | `/api/admin/analytics` | Get platform analytics |

---

## External Services Configuration

### Cloudinary (Image Upload)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/nearbynode
```

### JWT Configuration
```env
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

### KYC Sandbox (Aadhaar Verification)
```env
KYC_API_KEY=your_sandbox_api_key
KYC_BASE_URL=https://api.sandbox.co.in
```

---

## Deployment Architecture

```
                    ┌──────────────┐
                    │   Vercel     │
                    │  (Frontend)  │
         ┌─────────┤  React App   ├─────────┐
         │         └──────────────┘         │
         │                                   │
    HTTPS│                              HTTPS│
         │                                   │
         ▼                                   ▼
┌──────────────┐                   ┌──────────────┐
│   Browser    │                   │   Render     │
│   (Client)   │──── API Calls ──→│  (Backend)   │
│              │                   │  Express API │
└──────────────┘                   └──────┬───────┘
                                          │
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                              ▼                       ▼
                     ┌──────────────┐       ┌──────────────┐
                     │MongoDB Atlas │       │  Cloudinary  │
                     │  (Database)  │       │  (Images)    │
                     └──────────────┘       └──────────────┘
```

---

## Environment Variables Template

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nearbynode

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# KYC
KYC_API_KEY=your_sandbox_api_key
KYC_BASE_URL=https://api.sandbox.co.in

# CORS
FRONTEND_URL=http://localhost:5173
```

---

*Document Version: 1.0*
*Last Updated: March 2, 2026*
