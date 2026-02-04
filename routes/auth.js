const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/Relationships');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;
const MASTER_KEY = process.env.MASTER_KEY;

// Get all users 
router.get('/all', async (req, res) => {
  const adminKey = req.headers['adminkey'];

  if (!adminKey)
    return res.status(401).json({ error: 'Missing credentials' });

  if (MASTER_KEY !== adminKey)
    return res.status(403).json({ error: 'Not authorised to access this information' });

  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'There was an internal server error' });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required fields' });

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ error: 'You already have an account, please sign in' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, { expiresIn: '1h' });

    res.status(201).json({ message: 'Account created successfully', token });
  } catch (err) {
    res.status(500).json({ error: 'There was an internal server error' });
    console.log(err);
  }
});

// Login an existing user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required fields' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ error: 'Wrong email or pasword' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: 'Wrong email or password' });

    const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
    res.status(202).json({ message: 'Login was successful', token });
  } catch (err) {
    res.status(500).json({ error: 'There was an internal server error' });
    console.log(err)
  }
});

// Delete an existing account
router.delete('/delete', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  const { email, password } = req.body;
  if (!token || !email || !password)
    return res.status(401).json({ error: 'Missing credentials.' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Wrong credentials.' });

    if (decoded.id !== user.id) {
      return res.status(403).json({ error: 'You can only delete your own account.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Wrong credentials.' });

    await user.destroy();

    res.status(200).json({ message: 'Account deleted successfully.' });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Not authorised to proceed.' });
    }
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

module.exports = router;


