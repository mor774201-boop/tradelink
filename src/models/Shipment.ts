import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { Order } from "./Order";

export interface ShipmentAttributes {
  id: number;
  order_id: number;
  company: string;
  tracking_number: string;
  status: string;
  delivered_at: Date | null;
}

export type ShipmentCreationAttributes = Optional<
  ShipmentAttributes,
  "id" | "delivered_at"
>;

export class Shipment
  extends Model<ShipmentAttributes, ShipmentCreationAttributes>
  implements ShipmentAttributes {
  public id!: number;
  public order_id!: number;
  public company!: string;
  public tracking_number!: string;
  public status!: string;
  public delivered_at!: Date | null;
}

Shipment.init(
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
    company: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tracking_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "created"
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "shipments",
    timestamps: false
  }
);



