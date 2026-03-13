/**
 * Create Admin User Script
 *
 * Creates an admin user in the database.
 * If the email already exists, promotes that user to admin.
 *
 * Usage:
 *   node create-admin.js                              — interactive with defaults
 *   node create-admin.js --email admin@test.com       — custom email
 *   node create-admin.js --email admin@test.com --password mypass123 --name "Admin"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nearbynode';

const parseArgs = () => {
    const args = {};
    process.argv.slice(2).forEach((arg, i, arr) => {
        if (arg.startsWith('--') && arr[i + 1] && !arr[i + 1].startsWith('--')) {
            args[arg.replace('--', '')] = arr[i + 1];
        }
    });
    return args;
};

const createAdmin = async () => {
    const args = parseArgs();
    const email = args.email || 'admin@nearbynode.com';
    const password = args.password || 'admin123';
    const name = args.name || 'Admin User';

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅  Connected to MongoDB\n');

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            if (user.role === 'admin') {
                console.log(`ℹ️  Admin already exists: ${email}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   ID:   ${user._id}\n`);
            } else {
                // Promote existing user to admin
                user.role = 'admin';
                user.isVerified = true;
                user.verificationStatus = 'verified';
                user.badge = 'elite';
                await user.save();
                console.log(`⬆️  Promoted existing user to admin!`);
                console.log(`   Email: ${email}`);
                console.log(`   Previous Role: ${user.role} → admin`);
                console.log(`   ID: ${user._id}\n`);
            }
        } else {
            // Create new admin user
            user = await User.create({
                name,
                email,
                password,
                role: 'admin',
                isVerified: true,
                verificationStatus: 'verified',
                badge: 'elite',
                credibilityScore: 5,
            });

            console.log(`🛡️  Admin user created successfully!\n`);
            console.log(`   Name:     ${name}`);
            console.log(`   Email:    ${email}`);
            console.log(`   Password: ${password}`);
            console.log(`   Role:     admin`);
            console.log(`   ID:       ${user._id}\n`);
        }

        console.log('💡  Use these credentials to log in as admin.\n');
        process.exit(0);
    } catch (error) {
        console.error('❌  Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
