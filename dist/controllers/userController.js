"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.getUser = getUser;
exports.register = register;
exports.createUser = createUser;
exports.approveUser = approveUser;
exports.rejectUser = rejectUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.login = login;
exports.getRoles = getRoles;
exports.getCurrentUserData = getCurrentUserData;
exports.updateBankDetails = updateBankDetails;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const auth_1 = require("../middleware/auth");
async function listUsers(_req, res, next) {
    try {
        const users = await User_1.User.findAll({ include: [{ model: Role_1.Role, as: "role" }] });
        res.json({ success: true, data: users });
    }
    catch (err) {
        next(err);
    }
}
async function getUser(req, res, next) {
    try {
        const user = await User_1.User.findByPk(req.params.id, { include: [{ model: Role_1.Role, as: "role" }] });
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
// Register — new users get status "pending" until admin approves
async function register(req, res, next) {
    try {
        const { name, email, password, role_id, phone, company_name, location } = req.body;
        if (!name || !email || !password || !role_id) {
            return res.status(400).json({ success: false, error: "name, email, password, role_id are required" });
        }
        const exists = await User_1.User.findOne({ where: { email } });
        if (exists)
            return res.status(409).json({ success: false, error: "البريد الإلكتروني مسجل بالفعل" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.User.create({
            name, email, password: hashedPassword, role_id,
            phone, company_name, location,
            status: "pending" // pending until admin approves
        });
        const fullUser = await User_1.User.findByPk(user.id, { include: [{ model: Role_1.Role, as: "role" }] });
        res.status(201).json({ success: true, message: "تم إنشاء الحساب بنجاح. في انتظار تأكيد الأدمن.", data: fullUser });
    }
    catch (err) {
        next(err);
    }
}
// Admin creates user directly (active immediately)
async function createUser(req, res, next) {
    try {
        const { name, email, password, role_id, phone, company_name, location } = req.body;
        if (!name || !email || !password || !role_id) {
            return res.status(400).json({ success: false, error: "name, email, password, role_id are required" });
        }
        const exists = await User_1.User.findOne({ where: { email } });
        if (exists)
            return res.status(409).json({ success: false, error: "Email already registered" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.User.create({
            name, email, password: hashedPassword, role_id,
            phone, company_name, location,
            status: "active" // admin-created users are active immediately
        });
        const fullUser = await User_1.User.findByPk(user.id, { include: [{ model: Role_1.Role, as: "role" }] });
        const roleName = fullUser.role?.name || "User";
        const token = (0, auth_1.generateToken)(user.id, roleName);
        res.status(201).json({ success: true, token, data: fullUser });
    }
    catch (err) {
        next(err);
    }
}
// Admin approves a pending user
async function approveUser(req, res, next) {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });
        await user.update({ status: "active" });
        res.json({ success: true, message: "تم تأكيد الحساب بنجاح", data: user });
    }
    catch (err) {
        next(err);
    }
}
// Admin rejects a pending user
async function rejectUser(req, res, next) {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });
        await user.update({ status: "rejected" });
        res.json({ success: true, message: "تم رفض الحساب", data: user });
    }
    catch (err) {
        next(err);
    }
}
async function updateUser(req, res, next) {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });
        if (req.body.password) {
            req.body.password = await bcryptjs_1.default.hash(req.body.password, 10);
        }
        await user.update(req.body);
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function deleteUser(req, res, next) {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });
        await user.destroy();
        res.json({ success: true, message: "User deleted" });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "email and password are required" });
        }
        const user = await User_1.User.unscoped().findOne({ where: { email }, include: [{ model: Role_1.Role, as: "role" }] });
        if (!user) {
            return res.status(401).json({ success: false, error: "بريد إلكتروني أو كلمة مرور غير صحيحة" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
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
        const roleName = user.role?.name || "User";
        const token = (0, auth_1.generateToken)(user.id, roleName);
        res.json({ success: true, token, user });
    }
    catch (err) {
        next(err);
    }
}
// Get roles (for registration form)
async function getRoles(_req, res, next) {
    try {
        const roles = await Role_1.Role.findAll();
        res.json({ success: true, data: roles });
    }
    catch (err) {
        next(err);
    }
}
async function getCurrentUserData(req, res, next) {
    try {
        const userId = req.userId;
        const user = await User_1.User.findByPk(userId, {
            include: [{ model: Role_1.Role, as: "role" }]
        });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function updateBankDetails(req, res, next) {
    try {
        const { bank_name, account_number, iban, swift_code, account_holder_name, instapay_address, vodafone_cash_number } = req.body;
        const user = await User_1.User.findByPk(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });
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
    }
    catch (err) {
        next(err);
    }
}
// Logout
async function logout(_req, res) {
    res.json({ success: true });
}
