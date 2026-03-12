"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRouter = void 0;
const express_1 = require("express");
const roleController_1 = require("../controllers/roleController");
exports.roleRouter = (0, express_1.Router)();
exports.roleRouter.get("/", roleController_1.listRoles);
exports.roleRouter.post("/", roleController_1.createRole);
