import { Router } from "express";
import { listCategories, getCategory, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController";

export const categoryRouter = Router();

categoryRouter.get("/", listCategories);
categoryRouter.post("/", createCategory);
categoryRouter.get("/:id", getCategory);
categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);
