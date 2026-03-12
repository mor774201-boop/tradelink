import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { User } from "./User";

export interface WarehouseAttributes {
  id: number;
  owner_id: number;
  city: string;
  address: string;
  capacity: number;
}

export type WarehouseCreationAttributes = Optional<WarehouseAttributes, "id">;

export class Warehouse
  extends Model<WarehouseAttributes, WarehouseCreationAttributes>
  implements WarehouseAttributes {
  public id!: number;
  public owner_id!: number;
  public city!: string;
  public address!: string;
  public capacity!: number;
}

Warehouse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "warehouses",
    timestamps: false
  }
);



