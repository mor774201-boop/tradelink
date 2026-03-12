"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Cart extends sequelize_1.Model {
}
exports.Cart = Cart;
Cart.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: index_1.sequelize,
    tableName: "carts",
    underscored: true,
});
