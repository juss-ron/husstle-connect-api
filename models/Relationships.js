const User = require('./User');
const Job = require('./Job');
const Category = require('./Category');

// A category has many jobs and a job belongs to one category
Category.hasMany(Job, {
  as: 'jobs',
  foreignKey: 'categoryId'
});

Job.belongsTo(Category, {
  as: 'associatedCategory',
  foreignKey: 'categoryId'
});

// A job has many applicants and a user can apply to many jobs
Job.belongsToMany(User, {
  through: 'UserJobs',
  as: 'applicants',
  foreignKey: 'jobId',
  otherKey: 'userId'
});

User.belongsToMany(Job, {
  through: 'UserJobs',
  as: 'jobProspects',
  foreignKey: 'userId',
  otherKey: 'jobId'
});

// A user can creates jobs and a job is created by a user
User.hasMany(Job, {
  as: 'createdJobs',
  foreignKey: 'creatorId',
  onDelete: 'CASCADE'
});

Job.belongsTo(User, {
  as: 'creator',
  foreignKey: 'creatorId'
});

// A job can have a user assigned to it and a user can be asigned to multiple jobs
User.hasMany(Job, {
  as: 'assignedJobs',
  foreignKey: 'assigneeId'
});

Job.belongsTo(User, {
  as: 'assignedUser',
  foreignKey: 'assigneeId'
});

module.exports = { User, Job, Category };
