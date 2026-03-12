import { Request, Response, NextFunction } from "express";
import { WalletTransaction } from "../models/WalletTransaction";
import { User } from "../models/User";
import { sequelize } from "../models";
import { QueryTypes } from "sequelize";

export async function getWalletHistory(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId;
        const transactions = await WalletTransaction.findAll({
            where: { user_id: userId },
            order: [["created_at", "DESC"]]
        });
        res.json({ success: true, data: transactions });
    } catch (err) { next(err); }
}

export async function getFinancialSummary(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, error: "المستخدم غير موجود" });

        // Total income (credits)
        const incomeResult = await sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE user_id = ? AND type = 'credit'`,
            { replacements: [userId], type: QueryTypes.SELECT }
        ) as any[];

        // Total spending (debits)
        const spendingResult = await sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE user_id = ? AND type = 'debit'`,
            { replacements: [userId], type: QueryTypes.SELECT }
        ) as any[];

        res.json({
            success: true,
            data: {
                balance: user.balance,
                total_income: parseFloat(incomeResult[0]?.total || "0"),
                total_spending: parseFloat(spendingResult[0]?.total || "0")
            }
        });
    } catch (err) { next(err); }
}
