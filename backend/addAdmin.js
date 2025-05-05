const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

const addAdmin = async (name, email, password) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin with this email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log('Admin with this email already exists');
            process.exit(1);
        }

        // Create new admin
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Password:', password);
        
        // Verify the admin was created
        const verifyAdmin = await Admin.findOne({ email });
        console.log('Verification:', verifyAdmin ? 'Admin exists in database' : 'Admin not found');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 3) {
    console.log('Usage: node addAdmin.js <name> <email> <password>');
    process.exit(1);
}

const [name, email, password] = args;
addAdmin(name, email, password); 