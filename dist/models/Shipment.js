"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shipment = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Shipment extends sequelize_1.Model {
}
exports.Shipment = Shipment;
Shipment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    company: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    tracking_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "created"
    },
    delivered_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: index_1.sequelize,
    tableName: "shipments",
    timestamps: false
});
