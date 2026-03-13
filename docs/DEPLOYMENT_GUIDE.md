# 🌍 Deployment & Configuration Guide

## NearbyNode — Domain, Hosting & Environment Setup

---

## Deployment Targets

| Service | Purpose | Tier |
|---------|---------|------|
| **Vercel** | Frontend hosting | Free |
| **Render** / **Railway** | Backend API hosting | Free / Starter |
| **MongoDB Atlas** | Database | Free (M0 Cluster) |
| **Cloudinary** | Image storage & CDN | Free (25GB) |
| **Sandbox.co.in** | KYC/Aadhaar API | Developer tier |

---

## Environment Variables Checklist

### Backend `.env`

```env
# ================================
# SERVER CONFIGURATION
# ================================
PORT=5000
NODE_ENV=development

# ================================
# DATABASE
# ================================
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/nearbynode?retryWrites=true&w=majority

# ================================
# AUTHENTICATION
# ================================
JWT_SECRET=<your_super_secret_jwt_key_min_32_chars>
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=<another_secret_for_refresh_tokens>
JWT_REFRESH_EXPIRE=30d

# ================================
# CLOUDINARY (Image Upload)
# ================================
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# ================================
# KYC VERIFICATION (Sandbox.co.in)
# ================================
KYC_API_KEY=<your_sandbox_api_key>
KYC_SECRET_KEY=<your_sandbox_secret_key>
KYC_BASE_URL=https://api.sandbox.co.in

# ================================
# CORS
# ================================
FRONTEND_URL=http://localhost:5173

# ================================
# RATE LIMITING
# ================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=<your_cloud_name>
VITE_CLOUDINARY_UPLOAD_PRESET=<your_unsigned_preset>
```

---

## Setup Instructions

### 1. MongoDB Atlas Setup
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free account → Create Free Cluster (M0)
3. Set database user with username/password
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get connection string → paste in `MONGODB_URI`

### 2. Cloudinary Setup
1. Go to [cloudinary.com](https://cloudinary.com)
2. Create free account
3. Dashboard → copy Cloud Name, API Key, API Secret
4. Settings → Upload → Create unsigned upload preset
5. Copy preset name for frontend `VITE_CLOUDINARY_UPLOAD_PRESET`

### 3. Sandbox.co.in Setup (KYC)
1. Go to [sandbox.co.in](https://sandbox.co.in)
2. Create developer account
3. Dashboard → Get API Key and Secret
4. Use Aadhaar Verification API endpoint

### 4. Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL = https://your-backend.onrender.com/api
```

### 5. Render Deployment (Backend)
1. Go to [render.com](https://render.com)
2. New → Web Service → Connect GitHub repo
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add all environment variables from `.env`
6. Update `FRONTEND_URL` to your Vercel URL

---

## Domain Configuration (Optional)

### Custom Domain Setup
1. Purchase domain (Namecheap, GoDaddy, Google Domains)
2. Vercel → Settings → Domains → Add custom domain
3. Update DNS records as instructed
4. SSL is auto-configured by Vercel

### Recommended Domain Names
- nearbynode.com
- nearbynode.in
- nearbynode.io

---

## Production Checklist

- [ ] All environment variables set in production
- [ ] MongoDB Atlas IP whitelist configured
- [ ] CORS origin set to production frontend URL
- [ ] JWT secrets are strong (32+ characters)
- [ ] Rate limiting configured
- [ ] Helmet security headers enabled
- [ ] Error logging configured (no stack traces in production)
- [ ] Image upload size limits set
- [ ] Database indexes created
- [ ] SSL/HTTPS enabled
- [ ] Mobile responsiveness verified
- [ ] Performance tested (Lighthouse score > 90)

---

*Document Version: 1.0*
*Last Updated: March 2, 2026*
