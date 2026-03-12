import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { generateToken } from "../middleware/auth";

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.findAll({ include: [{ model: Role, as: "role" }] });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findByPk(req.params.id, { include: [{ model: Role, as: "role" }] });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

// Register — new users get status "pending" until admin approves
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, role_id, phone, company_name, location } = req.body;
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ success: false, error: "name, email, password, role_id are required" });
    }
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ success: false, error: "البريد الإلكتروني مسجل بالفعل" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashedPassword, role_id,
      phone, company_name, location,
      status: "pending"  // pending until admin approves
    });

    const fullUser = await User.findByPk(user.id, { include: [{ model: Role, as: "role" }] });
    res.status(201).json({ success: true, message: "تم إنشاء الحساب بنجاح. في انتظار تأكيد الأدمن.", data: fullUser });
  } catch (err) { next(err); }
}

// Admin creates user directly (active immediately)
export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, role_id, phone, company_name, location } = req.body;
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ success: false, error: "name, email, password, role_id are required" });
    }
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ success: false, error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashedPassword, role_id,
      phone, company_name, location,
      status: "active"  // admin-created users are active immediately
    });

    const fullUser = await User.findByPk(user.id, { include: [{ model: Role, as: "role" }] });
    const roleName = (fullUser as any).role?.name || "User";
    const token = generateToken(user.id, roleName);

    res.status(201).json({ success: true, token, data: fullUser });
  } catch (err) { next(err); }
}

// Admin approves a pending user
export async function approveUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    await user.update({ status: "active" });
    res.json({ success: true, message: "تم تأكيد الحساب بنجاح", data: user });
  } catch (err) { next(err); }
}

// Admin rejects a pending user
export async function rejectUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    await user.update({ status: "rejected" });
    res.json({ success: true, message: "تم رفض الحساب", data: user });
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    await user.update(req.body);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    await user.destroy();
    res.json({ success: true, message: "User deleted" });
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "email and password are required" });
    }
    const user = await (User as any).unscoped().findOne({ where: { email }, include: [{ model: Role, as: "role" }] });
    if (!user) {
      return res.status(401).json({ success: false, error: "بريد إلكتروني أو كلمة مرور غير صحيحة" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "بريد إلكتروني أو كلمة مرور غير صحيحة" });
    }
    if (user.status === "pending") {
      return res.status(403).json({ success: false, error: "حسابك في انتظار تأكيد الأدمن" });
    }
    if (user.status === "rejected") {
      return res.status(403).json({ success: false, error: "تم رفض حسابك" });
    }
    if (user.status !== "active") {
      return res.status(403).json({ success: false, error: "الحساب غير نشط" });
    }

    const roleName = (user as any).role?.name || "User";
    const token = generateToken(user.id, roleName);
    res.json({ success: true, token, user });
  } catch (err) { next(err); }
}

// Get roles (for registration form)
export async function getRoles(_req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await Role.findAll();
    res.json({ success: true, data: roles });
  } catch (err) { next(err); }
}

export async function getCurrentUserData(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: "role" }]
    });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updateBankDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { bank_name, account_number, iban, swift_code, account_holder_name, instapay_address, vodafone_cash_number } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    await user.update({
      bank_name,
      account_number,
      iban,
      swift_code,
      account_holder_name,
      instapay_address,
      vodafone_cash_number
    });

    res.json({ success: true, message: "تم تحديث بيانات الحساب البنكي بنجاح", data: user });
  } catch (err) { next(err); }
}

// Logout
export async function logout(_req: Request, res: Response) {
  res.json({ success: true });
}
