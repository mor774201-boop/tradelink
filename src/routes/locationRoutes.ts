import { Router } from "express";
import { getEgyptLocations } from "../controllers/locationController";

export const locationRouter = Router();

locationRouter.get("/egypt", getEgyptLocations);
