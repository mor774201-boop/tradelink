"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "roles",
            key: "id"
        }
    },
    company_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    balance: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "active"
    },
    subscription_status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "none"
    },
    subscription_expiry: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    subscription_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    bank_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    account_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    iban: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    swift_code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    account_holder_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    instapay_address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    vodafone_cash_number: {
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
    tableName: "users",
    timestamps: false,
    defaultScope: {
        attributes: { exclude: ["password"] }
    }
});
