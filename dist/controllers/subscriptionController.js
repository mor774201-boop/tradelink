"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubscriptionStatus = checkSubscriptionStatus;
exports.paySubscription = paySubscription;
exports.toggleSubscription = toggleSubscription;
const User_1 = require("../models/User");
const WalletTransaction_1 = require("../models/WalletTransaction");
const Notification_1 = require("../models/Notification");
const models_1 = require("../models");
async function checkSubscriptionStatus(req, res, next) {
    try {
        const user = await User_1.User.findByPk(req.params.userId);
        if (!user)
            return res.status(404).json({ success: false, error: "المستخدم غير موجود" });
        const now = new Date();
        const isActive = user.subscription_status === "active" &&
            user.subscription_expiry &&
            new Date(user.subscription_expiry) > now;
        // Auto-expire if past date
        if (user.subscription_status === "active" && user.subscription_expiry && new Date(user.subscription_expiry) <= now) {
            await user.update({ subscription_status: "expired" });
        }
        res.json({
            success: true,
            data: {
                subscription_status: isActive ? "active" : (user.subscription_status === "none" ? "none" : "expired"),
                subscription_expiry: user.subscription_expiry,
                subscription_date: user.subscription_date,
                is_active: !!isActive
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function paySubscription(req, res, next) {
    const t = await models_1.sequelize.transaction();
    try {
        const { user_id, method } = req.body;
        if (!user_id)
            return res.status(400).json({ success: false, error: "user_id مطلوب" });
        const user = await User_1.User.findByPk(user_id);
        if (!user)
            return res.status(404).json({ success: false, error: "المستخدم غير موجود" });
        const SUBSCRIPTION_FEE = Number(process.env.SUBSCRIPTION_FEE) || 250;
        // Check if user has enough balance for wallet payment
        if (method === "wallet") {
            if (Number(user.balance) < SUBSCRIPTION_FEE) {
                return res.status(400).json({ success: false, error: "رصيد المحفظة غير كافي. المطلوب: 250 ج.م" });
            }
            await user.update({ balance: Number(user.balance) - SUBSCRIPTION_FEE }, { transaction: t });
            // Log wallet transaction
            await WalletTransaction_1.WalletTransaction.create({
                user_id: user.id,
                amount: SUBSCRIPTION_FEE,
                type: "debit",
                description: "دفع قيمة الاشتراك الشهري من المحفظة",
                reference_type: "subscription",
                reference_id: `SUB-WAL-${Date.now()}`
            }, { transaction: t });
        }
        const now = new Date();
        const expiry = new Date(now);
        expiry.setMonth(expiry.getMonth() + 1);
        await user.update({
            subscription_status: "active",
            subscription_date: now,
            subscription_expiry: expiry
        }, { transaction: t });
        const timestamp = Date.now();
        const gateways = {
            bank_transfer: { gateway: "SimBank Egypt", reference: `SUB-BNK-${timestamp}`, message: "تم دفع الاشتراك عبر التحويل البنكي" },
            instapay: { gateway: "InstaPay Egypt", reference: `SUB-INS-${timestamp}`, message: "تم دفع الاشتراك عبر انستاباي" },
            vodafone_cash: { gateway: "فودافون كاش", reference: `SUB-VFC-${timestamp}`, message: "تم دفع الاشتراك عبر فودافون كاش" },
            fawry: { gateway: "فوري", reference: `SUB-FWR-${timestamp}`, message: "تم دفع الاشتراك عبر فوري" },
            credit_card: { gateway: "TradeLink Pay", reference: `SUB-CC-${timestamp}`, message: "تم دفع الاشتراك بالبطاقة الائتمانية" },
            wallet: { gateway: "محفظة TradeLink", reference: `SUB-WAL-${timestamp}`, message: "تم خصم الاشتراك من المحفظة" },
        };
        const gw = gateways[method || "bank_transfer"] || gateways.bank_transfer;
        // Send Notification
        await Notification_1.Notification.create({
            user_id: user.id,
            title: "تفعيل الاشتراك",
            message: `تم تفعيل اشتراكك بنجاح حتى ${expiry.toLocaleDateString('ar-EG')}. شكراً لاستخدامك TradeLink.`,
            type: "success"
        }, { transaction: t });
        await t.commit();
        res.json({
            success: true,
            message: "تم تفعيل الاشتراك بنجاح!",
            data: {
                subscription_status: "active",
                subscription_date: now,
                subscription_expiry: expiry,
                fee: SUBSCRIPTION_FEE
            },
            gateway_response: { ...gw, status: "approved", processed_at: now.toISOString() }
        });
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
}
async function toggleSubscription(req, res, next) {
    try {
        const user = await User_1.User.findByPk(req.params.userId);
        if (!user)
            return res.status(404).json({ success: false, error: "المستخدم غير موجود" });
        const { action } = req.body; // "activate" or "deactivate"
        if (action === "activate") {
            const expiry = new Date();
            expiry.setMonth(expiry.getMonth() + 1);
            await user.update({
                subscription_status: "active",
                subscription_date: new Date(),
                subscription_expiry: expiry
            });
            // Send Notification
            await Notification_1.Notification.create({
                user_id: user.id,
                title: "تعديل حالة الاشتراك",
                message: `تم تفعيل اشتراكك بنجاح بواسطة الإدارة حتى ${expiry.toLocaleDateString('ar-EG')}.`,
                type: "info"
            });
            res.json({ success: true, message: "تم تفعيل الاشتراك بنجاح" });
        }
        else {
            await user.update({ subscription_status: "expired" });
            // Send Notification
            await Notification_1.Notification.create({
                user_id: user.id,
                title: "إلغاء تفعيل الاشتراك",
                message: "تم إلغاء تفعيل اشتراكك بواسطة الإدارة.",
                type: "warning"
            });
            res.json({ success: true, message: "تم إلغاء تفعيل الاشتراك" });
        }
    }
    catch (err) {
        next(err);
    }
}
