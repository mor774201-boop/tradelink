import { Router } from "express";
import * as cartController from "../controllers/cartController";

export const cartRouter = Router();

cartRouter.get("/:user_id", cartController.getCart);
cartRouter.post("/add", cartController.addToCart);
cartRouter.patch("/update/:id", cartController.updateCartItem);
cartRouter.delete("/remove/:id", cartController.removeFromCart);
cartRouter.post("/checkout", cartController.checkout);
