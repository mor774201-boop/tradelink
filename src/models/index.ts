import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "sqlite://./database.sqlite";
const dialect = dbUrl.split(":")[0] as any;

export const sequelize = new Sequelize(dbUrl, {
  dialect: dialect,
  logging: false,
  dialectOptions: dialect === 'postgres' ? {
    ssl: false
  } : {}
});

