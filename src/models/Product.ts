import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { User } from "./User";

export interface ProductAttributes {
  id: number;
  supplier_id: number;
  category_id: number | null;
  name: string;
  sku: string;
  price: number;
  wholesale_price: number | null;
  min_order_qty: number;
  status: string;
  quantity: number;
  image: string | null;
  description: string | null;
  ai_description: string | null;
  created_at: Date;
}

export type ProductCreationAttributes = Optional<
  ProductAttributes,
  "id" | "category_id" | "wholesale_price" | "status" | "image" | "description" | "ai_description" | "created_at"
>;

export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes {
  public id!: number;
  public supplier_id!: number;
  public category_id!: number | null;
  public name!: string;
  public sku!: string;
  public price!: number;
  public wholesale_price!: number | null;
  public min_order_qty!: number;
  public status!: string;
  public quantity!: number;
  public image!: string | null;
  public description!: string | null;
  public ai_description!: string | null;
  public created_at!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id"
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    wholesale_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    min_order_qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active"
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ai_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: "products",
    timestamps: false
  }
);



