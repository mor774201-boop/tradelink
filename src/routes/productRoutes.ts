import { Router } from "express";
import { listProducts, listSuppliers, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { requireAuth } from "../middleware/auth";

export const productRouter = Router();

productRouter.get("/suppliers", listSuppliers);
productRouter.get("/", listProducts);
productRouter.post("/", requireAuth, createProduct);
productRouter.get("/:id", getProduct);
productRouter.put("/:id", requireAuth, updateProduct);
productRouter.delete("/:id", requireAuth, deleteProduct);
