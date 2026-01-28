const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Category = new sequelize.define('Category', {
  title: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  imageName: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

module.exports = Category;
