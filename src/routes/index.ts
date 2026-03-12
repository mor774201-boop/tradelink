import { Router } from "express";
import { userRouter } from "./userRoutes";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { productRouter } from "./productRoutes";
import { orderRouter } from "./orderRoutes";
import { warehouseRouter } from "./warehouseRoutes";
import { inventoryRouter } from "./inventoryRoutes";
import { invoiceRouter } from "./invoiceRoutes";
import { paymentRouter } from "./paymentRoutes";
import { shipmentRouter } from "./shipmentRoutes";
import { roleRouter } from "./roleRoutes";
import { statsRouter } from "./statsRoutes";
import { notificationRouter } from "./notificationRoutes";
import { categoryRouter } from "./categoryRoutes";
import subscriptionRouter from "./subscriptionRoutes";
import withdrawalRouter from "./withdrawalRoutes";
import walletRouter from "./walletRoutes";
import { cartRouter } from "./cartRoutes";
import { recommendationRouter } from "./recommendationRoutes";
import dashboardRoutes from "./dashboardRoutes";
import { aiRouter } from "./aiRoutes";

import * as userController from "../controllers/userController";
import * as productController from "../controllers/productController";
import * as paymentController from "../controllers/paymentController";

export const apiRouter = Router();

apiRouter.use("/users", userRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/warehouses", warehouseRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/invoices", invoiceRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/shipments", shipmentRouter);
apiRouter.use("/roles", roleRouter);
apiRouter.use("/stats", statsRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/subscription", subscriptionRouter);
apiRouter.use("/withdrawals", withdrawalRouter);
apiRouter.use("/wallet", walletRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/recommendations", recommendationRouter);
apiRouter.use("/", dashboardRoutes);
apiRouter.use("/ai", aiRouter);

// Dashboard & Unique Utility Routes
apiRouter.get("/user-data", requireAuth, userController.getCurrentUserData);
apiRouter.post("/logout", requireAuth, userController.logout);

// Specialized views
apiRouter.get("/admin/users", requireAdmin, userController.listUsers);
apiRouter.get("/admin/payments", requireAdmin, paymentController.listPayments);

