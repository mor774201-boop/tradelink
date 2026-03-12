"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Category extends sequelize_1.Model {
}
exports.Category = Category;
Category.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize: index_1.sequelize,
    tableName: "categories",
    timestamps: false
});
