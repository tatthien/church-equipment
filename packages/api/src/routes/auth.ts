import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;

        if (!username || !password || !name) {
            return res.status(400).json({ error: 'Username, password and name are required' });
        }

        // Check if user exists
        const existingUser = db.query('SELECT id FROM users WHERE username = ?').get(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const stmt = db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)');
        const result = stmt.run(username, hashedPassword, name);

        const user = { id: result.lastInsertRowid as number, username, name };
        const token = generateToken(user);

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const user = db.query('SELECT * FROM users WHERE username = ?').get(username) as {
            id: number;
            username: string;
            password: string;
            name: string;
        } | undefined;

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const userData = { id: user.id, username: user.username, name: user.name };
        const token = generateToken(userData);

        res.json({ user: userData, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
    res.json({ user: req.user });
});

export default router;
