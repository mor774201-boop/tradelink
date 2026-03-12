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

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", apiRouter);

// Error handler middleware (must be after routes)
app.use(errorHandler);

// Root route - serve the landing page
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

async function start() {
  try {
    await sequelize.authenticate();
    initModels();
    await sequelize.sync();
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`TradeLink API listening on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

start();
