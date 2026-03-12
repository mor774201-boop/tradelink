import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface WalletTransactionAttributes {
    id: number;
    user_id: number;
    amount: number;
    type: "credit" | "debit";
    description: string;
    reference_type: "order" | "withdrawal" | "subscription" | "deposit" | "other";
    reference_id: string | number | null;
    created_at: Date;
}

export type WalletTransactionCreationAttributes = Optional<
    WalletTransactionAttributes,
    "id" | "created_at"
>;

export class WalletTransaction
    extends Model<WalletTransactionAttributes, WalletTransactionCreationAttributes>
    implements WalletTransactionAttributes {
    public id!: number;
    public user_id!: number;
    public amount!: number;
    public type!: "credit" | "debit";
    public description!: string;
    public reference_type!: "order" | "withdrawal" | "subscription" | "deposit" | "other";
    public reference_id!: string | number | null;
    public created_at!: Date;
}

WalletTransaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id"
            }
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM("credit", "debit"),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reference_type: {
            type: DataTypes.ENUM("order", "withdrawal", "subscription", "deposit", "other"),
            allowNull: false
        },
        reference_id: {
            type: DataTypes.STRING,
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
        tableName: "wallet_transactions",
        timestamps: false
    }
);
