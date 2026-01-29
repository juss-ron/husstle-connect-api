const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/Relationships');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

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
    res.status(500).json({ error: 'Something went wrong in the server' });
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
    res.status(500).json({ error: 'Something went wrong in the server' });
    console.log(err)
  }
});

module.exports = router;


