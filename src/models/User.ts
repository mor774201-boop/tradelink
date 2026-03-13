import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import { Role } from "./Role";

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  role_id: number;
  company_name: string | null;
  location: string | null;
  balance: number;
  status: string;
  subscription_status: string;
  subscription_expiry: Date | null;
  subscription_date: Date | null;
  bank_name: string | null;
  account_number: string | null;
  iban: string | null;
  swift_code: string | null;
  account_holder_name: string | null;
  instapay_address: string | null;
  vodafone_cash_number: string | null;
  otp_code: string | null;
  otp_expiry: Date | null;
  governorate: string | null;
  center: string | null;
  is_phone_verified: boolean;
  created_at: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "phone" | "company_name" | "location" | "balance" | "status" | "subscription_status" | "subscription_expiry" | "subscription_date" | "bank_name" | "account_number" | "iban" | "swift_code" | "account_holder_name" | "instapay_address" | "vodafone_cash_number" | "otp_code" | "otp_expiry" | "governorate" | "center" | "is_phone_verified" | "created_at"
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone!: string | null;
  public password!: string;
  public role_id!: number;
  public company_name!: string | null;
  public location!: string | null;
  public balance!: number;
  public status!: string;
  public subscription_status!: string;
  public subscription_expiry!: Date | null;
  public subscription_date!: Date | null;
  public bank_name!: string | null;
  public account_number!: string | null;
  public iban!: string | null;
  public swift_code!: string | null;
  public account_holder_name!: string | null;
  public instapay_address!: string | null;
  public vodafone_cash_number!: string | null;
  public otp_code!: string | null;
  public otp_expiry!: Date | null;
  public governorate!: string | null;
  public center!: string | null;
  public is_phone_verified!: boolean;
  public created_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "id"
      }
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active"
    },
    subscription_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "none"
    },
    subscription_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    subscription_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: true
    },
    swift_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_holder_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    instapay_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vodafone_cash_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    otp_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    otp_expiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    governorate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    center: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_phone_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ["password", "otp_code"] }
    }
  }
);



