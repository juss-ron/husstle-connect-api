const express = require('express');
const { Job } = require('../models/Relationships');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.use(auth);

// Get all jobs (Should return less information to increase speed and reduce size, try using a filter)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.findAll({ where: { status: 'available' } });
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
    const category = category.findByPk(categoryId);
    if (!category)
      return res.status(404).json({ error: 'Category not found.' });

    const jobs = await category.getJobs({ where: { status: 'available' } });
    res.status(200).json(jobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// View a single job
router.get('/detail/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const job = await Job.findOne({ where: { id } });
    res.status(400).json(job);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// Create a new job
router.post('/', async (req, res) => {
  const { title, description, price, categoryId, status, location } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  } else if (!description) {
    return res.status(400).json({ error: 'Description is required.' });
  } else if (!price) {
    return res.status(400).json({ error: 'Price is required.' });
  } else if (!categoryId) {
    return res.status(400).json({ error: 'Category is required.' });
  } else if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  } else if (!location) {
    return res.status(400).json({ error: 'Location is required.' });
  }

  try {
    await Job.create({ title, description, price, categoryId, status, location });
    res.status(201).json({ message: 'Job created successfully.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// Update an existing job
router.patch('/:id', async (req, res) => {
  const id = req.paprams.id;
  const user = req.user;

  const { title, description, price, categoryId, status, location } = req.body;
  if (!title && !description && !price && !categoryId && !status && !location)
    return res.status(400).json({ error: 'Specify what to edit.' })

  try {
    const job = await Job.findOne({ where: { id } });
    if (!job)
      return res.status(404).json({ error: 'Job not found.' });

    if (user.id === job.creatorId)
      return res.json(401).json({ error: 'Unauthorized. You are not the creator of the job.' })

    if (job.title === title && job.description === description && job.price === price && job.categoryId === categoryId && job.status === status && job.location === location)
      return res.status(400).json({ error: 'The new job must not be the same as the old one.' });

    job.title = title ?? job.title;
    job.description = description ?? job.description;
    job.price = price ?? job.price;
    job.categoryId = categoryId ?? job.categoryId;
    job.status = status ?? job.status;
    job.location = location ?? job.location;

    await job.save();

    res.status(200).json({ message: 'Job updated successfully.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// Delete an existing job
router.delete('/:id', async (req, res) => {
  const id = req.params.id;


  try {
    const job = await Job.findOne({ where: { id } });
    if (!job)
      return res.status(404).json({ error: 'Job not found.' });

    await Job.destroy();

    res.status(200).json({ message: 'Job deleted successfully.' })
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// Apply for an existing job
router.post('/:id/apply', async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;

  try {
    const job = await Job.findByPk(jobId);
    if (!job)
      return res.status(404).json({ error: 'Job not found.' });

    const applied = await Job.hasApplicant(userId);
    if (applied)
      return res.status(400).json({ error: 'You already applied for the job.' });

    if (userId === job.creator)
      return res.status(400).json({ error: 'You cannot apply for a job that you created.' });

    await job.addApplicant(userId);

    res.status(200).json({ message: 'Successfully applied for job.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// Remove application from a job
router.delete('/:id/withdraw', async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;

  try {
    const job = await Job.findByPk(jobId);
    if (!job)
      return res.status(404).json({ error: 'Job not found.' });

    const applied = await job.hasApplicant(userId);
    if (!applied)
      return res.status(400).json({ error: 'You had not applied for this job.' })

    await Job.removeApplicant(userId);

    res.status(200).json({ message: 'Application withdrawn successfully.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// View all applicants in a job
router.get('/:id/aplicants', async (req, res) => {
  const jobId = req.paarams.id;
  const userId = req.user.id;

  try {
    const job = await Job.findByPk(jobId);
    if (!job)
      return res.status(404).json({ error: 'Job not found.' });

    if (userId !== job.creatorId)
      return res.status(401).json({ error: 'Unauthorised: You are not the creator of the job.' });

    const applicants = await job.getApplicants();

    res.json(200).json(applicants);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// View all jobs currently applied for
router.get('/prospective-jobs', async (req, res) => {
  const user = req.user;

  try {
    const prospectiveJobs = await user.getJobProspects();
    res.status(200).json(prospectiveJobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// View jobs assigned to user
router.get('/assigned-jobs', async (req, res) => {
  const user = req.user;

  try {
    const assignedJobs = await user.getAssignedJobs();
    res.status(200).json(assignedJobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

// View all created jobs
router.get('/my-posts', async (req, res) => {
  const user = req.user;

  try {
    const myJobs = await user.getCreatedJobs();
    res.status(200).json(myJobs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'There was an internal server error.' });
  }
});

module.exports = router;

