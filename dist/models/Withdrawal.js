"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Withdrawal = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Withdrawal extends sequelize_1.Model {
}
exports.Withdrawal = Withdrawal;
Withdrawal.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id"
        }
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    method: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
    },
    transaction_ref: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: index_1.sequelize,
    tableName: "withdrawals",
    timestamps: false
});
