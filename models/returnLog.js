const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const ReturnLog = sequelize.define('ReturnLog', {
  bookTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lateFee: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  returnTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

sequelize.sync(); 

module.exports = ReturnLog;
