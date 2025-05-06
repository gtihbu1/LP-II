const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Secret key for JWT signing and encryption
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Hardcoded user (in real apps, use DB)
const users = [
    {
        username: 'admin',
        password: 'password123' // In production, passwords must be hashed!
    }
];

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    // Find user
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // User authenticated - generate JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Authentication successful', token });
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Welcome ${req.user.username}! This is protected data.` });
});

// Start server
app.listen(PORT, () => {
    console.log(`Authentication server running on http://localhost:${PORT}`);
});
