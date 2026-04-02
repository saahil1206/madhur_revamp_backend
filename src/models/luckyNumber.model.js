const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("LuckyNumber", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, { tableName: "lucky_number", timestamps: false, freezeTableName: true });
