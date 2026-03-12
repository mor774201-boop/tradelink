import { Router } from "express";
import { listWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse } from "../controllers/warehouseController";

export const warehouseRouter = Router();

warehouseRouter.get("/", listWarehouses);
warehouseRouter.post("/", createWarehouse);
warehouseRouter.get("/:id", getWarehouse);
warehouseRouter.put("/:id", updateWarehouse);
warehouseRouter.delete("/:id", deleteWarehouse);
