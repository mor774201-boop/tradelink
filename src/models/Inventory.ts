import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { Product } from "./Product";
import { Warehouse } from "./Warehouse";

export interface InventoryAttributes {
  id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
}

export type InventoryCreationAttributes = Optional<InventoryAttributes, "id">;

export class Inventory
  extends Model<InventoryAttributes, InventoryCreationAttributes>
  implements InventoryAttributes {
  public id!: number;
  public product_id!: number;
  public warehouse_id!: number;
  public quantity!: number;
}

Inventory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: "inventory",
    timestamps: false
  }
);



