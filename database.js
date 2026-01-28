const { Sequelize } = require('seqelize');

const sequelize new Sequelize ({
  dialect: 'sqlite',
  storage: './database.db',
  logging: false
});

module.exports = sequelize;
