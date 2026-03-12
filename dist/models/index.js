"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbUrl = process.env.DATABASE_URL || "sqlite://./database.sqlite";
const dialect = dbUrl.split(":")[0];
exports.sequelize = new sequelize_1.Sequelize(dbUrl, {
    dialect: dialect,
    logging: false,
    dialectOptions: dialect === 'postgres' ? {
        ssl: false
    } : {}
});
