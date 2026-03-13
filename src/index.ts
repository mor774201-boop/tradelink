import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { sequelize } from "./models";
import { initModels } from "./models/initModels";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// 1. تفعيل الـ CORS أولاً لضمان قبول طلبات Ionic (localhost)
app.use(cors());

// 2. معالجة البيانات القادمة في الـ Request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. الملفات الثابتة (Landing Page)
app.use(express.static(path.join(__dirname, "../public")));

// 4. المسار الرئيسي للـ API
// ملاحظة: الروابط ستكون: https://tradelink.onrender.com/api/suppliers
app.use("/api", apiRouter);

// 5. Root route
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// 6. معالج الأخطاء (يجب أن يكون بعد المسارات)
app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    initModels();
    await sequelize.sync();

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 TradeLink API listening on port ${PORT}`);
      console.log(`🔗 Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
}

start();