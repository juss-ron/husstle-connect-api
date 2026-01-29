const User = require('./User');
const Job = require('./Job');
const Category = require('./Category');

// A category has many jobs and a job belongs to one category
Category.hasMany(Job, {
  as: 'jobs',
  foreignKey: 'categoryTitle'
});

Job.belongsTo(Category, {
  as: 'associatedCategory',
  foreignKey: 'categoryTitle'
});

//// A job has many applicants and a user can apply to many jobs
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

module.exports = { User, Job, Category };
