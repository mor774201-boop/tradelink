"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const auth_1 = require("../middleware/auth");
exports.aiRouter = (0, express_1.Router)();
exports.aiRouter.post("/generate-image", auth_1.requireAuth, aiController_1.generateProductImage);
exports.aiRouter.post("/generate-description", auth_1.requireAuth, aiController_1.generateProductDescription);
