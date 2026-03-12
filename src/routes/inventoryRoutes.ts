import { Router } from "express";
import { listInventory, getInventoryItem, createInventoryItem, updateInventory, adjustInventory } from "../controllers/inventoryController";

export const inventoryRouter = Router();

inventoryRouter.get("/", listInventory);
inventoryRouter.post("/", createInventoryItem);
inventoryRouter.get("/:id", getInventoryItem);
inventoryRouter.put("/:id", updateInventory);
inventoryRouter.patch("/:id/adjust", adjustInventory);
