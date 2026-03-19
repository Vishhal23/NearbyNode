/**
 * Seed script to create the admin user in MongoDB.
 * 
 * Usage:  node server/seedAdmin.js
 * 
 * This creates the admin account directly in MongoDB (bypassing Firebase).
 * After running, you can log in using the "Admin" role option on the login page
 * with email/password via Google/Firebase auth + backend sync.
 * 
 * For Firebase: You must also create this email in Firebase Console → Authentication
 * OR register via the app first, then run this script to upgrade the role.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = 'vishalgudla2@gmail.com';
const ADMIN_NAME = 'Admin';
const ADMIN_PASSWORD = 'Vishal@123';

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existing = await User.findOne({ email: ADMIN_EMAIL });

        if (existing) {
            // Just upgrade role to admin
            existing.role = 'admin';
            existing.name = ADMIN_NAME;
            await existing.save();
            console.log(`✅ Existing user "${ADMIN_EMAIL}" upgraded to admin role.`);
        } else {
            // Create fresh admin user
            await User.create({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'admin',
            });
            console.log(`✅ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
        }

        await mongoose.disconnect();
        console.log('✅ Done. You can now log in as admin.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seedAdmin();
