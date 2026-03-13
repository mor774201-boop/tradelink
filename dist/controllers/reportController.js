"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletHistory = getWalletHistory;
exports.getFinancialSummary = getFinancialSummary;
const WalletTransaction_1 = require("../models/WalletTransaction");
const User_1 = require("../models/User");
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
async function getWalletHistory(req, res, next) {
    try {
        const userId = req.params.userId;
        const transactions = await WalletTransaction_1.WalletTransaction.findAll({
            where: { user_id: userId },
            order: [["created_at", "DESC"]]
        });
        res.json({ success: true, data: transactions });
    }
    catch (err) {
        next(err);
    }
}
async function getFinancialSummary(req, res, next) {
    try {
        const userId = req.params.userId;
        const user = await User_1.User.findByPk(userId);
        if (!user)
            return res.status(404).json({ success: false, error: "المستخدم غير موجود" });
        // Total income (credits)
        const incomeResult = await models_1.sequelize.query(`SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE user_id = ? AND type = 'credit'`, { replacements: [userId], type: sequelize_1.QueryTypes.SELECT });
        // Total spending (debits)
        const spendingResult = await models_1.sequelize.query(`SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE user_id = ? AND type = 'debit'`, { replacements: [userId], type: sequelize_1.QueryTypes.SELECT });
        res.json({
            success: true,
            data: {
                balance: user.balance,
                total_income: parseFloat(incomeResult[0]?.total || "0"),
                total_spending: parseFloat(spendingResult[0]?.total || "0")
            }
        });
    }
    catch (err) {
        next(err);
    }
}
