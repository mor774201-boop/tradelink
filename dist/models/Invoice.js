"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Invoice extends sequelize_1.Model {
}
exports.Invoice = Invoice;
Invoice.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    invoice_number: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "unpaid"
    }
}, {
    sequelize: index_1.sequelize,
    tableName: "invoices",
    timestamps: false
});
