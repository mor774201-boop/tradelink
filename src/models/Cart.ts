import { Model, DataTypes } from "sequelize";
import { sequelize } from "./index";

export class Cart extends Model {
    public id!: number;
    public user_id!: number;
    public items?: any[]; // Association
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Cart.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: "carts",
        underscored: true,
    }
);
