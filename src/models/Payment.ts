import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { Order } from "./Order";

export interface PaymentAttributes {
  id: number;
  order_id: number | null;
  user_id: number | null;
  method: string;
  amount: number;
  status: string;
  transaction_ref: string | null;
  proof_image: string | null;
  admin_id: number | null;
  verified_at: Date | null;
  created_at: Date;
}

export type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  "id" | "order_id" | "user_id" | "transaction_ref" | "proof_image" | "admin_id" | "verified_at" | "created_at"
>;

export class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes {
  public id!: number;
  public order_id!: number | null;
  public user_id!: number | null;
  public method!: string;
  public amount!: number;
  public status!: string;
  public transaction_ref!: string | null;
  public proof_image!: string | null;
  public admin_id!: number | null;
  public verified_at!: Date | null;
  public created_at!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending"
    },
    transaction_ref: {
      type: DataTypes.STRING,
      allowNull: true
    },
    proof_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    verified_at: {
      type: DataTypes.DATE,
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
    tableName: "payments",
    timestamps: false
  }
);



