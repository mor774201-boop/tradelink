"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllWithdrawals = listAllWithdrawals;
exports.getUserWithdrawals = getUserWithdrawals;
exports.createWithdrawal = createWithdrawal;
exports.updateWithdrawalStatus = updateWithdrawalStatus;
const Withdrawal_1 = require("../models/Withdrawal");
const User_1 = require("../models/User");
const WalletTransaction_1 = require("../models/WalletTransaction");
const Notification_1 = require("../models/Notification");
const models_1 = require("../models");
async function listAllWithdrawals(_req, res, next) {
    try {
        const withdrawals = await Withdrawal_1.Withdrawal.findAll({
            include: [{ model: User_1.User, as: "user" }],
            order: [["created_at", "DESC"]]
        });
        res.json({ success: true, data: withdrawals });
    }
    catch (err) {
        next(err);
    }
}
async function getUserWithdrawals(req, res, next) {
    try {
        const withdrawals = await Withdrawal_1.Withdrawal.findAll({
            where: { user_id: req.params.userId },
            order: [["created_at", "DESC"]]
        });
        res.json({ success: true, data: withdrawals });
    }
    catch (err) {
        next(err);
    }
}
async function createWithdrawal(req, res, next) {
    const t = await models_1.sequelize.transaction();
    try {
        const { user_id, amount, method } = req.body;
        if (!user_id || !amount || amount <= 0) {
            return res.status(400).json({ success: false, error: "user_id ومبلغ موجب مطلوبين" });
        }
        const MIN_WITHDRAWAL = Number(process.env.MIN_WITHDRAWAL_AMOUNT) || 50;
        if (amount < MIN_WITHDRAWAL) {
            return res.status(400).json({ success: false, error: `الحد الأدنى للسحب ${MIN_WITHDRAWAL} ج.م` });
        }
        const user = await User_1.User.findByPk(user_id);
        if (!user)
            return res.status(404).json({ success: false, error: "المستخدم غير موجود" });
        // Check subscription
        const now = new Date();
        const isSubscribed = user.subscription_status === "active" &&
            user.subscription_expiry &&
            new Date(user.subscription_expiry) > now;
        if (!isSubscribed) {
            return res.status(403).json({ success: false, error: "يجب تفعيل الاشتراك أولاً لتتمكن من السحب" });
        }
        // Check balance
        if (Number(user.balance) < Number(amount)) {
            return res.status(400).json({ success: false, error: `رصيد غير كافٍ. الرصيد المتاح: ${user.balance} ج.م` });
        }
        const validMethods = ["bank_transfer", "instapay", "vodafone_cash", "fawry", "orange_cash", "etisalat_cash"];
        if (!validMethods.includes(method)) {
            return res.status(400).json({ success: false, error: `طريقة السحب يجب أن تكون: ${validMethods.join(", ")}` });
        }
        const prefixMap = {
            bank_transfer: "WD-BNK",
            instapay: "WD-INS",
            vodafone_cash: "WD-VOD",
            fawry: "WD-FWR",
            orange_cash: "WD-ORC",
            etisalat_cash: "WD-ETC"
        };
        const ref = `${prefixMap[method]}-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        // Deduct balance immediately
        await user.update({ balance: Number(user.balance) - Number(amount) }, { transaction: t });
        // Log wallet transaction
        await WalletTransaction_1.WalletTransaction.create({
            user_id,
            amount: Number(amount),
            type: "debit",
            description: `طلب سحب رصيد عبر ${method}`,
            reference_type: "withdrawal",
            reference_id: ref
        }, { transaction: t });
        const withdrawal = await Withdrawal_1.Withdrawal.create({
            user_id,
            amount: Number(amount),
            method,
            status: "pending",
            transaction_ref: ref
        }, { transaction: t });
        // Send Notification
        await Notification_1.Notification.create({
            user_id,
            title: "طلب سحب جديد",
            message: `تم استلام طلب سحب مبلغ ${amount} ج.م عبر ${method}. جارٍ المراجعة.`,
            type: "info"
        }, { transaction: t });
        await t.commit();
        res.status(201).json({
            success: true,
            message: "تم تقديم طلب السحب بنجاح. سيتم مراجعته خلال 24 ساعة.",
            data: withdrawal,
            new_balance: Number(user.balance)
        });
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
}
async function updateWithdrawalStatus(req, res, next) {
    const t = await models_1.sequelize.transaction();
    try {
        const { status } = req.body;
        if (!["completed", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, error: "الحالة يجب أن تكون completed أو rejected" });
        }
        const withdrawal = await Withdrawal_1.Withdrawal.findByPk(req.params.id);
        if (!withdrawal)
            return res.status(404).json({ success: false, error: "طلب السحب غير موجود" });
        if (withdrawal.status !== "pending") {
            return res.status(400).json({ success: false, error: "لا يمكن تعديل طلب تمت معالجته بالفعل" });
        }
        // If rejecting, refund the balance
        if (status === "rejected") {
            const user = await User_1.User.findByPk(withdrawal.user_id, { transaction: t });
            if (user) {
                await user.update({ balance: Number(user.balance) + Number(withdrawal.amount) }, { transaction: t });
                // Log wallet transaction (refund)
                await WalletTransaction_1.WalletTransaction.create({
                    user_id: user.id,
                    amount: Number(withdrawal.amount),
                    type: "credit",
                    description: `استرداد مبلغ سحب مرفوض: ${withdrawal.transaction_ref}`,
                    reference_type: "withdrawal",
                    reference_id: withdrawal.transaction_ref
                }, { transaction: t });
            }
            // Send Notification
            await Notification_1.Notification.create({
                user_id: withdrawal.user_id,
                title: "رفض طلب سحب",
                message: `تم رفض طلب السحب الخاص بك بمبلغ ${withdrawal.amount} ج.م وإعادة المبلغ لمحفظتك.`,
                type: "warning"
            }, { transaction: t });
        }
        else if (status === "completed") {
            // Send Notification for completion
            await Notification_1.Notification.create({
                user_id: withdrawal.user_id,
                title: "اكتمال طلب سحب",
                message: `تمت الموافقة على طلب السحب بمبلغ ${withdrawal.amount} ج.م وتحويله عبر ${withdrawal.method}.`,
                type: "success"
            }, { transaction: t });
        }
        await withdrawal.update({ status }, { transaction: t });
        await t.commit();
        res.json({
            success: true,
            message: status === "completed" ? "تم الموافقة على طلب السحب" : "تم رفض طلب السحب وإعادة المبلغ",
            data: withdrawal
        });
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
}
