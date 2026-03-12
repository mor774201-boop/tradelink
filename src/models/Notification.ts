import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface NotificationAttributes {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    created_at: Date;
}

export type NotificationCreationAttributes = Optional<
    NotificationAttributes,
    "id" | "read" | "created_at"
>;

export class Notification
    extends Model<NotificationAttributes, NotificationCreationAttributes>
    implements NotificationAttributes {
    public id!: number;
    public user_id!: number;
    public title!: string;
    public message!: string;
    public type!: string;
    public read!: boolean;
    public created_at!: Date;
}

Notification.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "info"
        },
        read: {
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
        tableName: "notifications",
        timestamps: false
    }
);
