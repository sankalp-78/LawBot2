const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete existing admin if exists
        await Admin.deleteMany({ email: 'admin@example.com' });
        console.log('Cleaned up existing admin');

        // Create new admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new Admin({
            name: 'Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        
        // Verify the admin was created
        const verifyAdmin = await Admin.findOne({ email: 'admin@example.com' });
        console.log('Verification:', verifyAdmin ? 'Admin exists in database' : 'Admin not found');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

createAdmin(); 