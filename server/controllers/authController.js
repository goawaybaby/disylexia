const User = require("../models/user");
const { hashP, compareP } = require('../bcrypt/auth');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username) {
            return res.json({ error: "Please type in your username" });
        }

        if (!email) {
            return res.json({ error: "No email entered" });
        }

        if (!password || password.length < 8) {
            return res.json({
                error: "Password is required and must be at least 8 characters long"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ error: "You already have an account" });
        }

        const hashedP = await hashP(password);
        const user = await User.create({ username, email, password: hashedP });

        res.json({
            message: "User registered successfully",
            user: {
                username: user.username,
                id: user._id,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registration failed" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ error: 'You do not have an account' });
        }

        // Validate password
        const match = await compareP(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Create a new session
        const sessionId = uuidv4();
        const loginTime = new Date();
        user.sessions.push({ sessionId, loginTime });
        await user.save();

        // Generate JWT
        jwt.sign(
            {
                username: user.username,
                email: user.email,
                id: user._id,
                loginTime: loginTime.toISOString(),
                sessionId
            },
            process.env.JWT_SECRET,
            {},
            (err, token) => {
                if (err) {
                    console.error(err);
                    return res.json({ error: "Failed to generate token" });
                }

                // Set token as a cookie and respond to client
                res.cookie('token', token, {
                    httpOnly: true, // Prevents client-side JavaScript access
                    secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
                    sameSite: 'strict', // Protects against CSRF
                    maxAge: 3600000, // Token expiration time in milliseconds (optional, 1 hour here)
                    path: '/' // Cookie is accessible across all routes
                });

                console.log("Token sent to client:", token);
                res.json({
                    message: "Login successful",
                    user: {
                        id: user._id,
                        email: user.email
                    }
                });
            }
        );

    } catch (error) {
        console.error(error);
        res.json({ error: "Login failed" });
    }
};

const logoutUser = async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(400).json({ error: "No token found" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.error(err);
            return res.status(401).json({ error: "Invalid token" });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const session = user.sessions.find(s => s.sessionId === decoded.sessionId);
        if (session) {
            session.logoutTime = new Date();
            await user.save();
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.json({ message: "Logged out successfully" });
    });
};


const saveScore = async (req, res) => {
    try {
        const { score } = req.body;
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentSession = user.sessions.find(session => session.sessionId === decoded.sessionId);
        if (currentSession) {
            currentSession.scores.push({ game: 'Memory Game', score });
            await user.save();
            res.json({ message: 'Score saved successfully' });
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save score' });
    }
};

// Middleware for token authentication
const authenticateToken = (req, res, next) => {
    const { token } = req.cookies;
    console.log('Token from cookies:', token);

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Token verification error:", err);
            return res.status(401).json({ error: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token" });
        }

        console.log('Token decoded:', decoded);
        req.user = decoded; // Attach user data to the request
        next(); // Proceed to the next middleware or route handler
    });
};

// Route handler for getting user profile
const getProfile = async (req, res) => {
    try {
        console.log('Decoded user in request:', req.user);

        const user = await User.findById(req.user.id).select('-password');
        console.log('User found:', user);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentSession = user.sessions.find(session => session.sessionId === req.user.sessionId);
        console.log('Current session:', currentSession);

        if (!currentSession || currentSession.logoutTime) {
            return res.status(401).json({ error: "Session expired or not found" });
        }

        const latestScore = currentSession.scores.length > 0 ? currentSession.scores[currentSession.scores.length - 1] : null;

        return res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            currentSession: {
                sessionId: currentSession.sessionId,
                loginTime: currentSession.loginTime,
                latestScore: latestScore
            }
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

const saveImage = async (req, res) => {
    try {
        const { image } = req.body; // Base64 string of the image
        const { token } = req.cookies;

        if (!image) {
            return res.status(400).json({ error: "No image data provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Decode and save the image
        const base64Data = image.replace(/^data:image\/png;base64,/, '');
        const imagePath = path.join('/Users/rohiththota/Pictures', `image_${Date.now()}.png`);
        fs.writeFileSync(imagePath, base64Data, 'base64');

        // Find the current session
        const currentSession = user.sessions.find(session => session.sessionId === decoded.sessionId);
        if (currentSession) {
            // Add the image path to the session's images array
            if (!currentSession.images) currentSession.images = [];
            currentSession.images.push(imagePath);
            await user.save();

            res.json({ message: 'Image saved successfully', path: imagePath });
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save image' });
    }
};



module.exports = {
    registerUser,
    loginUser,
    getProfile,
    logoutUser,
    saveScore,
    authenticateToken,
    saveImage
};


