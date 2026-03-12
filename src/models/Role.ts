import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface RoleAttributes {
  id: number;
  name: string;
}

export type RoleCreationAttributes = Optional<RoleAttributes, "id">;

export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: number;
  public name!: string;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: false
  }
);

