const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new standard user account
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields (name, email, password).' });
        }

        // Check for existing user
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Account already exists with this email.' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save to database
        await user.save();

        // Create JWT token
        const payload = {
            user: {
                id: user.id
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
                    message: 'Account created successfully.',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        console.error("Error creating user account:", err.message);
        res.status(500).json({ message: 'Server error while creating account.' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user account
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            user: {
                id: user.id
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
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
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
