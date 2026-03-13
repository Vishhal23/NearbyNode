/**
 * Database Seeder — Populates MongoDB with demo data matching mockData.js
 *
 * Usage:
 *   node seed.js          — seed data
 *   node seed.js --clear  — clear all data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const Review = require('./models/Review');
const Order = require('./models/Order');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nearbynode';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅  Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
            Review.deleteMany({}),
            Order.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing data');

        // Create users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@nearbynode.com',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            verificationStatus: 'verified',
            badge: 'elite',
        });

        const seller1 = await User.create({
            name: 'Priya Sharma',
            email: 'priya@nearbynode.com',
            password: hashedPassword,
            role: 'seller',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
            businessName: 'Priya\'s Organics',
            businessType: 'food',
            businessAddress: 'Jaipur, Rajasthan',
            businessDescription: 'Traditional artisan specializing in handmade jewellery and organic spices from the pink city.',
            phone: '9876543210',
            isVerified: true,
            verificationStatus: 'verified',
            credibilityScore: 4.6,
            totalTransactions: 186,
            successfulTransactions: 180,
            totalRatings: 54,
            averageRating: 4.8,
            badge: 'elite',
            kyc: {
                aadhaarVerified: true,
                googleVerified: true,
                mobileVerified: true,
                verifiedAt: new Date(),
            },
        });

        const seller2 = await User.create({
            name: 'Ravi Kumar',
            email: 'ravi@nearbynode.com',
            password: hashedPassword,
            role: 'seller',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
            businessName: 'Kumar Pottery',
            businessType: 'crafts',
            businessAddress: 'Khurja, Uttar Pradesh',
            businessDescription: 'Third-generation potter creating sustainable terracotta items for home and garden.',
            phone: '9876543211',
            isVerified: true,
            verificationStatus: 'verified',
            credibilityScore: 3.9,
            totalTransactions: 95,
            successfulTransactions: 90,
            totalRatings: 18,
            averageRating: 4.5,
            badge: 'trusted',
            kyc: {
                aadhaarVerified: false,
                googleVerified: true,
                mobileVerified: true,
                verifiedAt: new Date(),
            },
        });

        const buyer1 = await User.create({
            name: 'Anita Joshi',
            email: 'anita@nearbynode.com',
            password: hashedPassword,
            role: 'buyer',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
        });

        const buyer2 = await User.create({
            name: 'Rajesh Mehta',
            email: 'rajesh@nearbynode.com',
            password: hashedPassword,
            role: 'buyer',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
        });

        console.log('👤  Created users');

        // Create products
        const products = await Product.create([
            {
                title: 'Organic Turmeric Powder (500g)',
                description: 'Pure organic turmeric powder, sourced directly from farms in Rajasthan. Rich golden color and strong aroma. Perfect for cooking and health remedies.',
                price: 149,
                imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e3b85f5da57?w=400&h=300&fit=crop',
                category: 'food',
                seller: seller1._id,
                stock: 50,
                views: 245,
                totalSold: 32,
            },
            {
                title: 'Handmade Terracotta Pots (Set of 3)',
                description: 'Beautiful handcrafted terracotta pots in three sizes. Eco-friendly and sustainable. Perfect for indoor plants and garden decor.',
                price: 349,
                imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400&h=300&fit=crop',
                category: 'crafts',
                seller: seller2._id,
                stock: 15,
                views: 189,
                totalSold: 18,
            },
            {
                title: 'Embroidered Cotton Dupatta',
                description: 'Hand-embroidered cotton dupatta featuring traditional Rajasthani patterns. Vibrant colors with fine threadwork. One size fits all.',
                price: 599,
                imageUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&h=300&fit=crop',
                category: 'clothing',
                seller: seller1._id,
                stock: 20,
                views: 312,
                totalSold: 54,
            },
            {
                title: 'Cold-Pressed Coconut Oil (1L)',
                description: 'Pure cold-pressed coconut oil from South India. Multi-purpose: cooking, skin care, and hair care. No additives or preservatives.',
                price: 280,
                imageUrl: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=400&h=300&fit=crop',
                category: 'food',
                seller: seller2._id,
                stock: 30,
                views: 167,
                totalSold: 27,
            },
            {
                title: 'Bamboo Woven Basket',
                description: 'Sustainable bamboo basket, hand-woven by artisans. Perfect for storage, gift hampers, or home decoration.',
                price: 199,
                imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
                category: 'crafts',
                seller: seller2._id,
                stock: 25,
                views: 98,
                totalSold: 12,
            },
            {
                title: 'Handcrafted Silver Jhumkas',
                description: 'Exquisite handcrafted silver jhumka earrings with oxidized finish. Traditional design with modern elegance. Lightweight and comfortable.',
                price: 850,
                imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&h=300&fit=crop',
                category: 'accessories',
                seller: seller1._id,
                stock: 10,
                views: 278,
                totalSold: 41,
            },
        ]);

        console.log('📦  Created products');

        // Create reviews
        await Review.create([
            {
                rating: 5,
                comment: 'Absolutely genuine turmeric! The quality is exceptional and the packaging was very secure. Will buy again!',
                buyer: buyer1._id,
                seller: seller1._id,
                product: products[0]._id,
                isVerifiedPurchase: true,
                moderationStatus: 'approved',
            },
            {
                rating: 5,
                comment: 'The jhumkas are gorgeous! Exactly as described. Priya is very responsive and trustworthy.',
                buyer: buyer2._id,
                seller: seller1._id,
                product: products[5]._id,
                isVerifiedPurchase: true,
                moderationStatus: 'approved',
            },
            {
                rating: 4,
                comment: 'Nice pots, good quality terracotta. Packaging could be better but products arrived intact.',
                buyer: buyer1._id,
                seller: seller2._id,
                product: products[1]._id,
                isVerifiedPurchase: true,
                moderationStatus: 'approved',
            },
        ]);

        console.log('⭐  Created reviews');

        // Create a sample order
        await Order.create({
            buyer: buyer1._id,
            items: [
                {
                    product: products[0]._id,
                    seller: seller1._id,
                    title: products[0].title,
                    price: products[0].price,
                    quantity: 2,
                    imageUrl: products[0].imageUrl,
                },
                {
                    product: products[5]._id,
                    seller: seller1._id,
                    title: products[5].title,
                    price: products[5].price,
                    quantity: 1,
                    imageUrl: products[5].imageUrl,
                },
            ],
            totalAmount: 1148,
            deliveryCharge: 0,
            grandTotal: 1148,
            shippingAddress: {
                fullName: 'Anita Joshi',
                phone: '9876543212',
                addressLine1: '42, MG Road',
                city: 'Jaipur',
                state: 'Rajasthan',
                pincode: '302001',
            },
            status: 'delivered',
            paymentStatus: 'paid',
            paymentMethod: 'mock',
            deliveredAt: new Date(),
            statusHistory: [
                { status: 'pending', note: 'Order placed' },
                { status: 'confirmed', note: 'Payment confirmed' },
                { status: 'processing', note: 'Seller is preparing your order' },
                { status: 'shipped', note: 'Order dispatched' },
                { status: 'delivered', note: 'Order delivered successfully' },
            ],
        });

        console.log('🛒  Created sample order');

        console.log('\n🎉  Database seeded successfully!');
        console.log('\n📋  Test Accounts:');
        console.log('   Admin:     admin@nearbynode.com  / password123');
        console.log('   Seller 1:  priya@nearbynode.com  / password123');
        console.log('   Seller 2:  ravi@nearbynode.com   / password123');
        console.log('   Buyer 1:   anita@nearbynode.com  / password123');
        console.log('   Buyer 2:   rajesh@nearbynode.com / password123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌  Seeder error:', error.message);
        process.exit(1);
    }
};

const clearData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
            Review.deleteMany({}),
            Order.deleteMany({}),
        ]);
        console.log('🗑️  All data cleared');
        process.exit(0);
    } catch (error) {
        console.error('❌  Error:', error.message);
        process.exit(1);
    }
};

if (process.argv[2] === '--clear') {
    clearData();
} else {
    seedData();
}
