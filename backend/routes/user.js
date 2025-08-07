const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// SIGNUP
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Already have an account' });
    }

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [username, email, password]
    );

    return res.status(201).json({
      message: 'Signup successful',
      username: newUser.rows[0].username
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ message: 'Server error during signup' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Both email and password are required' });
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Sign up to continue' });
    }

    if (user.rows[0].password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Login successful',
      username: user.rows[0].username
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
