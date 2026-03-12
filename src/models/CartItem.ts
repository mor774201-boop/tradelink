import { Model, DataTypes } from "sequelize";
import { sequelize } from "./index";

export class CartItem extends Model {
    public id!: number;
    public cart_id!: number;
    public product_id!: number;
    public quantity!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

CartItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cart_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    },
    {
        sequelize,
        tableName: "cart_items",
        underscored: true,
    }
);
