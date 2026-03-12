import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { User } from "./User";

export interface OrderAttributes {
  id: number;
  buyer_id: number;
  seller_id: number;
  total_amount: number;
  status: string;
  created_at: Date;
}

export type OrderCreationAttributes = Optional<
  OrderAttributes,
  "id" | "status" | "created_at"
>;

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes {
  public id!: number;
  public buyer_id!: number;
  public seller_id!: number;
  public total_amount!: number;
  public status!: string;
  public items?: any[]; // Association
  public created_at!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: false
  }
);



