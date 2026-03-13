# 🗄 Database Schema

## NearbyNode — Data Models

---

## Option A: MongoDB + Mongoose Schema

### User Model

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  avatar: {
    type: String,
    default: ''
  },

  // Seller-specific fields
  businessName: { type: String, default: '' },
  businessType: {
    type: String,
    enum: ['', 'food', 'crafts', 'clothing', 'electronics', 'services', 'other'],
    default: ''
  },
  businessAddress: { type: String, default: '' },
  businessDescription: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },

  // Verification
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['none', 'pending', 'verified', 'rejected'],
    default: 'none'
  },
  kyc: {
    aadhaarVerified: { type: Boolean, default: false },
    aadhaarNumber: { type: String, default: '' },
    googleVerified: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  },

  // Trust & Credibility
  credibilityScore: { type: Number, default: 0, min: 0, max: 5 },
  totalTransactions: { type: Number, default: 0 },
  successfulTransactions: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  badge: {
    type: String,
    enum: ['new', 'verified', 'trusted', 'elite'],
    default: 'new'
  },

  // Moderation
  flagCount: { type: Number, default: 0 },
  isSuspended: { type: Boolean, default: false },
  suspendedAt: { type: Date },
  suspendedReason: { type: String, default: '' }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ credibilityScore: -1 });
userSchema.index({ 'location': '2dsphere' });

// Pre-save: Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Calculate credibility score
userSchema.methods.calculateCredibility = function() {
  const avgRating = this.averageRating || 0;
  const txnRatio = this.totalTransactions > 0
    ? this.successfulTransactions / this.totalTransactions
    : 0;
  const kycScore = (this.kyc.aadhaarVerified ? 1 : 0) +
                   (this.kyc.googleVerified ? 0.5 : 0) +
                   (this.kyc.mobileVerified ? 0.5 : 0);
  const accountAge = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24 * 30); // months
  const ageScore = Math.min(accountAge / 12, 1); // cap at 1 year

  this.credibilityScore = (avgRating * 0.4) +
                          (txnRatio * 5 * 0.3) +
                          (kycScore * 2.5 * 0.2) +
                          (ageScore * 5 * 0.1);

  // Update badge
  if (this.credibilityScore >= 4.6) this.badge = 'elite';
  else if (this.credibilityScore >= 3.6) this.badge = 'trusted';
  else if (this.credibilityScore >= 2.1 && this.isVerified) this.badge = 'verified';
  else this.badge = 'new';

  return this.credibilityScore;
};

module.exports = mongoose.model('User', userSchema);
```

---

### Product Model

```javascript
// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image is required']
  },
  images: [{
    url: String,
    public_id: String // Cloudinary public_id for deletion
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'vegetables',
      'fruits',
      'food',
      'snacks',
      'homemade',
      'crafts',
      'clothing',
      'accessories',
      'electronics',
      'services',
      'other'
    ]
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold', 'flagged', 'removed'],
    default: 'active'
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
```

---

### Review Model

```javascript
// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters'],
    default: ''
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews
reviewSchema.index({ buyer: 1, product: 1 }, { unique: true });
reviewSchema.index({ seller: 1 });
reviewSchema.index({ rating: -1 });

// Static: Calculate average rating for a seller
reviewSchema.statics.calculateAverageRating = async function(sellerId) {
  const result = await this.aggregate([
    { $match: { seller: sellerId, moderationStatus: 'approved' } },
    {
      $group: {
        _id: '$seller',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(sellerId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalRatings: result[0].totalRatings
    });
  }
};

// Trigger recalculation after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.seller);
});

module.exports = mongoose.model('Review', reviewSchema);
```

---

### Order Model

```javascript
// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  imageUrl: { type: String }
});

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'mock'],
    default: 'mock'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ buyer: 1 });
