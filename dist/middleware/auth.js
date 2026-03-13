"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.generateToken = generateToken;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "tradelink_secret_key_2024";
function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
        const token = auth.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
            req.userRole = decoded.role;
            return next();
        }
        catch {
            return res.status(401).json({ success: false, error: "Invalid or expired token" });
        }
    }
    return res.status(401).json({ success: false, error: "Unauthorized – please login" });
}
function generateToken(userId, roleName) {
    return jsonwebtoken_1.default.sign({ userId, role: roleName }, JWT_SECRET, { expiresIn: "7d" });
}
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.userRole === "Admin") {
            return next();
        }
        return res.status(403).json({ success: false, error: "Access denied: Admin role required" });
    });
}
