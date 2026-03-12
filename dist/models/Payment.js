"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Payment extends sequelize_1.Model {
}
exports.Payment = Payment;
Payment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    method: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
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
    proof_image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    admin_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    verified_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: index_1.sequelize,
    tableName: "payments",
    timestamps: false
});