orderSchema.index({ 'items.seller': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
```

---

### Flag Model

```javascript
// models/Flag.js
const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  reason: {
    type: String,
    required: [true, 'Reason for flagging is required'],
    enum: [
      'fake_product',
      'misleading_info',
      'price_gouging',
      'poor_quality',
      'no_delivery',
      'fraud',
      'harassment',
      'inappropriate_content',
      'other'
    ]
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  evidence: [{
    url: String,
    type: { type: String, enum: ['image', 'screenshot'] }
  }],
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  resolution: {
    action: {
      type: String,
      enum: ['none', 'warning', 'score_reduction', 'suspension', 'ban']
    },
    note: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
flagSchema.index({ seller: 1 });
flagSchema.index({ status: 1 });
flagSchema.index({ reporter: 1 });

module.exports = mongoose.model('Flag', flagSchema);
```

---

## Option B: PostgreSQL + Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

enum VerificationStatus {
  NONE
  PENDING
  VERIFIED
  REJECTED
}

enum Badge {
  NEW
  VERIFIED
  TRUSTED
  ELITE
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  SOLD
  FLAGGED
  REMOVED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum FlagReason {
  FAKE_PRODUCT
  MISLEADING_INFO
  PRICE_GOUGING
  POOR_QUALITY
  NO_DELIVERY
  FRAUD
  HARASSMENT
  INAPPROPRIATE_CONTENT
  OTHER
}

enum FlagStatus {
  PENDING
  INVESTIGATING
  RESOLVED
  DISMISSED
}

model User {
  id                     String              @id @default(uuid())
  name                   String
  email                  String              @unique
  password               String
  role                   Role                @default(BUYER)
  avatar                 String              @default("")

  // Seller fields
  businessName           String              @default("")
  businessType           String              @default("")
  businessAddress        String              @default("")
  businessDescription    String              @default("")
  phone                  String              @default("")

  // Verification
  isVerified             Boolean             @default(false)
  verificationStatus     VerificationStatus  @default(NONE)
  aadhaarVerified        Boolean             @default(false)
  googleVerified         Boolean             @default(false)
  mobileVerified         Boolean             @default(false)

  // Trust
  credibilityScore       Float               @default(0)
  totalTransactions      Int                 @default(0)
  successfulTransactions Int                 @default(0)
  totalRatings           Int                 @default(0)
  averageRating          Float               @default(0)
  badge                  Badge               @default(NEW)

  // Moderation
  flagCount              Int                 @default(0)
  isSuspended            Boolean             @default(false)

  // Relations
  products               Product[]
  reviewsGiven           Review[]            @relation("BuyerReviews")
  reviewsReceived        Review[]            @relation("SellerReviews")
  orders                 Order[]
  flagsReported          Flag[]              @relation("FlagsReported")
  flagsReceived          Flag[]              @relation("FlagsReceived")

  createdAt              DateTime            @default(now())
  updatedAt              DateTime            @updatedAt

  @@index([role])
  @@index([credibilityScore])
}

model Product {
  id          String        @id @default(uuid())
  title       String
  description String
  price       Float
  imageUrl    String
  category    String
  status      ProductStatus @default(ACTIVE)
  stock       Int           @default(1)
  views       Int           @default(0)
  totalSold   Int           @default(0)

  seller      User          @relation(fields: [sellerId], references: [id])
  sellerId    String

  reviews     Review[]
  orderItems  OrderItem[]
  flags       Flag[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([category])
  @@index([sellerId])
  @@index([price])
  @@index([status])
}

model Review {
  id                 String   @id @default(uuid())
  rating             Int
  comment            String   @default("")
  isVerifiedPurchase Boolean  @default(false)

  buyer              User     @relation("BuyerReviews", fields: [buyerId], references: [id])
  buyerId            String

  seller             User     @relation("SellerReviews", fields: [sellerId], references: [id])
  sellerId           String

  product            Product  @relation(fields: [productId], references: [id])
  productId          String

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@unique([buyerId, productId])
  @@index([sellerId])
}

model Order {
  id              String        @id @default(uuid())
  buyer           User          @relation(fields: [buyerId], references: [id])
  buyerId         String
  items           OrderItem[]
  totalAmount     Float
  deliveryCharge  Float         @default(0)
  grandTotal      Float
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)

  // Shipping Address (embedded as JSON or separate fields)
  shippingName    String
  shippingPhone   String
  shippingAddress String
  shippingCity    String
  shippingState   String
  shippingPincode String

  deliveredAt     DateTime?
  cancelledAt     DateTime?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([buyerId])
  @@index([status])
}

model OrderItem {
  id        String  @id @default(uuid())
  order     Order   @relation(fields: [orderId], references: [id])
  orderId   String
  product   Product @relation(fields: [productId], references: [id])
  productId String
  sellerId  String
  title     String
  price     Float
  quantity  Int
  imageUrl  String  @default("")

  @@index([orderId])
}

model Flag {
  id          String     @id @default(uuid())
  reporter    User       @relation("FlagsReported", fields: [reporterId], references: [id])
  reporterId  String
  seller      User       @relation("FlagsReceived", fields: [sellerId], references: [id])
  sellerId    String
  product     Product?   @relation(fields: [productId], references: [id])
  productId   String?
  reason      FlagReason
  description String     @default("")
  status      FlagStatus @default(PENDING)

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([sellerId])
  @@index([status])
}
```

---

## Entity Relationship Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│   User (1) ──────── (N) Product                               │
│     │                      │                                  │
│     │                      │                                  │
│     ├──── (N) Review ──────┤                                  │
│     │     (as buyer)       (reviewed product)                 │
│     │                                                         │
│     ├──── (N) Review                                          │
│     │     (as seller - receives reviews)                      │
│     │                                                         │
│     ├──── (N) Order ──── (N) OrderItem ──── (1) Product       │
│     │     (as buyer)                                          │
│     │                                                         │
│     ├──── (N) Flag (as reporter)                              │
│     │                                                         │
│     └──── (N) Flag (as reported seller)                       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

*Document Version: 1.0*
*Last Updated: March 2, 2026*
