const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/email');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ email, password, role, name });

        // Hash password
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return JWT
        const payload = {
            user: { id: user.id, role: user.role }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check for user
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Return JWT
        const payload = {
            user: { id: user.id, role: user.role }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/auth/profile
// @desc    Get logged in user profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- SaaS Discord Integration ---
exports.discordLogin = async (req, res) => {
    if (!process.env.DISCORD_CLIENT_ID) {
        return res.status(500).json({ message: 'Discord Client ID is not configured' });
    }

    const redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/auth/discord/callback';
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;
    res.redirect(discordUrl);
};

exports.discordCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
        const redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/auth/discord/callback';

        // 1. Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
            }),
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) {
            console.error('Discord Token Error:', tokenData);
            return res.status(400).send('OAuth Token Exchange Failed');
        }

        // 2. Fetch User Profile
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const discordUser = await userResponse.json();

        // 3. Find or Create User in MongoDB
        let user = await User.findOne({
            $or: [{ discordId: discordUser.id }, { email: discordUser.email }]
        });

        if (!user) {
            // New user registration via Discord
            user = new User({
                name: discordUser.global_name || discordUser.username,
                email: discordUser.email,
                discordId: discordUser.id,
                role: 'buyer', // Default role for new users
            });
            await user.save();
        } else if (!user.discordId) {
            // Link Discord to existing email account
            user.discordId = discordUser.id;
            await user.save();
        }

        // 4. Generate JWT
        const payload = {
            user: { id: user.id, role: user.role }
        };

        const jwtToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' }
        );

        // 5. Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/dashboard?token=${jwtToken}&discord_linked=true`);

    } catch (err) {
        console.error('Discord OAuth Error Catch Block:', err.message);
        res.status(500).send('Internal Server Error during Discord OAuth');
    }
};

// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
        if (!user) {
            // Don't reveal whether the email exists
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${token}`;
        await sendPasswordResetEmail(email, resetUrl);

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('forgotPassword error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        }).select('+passwordResetToken +passwordResetExpires');

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (err) {
        console.error('resetPassword error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/auth/change-password
// @desc    Change password for a logged-in user
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Provide currentPassword and newPassword' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Cannot change password for OAuth accounts' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error('changePassword error:', err.message);
        res.status(500).send('Server error');
    }
};

