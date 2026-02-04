const express = require('express');
const { Job, Category } = require('../models/Relationships');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.use(auth);

// Get all jobs (Should return less information to increase speed and reduce size, try using a filter)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.status(200).json(jobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// Get all jobs in a specific category (merge with the main get all)
router.get('/category/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const jobs = await Job.findAll({ where: { categoryId } });
    res.status(200).json(jobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// View a single job
router.get('/detail/:id', async (req, res) => {

});

// Create a new job
router.post('/', async (req, res) => {

});

// Update an existing job
router.patch('/:id', async (req, res) => {

});

// Delete an existing job
router.delete('/:id', async (req, res) => {

});

// Apply for an existing job
router.post('/:id/apply', async (req, res) => {

});

// Remove application from a job
router.delete('/:id/withdraw', async (req, res) => {

});

// View all applicants in a job
router.get('/:id/aplicants', async (req, res) => {

});

// View all jobs currently applied for
router.get('/prospective-jobs', async (req, res) => {

});

// View jobs assigned to user
router.get('/assigned-jobs', async (req, res) => {

});

// View all created jobs
router.get('/my-posts', async (req, res) => {

});

