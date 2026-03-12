"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warehouse = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Warehouse extends sequelize_1.Model {
}
exports.Warehouse = Warehouse;
Warehouse.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    owner_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    capacity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: index_1.sequelize,
    tableName: "warehouses",
    timestamps: false
});
