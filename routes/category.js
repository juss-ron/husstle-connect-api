const express = require('express');
const { Category } = require('../models/Relationships');
const auth = require('../middleware/authMiddleware.js');
const router = express.Router();

const MASTER_KEY = process.env.MASTER_KEY;

router.use(auth);

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json('There was an internal server error');
    console.log(err);
  }
});

// Add a new category
router.post('/', async (req, res) => {
  const adminkey = req.headers['adminkey']
  if (!adminkey)
    return res.status(400).json({ error: 'Please provide admin credentials' });

  if (adminkey !== MASTER_KEY)
    return res.status(400).json({ error: 'You are not authorised to create a category' });

  const { title, imageName } = req.body
  if (!title || !imageName)
    return res.status(400).json({ error: 'Title and image name are required' });

  try {
    const existing = await Category.findOne({ where: { title } });
    if (existing)
      return res.status(400).json({ error: 'Category already exists' });

    await Category.create({ title, imageName });

    res.status(201).json({ message: 'Category created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'There was an internal server error' });
    console.log(err);
  }
});

// Edit an existing category
router.patch('/:id', async (req, res) => {
  const adminkey = req.headers['adminkey']
  if (!adminkey)
    return res.status(400).json({ error: 'Please provide admin credentials' });

  if (adminkey !== MASTER_KEY)
    return res.status(400).json({ error: 'You are not authorised to edit a category' });

  const { title, imageName } = req.body;
  if (!title && !imageName)
    return res.status(400).json({ error: 'Title or image name are required' });

  const id = req.params.id;

  try {
    const category = await Category.findByPk(id);
    if (!category)
      return res.status(404).json({ error: 'The category was not found' });

    if (title === category.title && imageName === category.imageName)
      return res.status(400).json({ error: 'The old category and the new one must not be the same' });

    category.title = title ?? category.title;
    category.imageName = imageName ?? category.imageName;

    await category.save();

    res.status(200).json({ message: 'Category edited successfully' });
  } catch (err) {
    res.status(500).json({ error: 'There was an internal server error' });
    console.log(err);
  }
});

// Delete an existing category
router.delete('/:id', async (req, res) => {
  const adminkey = req.headers['adminkey']
  if (!adminkey)
    return res.status(400).json({ error: 'Please provide admin credentials' });

  if (adminkey !== MASTER_KEY)
    return res.status(400).json({ error: 'You are not authorised to delete a category' });

  const id = req.params.id;

  try {
    const category = await Category.findByPk(id);
    if (!category)
      return res.status(400).json({ error: 'Category not found' });

    await category.destroy();

    res.status(200).json({ message: 'Category deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'There was an internal server error' });
    console.log(err);
  }
});

module.exports = router;