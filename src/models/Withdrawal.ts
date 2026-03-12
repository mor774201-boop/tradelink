import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface WithdrawalAttributes {
    id: number;
    user_id: number;
    amount: number;
    method: string;
    status: string;
    transaction_ref: string | null;
    created_at: Date;
}

export type WithdrawalCreationAttributes = Optional<
    WithdrawalAttributes,
    "id" | "status" | "transaction_ref" | "created_at"
>;

export class Withdrawal
    extends Model<WithdrawalAttributes, WithdrawalCreationAttributes>
    implements WithdrawalAttributes {
    public id!: number;
    public user_id!: number;
    public amount!: number;
    public method!: string;
    public status!: string;
    public transaction_ref!: string | null;
    public created_at!: Date;
}

Withdrawal.init(
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
        method: {
            type: DataTypes.STRING,
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
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        tableName: "withdrawals",
        timestamps: false
    }
);
