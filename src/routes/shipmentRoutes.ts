import { Router } from "express";
import { listShipments, getShipment, trackShipment, createShipment, updateShipmentStatus } from "../controllers/shipmentController";

export const shipmentRouter = Router();

shipmentRouter.get("/", listShipments);
shipmentRouter.post("/", createShipment);
shipmentRouter.get("/track/:tracking_number", trackShipment);
shipmentRouter.get("/:id", getShipment);
shipmentRouter.patch("/:id/status", updateShipmentStatus);
