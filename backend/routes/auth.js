const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// @route   POST /api/auth/register
// @desc    Register a new admin account
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields (name, email, password).' });
        }

        // Check for existing admin
        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: 'Admin account already exists with this email.' });
        }

        // Create new admin
        admin = new Admin({
            name,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);

        // Save to database
        await admin.save();

        // Create JWT token
        const payload = {
            admin: {
                id: admin.id
            }
        };

        const jwtSecret = process.env.JWT_SECRET || 'fallback_super_secret_herbascan_key_2026';

        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: '100h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: 'Admin account created successfully.',
                    token,
                    admin: {
                        id: admin.id,
                        name: admin.name,
                        email: admin.email,
                        role: admin.role
                    }
                });
            }
        );

    } catch (err) {
        console.error("Error creating admin account:", err.message);
        res.status(500).json({ message: 'Server error while creating account.' });
    }
});

// @route   POST /api/auth/login
// @desc    Login admin account
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            admin: {
                id: admin.id
            }
        };

        const jwtSecret = process.env.JWT_SECRET || 'fallback_super_secret_herbascan_key_2026';

        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: '100h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Logged in successfully.',
                    token,
                    admin: {
                        id: admin.id,
                        name: admin.name,
                        email: admin.email,
                        role: admin.role
                    }
                });
            }
        );
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
