import { Router } from "express";
import { listRoles, createRole } from "../controllers/roleController";

export const roleRouter = Router();

roleRouter.get("/", listRoles);
roleRouter.post("/", createRole);
