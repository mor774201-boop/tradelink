import { Router } from "express";
import { listUsers, getUser, createUser, register, updateUser, deleteUser, login, approveUser, rejectUser, getRoles, updateBankDetails } from "../controllers/userController";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const userRouter = Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.get("/roles", getRoles);
userRouter.get("/", requireAdmin, listUsers);
userRouter.post("/", requireAdmin, createUser);
userRouter.patch("/:id/approve", requireAdmin, approveUser);
userRouter.patch("/:id/reject", requireAdmin, rejectUser);
userRouter.put("/:id/bank", requireAuth, updateBankDetails);
userRouter.get("/:id", requireAuth, getUser);
userRouter.put("/:id", requireAuth, updateUser);
userRouter.delete("/:id", requireAdmin, deleteUser);
