"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Notification extends sequelize_1.Model {
}
exports.Notification = Notification;
Notification.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "info"
    },
    read: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: index_1.sequelize,
    tableName: "notifications",
    timestamps: false
});
