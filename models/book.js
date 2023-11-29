const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issue_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  return_time: {
    type: DataTypes.DATE,
  },
  late_fee: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

sequelize.sync();

module.exports = Book;