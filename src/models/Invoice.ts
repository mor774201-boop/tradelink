import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { Order } from "./Order";

export interface InvoiceAttributes {
  id: number;
  order_id: number;
  invoice_number: string;
  amount: number;
  status: string;
}

export type InvoiceCreationAttributes = Optional<InvoiceAttributes, "id">;

export class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes {
  public id!: number;
  public order_id!: number;
  public invoice_number!: string;
  public amount!: number;
  public status!: string;
}

Invoice.init(
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
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "unpaid"
    }
  },
  {
    sequelize,
    tableName: "invoices",
    timestamps: false
  }
);



