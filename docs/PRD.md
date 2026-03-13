# 📘 Product Requirements Document (PRD)

## Product Name
**NearbyNode** — Trust-Driven C2C Marketplace for Local Sellers Without Trade Licenses

---

## 1. Purpose

NearbyNode is a trust-driven C2C (Consumer-to-Consumer) marketplace platform designed to enable local and micro-business sellers to sell products online **without requiring mandatory trade licenses**. The platform focuses on building buyer trust through multi-level verification, credibility scoring, and behavior-based monitoring rather than strict legal documentation.

---

## 2. Target Audience

| Segment | Description |
|---------|-------------|
| **Local Vendors** | Vegetable sellers, street food vendors, local artisans |
| **Home-Based Businesses** | Homemade food, handmade crafts, baked goods |
| **Informal Micro-Sellers** | Small resellers, thrift stores, garage sales |
| **Buyers** | Consumers seeking trusted local products at fair prices |
| **Communities** | Urban and semi-urban neighborhoods looking for local commerce |

---

## 3. Core Problem Statement

Existing e-commerce platforms (Amazon, Flipkart, etc.) require **GST/trade licenses**, effectively excluding millions of informal sellers from digital commerce.

At the same time, **buyers hesitate** to purchase from unverified sellers due to fraud risk.

### NearbyNode Solves This By:
- ✅ Allowing **simplified onboarding** without trade licenses
- ✅ Providing **KYC-based verification** (Aadhaar, phone, Google)
- ✅ Implementing **dynamic credibility scoring** based on behavior
- ✅ **Continuous fraud monitoring** to maintain platform integrity
- ✅ **Badge-based trust system** for visual seller reputation

---

## 4. Key Differentiators

| Feature | Traditional Platforms | NearbyNode |
|---------|----------------------|------------|
| License Required | Yes (GST/Trade) | No |
| Onboarding Time | Days/Weeks | Minutes |
| Trust Mechanism | Legal compliance | Behavior + KYC scoring |
| Target Sellers | Registered businesses | Informal/local sellers |
| Locality Focus | National/Global | Hyper-local |

---

## 5. Success Metrics (KPIs)

| Metric | Target |
|--------|--------|
| Seller Registration Rate | 500+ in first 3 months |
| Buyer Trust Score > 3.5 | 80% of active sellers |
| Average Transaction Completion | > 90% |
| Fraud Incident Rate | < 2% |
| Monthly Active Users | 1000+ by month 6 |

---

## 6. Aesthetic & Design Philosophy

- **Clean, modern UI** with a professional feel
- **Trust-focused design** — credibility badges, verification icons
- **Light theme** with subtle blue/green tones (trust & growth colors)
- **Simple onboarding screens** — minimal friction
- **Dashboard-style layout** for sellers
- **Minimal clutter** — focus on products and trust signals
- **Fast loading** — performance-first approach
- **Mobile-responsive** — works on all devices

---

## 7. Scope

### In Scope (MVP)
- User registration & authentication (JWT)
- Seller onboarding with KYC
- Product CRUD operations
- Product browsing & search
- Credibility scoring system
- Rating & review system
- Shopping cart & checkout flow
- Seller dashboard
- Admin verification panel

### Out of Scope (Future)
- Payment gateway integration
- Real-time chat between buyer/seller
- Mobile native apps
- Multi-language support
- AI-powered recommendation engine
- Fraud analytics dashboard

---

## 8. Constraints

- No real payment processing in MVP (mock checkout)
- KYC verification uses sandbox/mock APIs
- Image storage via Cloudinary or Firebase Storage
- Single region deployment initially

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Fake seller accounts | Multi-layer KYC + behavior monitoring |
| Low buyer trust | Credibility scoring + badge system |
| Platform misuse | Automated flagging + admin moderation |
| Scalability concerns | Cloud-native architecture + CDN |

---

## 10. Timeline (MVP)

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Phase 1: Foundation | Week 1-2 | Auth, User models, DB setup |
| Phase 2: Core Features | Week 3-4 | Product CRUD, Search, Cart |
| Phase 3: Trust System | Week 5-6 | Credibility scoring, Reviews, Badges |
| Phase 4: Admin & Polish | Week 7-8 | Admin panel, Testing, Deployment |

---

*Document Version: 1.0*
*Last Updated: March 2, 2026*
*Author: Vishal Gudla*
