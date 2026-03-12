"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletTransaction = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class WalletTransaction extends sequelize_1.Model {
}
exports.WalletTransaction = WalletTransaction;
WalletTransaction.init({
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
    type: {
        type: sequelize_1.DataTypes.ENUM("credit", "debit"),
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    reference_type: {
        type: sequelize_1.DataTypes.ENUM("order", "withdrawal", "subscription", "deposit", "other"),
        allowNull: false
    },
    reference_id: {
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
    tableName: "wallet_transactions",
    timestamps: false
});
