import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface OfferAttributes {
  id: number;
  product_id: number;
  user_id: number;
  title: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  original_price: number;
  offer_price: number;
  start_date: Date;
  end_date: Date;
  description: string | null;
  status: string;
  created_at: Date;
}

export type OfferCreationAttributes = Optional<
  OfferAttributes,
  "id" | "discount_percentage" | "discount_amount" | "description" | "status" | "created_at"
>;

export class Offer
  extends Model<OfferAttributes, OfferCreationAttributes>
  implements OfferAttributes {
  public id!: number;
  public product_id!: number;
  public user_id!: number;
  public title!: string;
  public discount_percentage!: number | null;
  public discount_amount!: number | null;
  public original_price!: number;
  public offer_price!: number;
  public start_date!: Date;
  public end_date!: Date;
  public description!: string | null;
  public status!: string;
  public created_at!: Date;
}

Offer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products", key: "id" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    offer_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "offers",
    timestamps: false,
  }
);
