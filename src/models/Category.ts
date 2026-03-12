import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface CategoryAttributes {
    id: number;
    name: string;
    description: string | null;
}

export type CategoryCreationAttributes = Optional<
    CategoryAttributes,
    "id" | "description"
>;

export class Category
    extends Model<CategoryAttributes, CategoryCreationAttributes>
    implements CategoryAttributes {
    public id!: number;
    public name!: string;
    public description!: string | null;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: "categories",
        timestamps: false
    }
);
