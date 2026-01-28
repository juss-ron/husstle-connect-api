const User = require('User.js');
const Job = require('Job.js');
const Category = require('Category.js');

Category.hasMany(Job, {
  as: 'jobs',
  foreignKey: 'category'
});

Job.belongsTo(Category, {
  as: category,
  foreignKey: 'category'
});

Job.hasMany(User, {
  as: 'applicants',
  foreignKey: 'userId'
});

User.belongsTo(Job, {
  as: 'job-prospects',
  foreignKey: 'userid'
});

module.exports = { User, Job, Category };
