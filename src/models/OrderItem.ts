import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { Order } from "./Order";
import { Product } from "./Product";

export interface OrderItemAttributes {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export type OrderItemCreationAttributes = Optional<OrderItemAttributes, "id">;

export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes {
  public id!: number;
  public order_id!: number;
  public product_id!: number;
  public quantity!: number;
  public unit_price!: number;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "order_items",
    timestamps: false
  }
);



