"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const models_1 = require("./models");
const initModels_1 = require("./models/initModels");
const routes_1 = require("./routes");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from the 'public' directory
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use("/api", routes_1.apiRouter);
// Error handler middleware (must be after routes)
app.use(errorHandler_1.errorHandler);
// Root route - serve the landing page
app.get("/", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/index.html"));
});
async function start() {
    try {
        await models_1.sequelize.authenticate();
        (0, initModels_1.initModels)();
        await models_1.sequelize.sync();
        app.listen(Number(PORT), "0.0.0.0", () => {
            console.log(`TradeLink API listening on http://0.0.0.0:${PORT}`);
        });
    }
    catch (error) {
        console.error("Unable to start server:", error);
        process.exit(1);
    }
}
start();
