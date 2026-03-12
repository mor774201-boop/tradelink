import { Router } from "express";
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { requireAuth } from "../middleware/auth";

export const productRouter = Router();

productRouter.get("/", listProducts);
productRouter.post("/", requireAuth, createProduct);
productRouter.get("/:id", getProduct);
productRouter.put("/:id", requireAuth, updateProduct);
productRouter.delete("/:id", requireAuth, deleteProduct);
