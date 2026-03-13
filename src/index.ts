import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet"; // أمان إضافي
import compression from "compression"; // لسرعة نقل البيانات
import { sequelize } from "./models";
import { initModels } from "./models/initModels";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// --- Middlewares ---
app.use(helmet({
  contentSecurityPolicy: false, // نغلقه إذا واجهت مشاكل في تحميل الصور الخارجية
}));
app.use(cors());
app.use(compression()); // يقلل حجم البيانات المرسلة لتطبيق الموبايل
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// --- Routes ---
app.use("/api", apiRouter);

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Error handler (يجب أن يكون الأخير)
app.use(errorHandler);

async function start() {
  try {
    // الاتصال بقاعدة البيانات
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    initModels();

    // ملاحظة: sync() بدون {force: true} لضمان عدم مسح البيانات عند كل إعادة تشغيل
    await sequelize.sync();

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 TradeLink Server ready at: http://localhost:${PORT}`);
      console.log(`📡 API Base Path: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
}

start();