import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tradelink_secret_key_2024";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;

    if (auth && auth.startsWith("Bearer ")) {
        const token = auth.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
            (req as any).userId = decoded.userId;
            (req as any).userRole = decoded.role;
            return next();
        } catch {
            return res.status(401).json({ success: false, error: "Invalid or expired token" });
        }
    }

    return res.status(401).json({ success: false, error: "Unauthorized – please login" });
}

export function generateToken(userId: number, roleName: string): string {
    return jwt.sign({ userId, role: roleName }, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    requireAuth(req, res, () => {
        if ((req as any).userRole === "Admin") {
            return next();
        }
        return res.status(403).json({ success: false, error: "Access denied: Admin role required" });
    });
}
