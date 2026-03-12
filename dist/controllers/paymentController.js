"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPaymentProof = void 0;
exports.createPayment = createPayment;
exports.depositToWallet = depositToWallet;
exports.approvePayment = approvePayment;
exports.getPayment = getPayment;
exports.updatePaymentStatus = updatePaymentStatus;
exports.getPaymentMethods = getPaymentMethods;
exports.getBalance = getBalance;
exports.verifyPaymentOTP = verifyPaymentOTP;
exports.listPayments = listPayments;
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const WalletTransaction_1 = require("../models/WalletTransaction");
const Notification_1 = require("../models/Notification");
const models_1 = require("../models");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Setup Multer for Payment Proofs
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = "public/uploads/payments";
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `proof-${Date.now()}${path_1.default.extname(file.originalname)}`);
    }
});
exports.uploadPaymentProof = (0, multer_1.default)({ storage });
function simulateGateway(method, amount) {
    const timestamp = Date.now();
    const gateways = {
        credit_card: {
            gateway: "TradeLink Pay",
            provider: "Visa / Mastercard",
            reference: `CC-${timestamp}`,
            status: "approved",
            message: "تم الدفع بالبطاقة الائتمانية بنجاح"
        },
        bank_transfer: {
            gateway: "البنك التجاري الدولي (CIB)",
            provider: "Bank Transfer",
            reference: `BNK-${timestamp}`,
            iban: "EG890044500700005007861381409",
            status: "pending",
            message: "يرجى تحويل المبلغ للحساب المذكور ورفع صورة الإيصال"
        },
        instapay: {
            gateway: "InstaPay",
            provider: "InstaPay",
            reference: `INS-${timestamp}`,
            address: "wtsra201006513814",
            status: "pending",
            message: "يرجى التحويل لعنوان انستاباي ورفع صورة التأكيد"
        },
        vodafone_cash: {
            gateway: "فودافون كاش",
            provider: "Vodafone Cash",
            reference: `VFC-${timestamp}`,
            mobile: "01006513814",
            status: "pending",
            message: "يرجى تحويل المبلغ للرقم ورفع سكرين شوت للعملية"
        },
        orange_cash: {
            gateway: "أورنج كاش",
            provider: "Orange Cash",
            reference: `ORC-${timestamp}`,
            mobile: "01206613977",
            status: "pending",
            message: "يرجى تحويل المبلغ للرقم ورفع سكرين شوت للعملية"
        },
        etisalat_cash: {
            gateway: "اتصالات كاش",
            provider: "Etisalat Cash",
            reference: `ETC-${timestamp}`,
            mobile: "01117651342",
            status: "pending",
            message: "يرجى تحويل المبلغ للرقم ورفع سكرين شوت للعملية"
        },
        cash: {
            gateway: "الدفع عند الاستلام",
            provider: "TradeLink COD",
            reference: `COD-${timestamp}`,
            status: "pending",
            message: "سيتم الدفع نقداً عند الاستلام"
        }
    };
    return gateways[method] || { status: "pending", reference: `REF-${timestamp}`, message: "في انتظار التأكيد" };
}
async function createPayment(req, res, next) {
    const t = await models_1.sequelize.transaction();
    try {
        let { order_id, method, amount, buyer_id } = req.body;
        const proof_image = req.file ? `/uploads/payments/${req.file.filename}` : null;
        if (!order_id || !method || amount === undefined) {
            return res.status(400).json({ success: false, error: "Required: order_id, method, amount" });
        }
        const gatewayResponse = simulateGateway(method, Number(amount));
        let paymentStatus = "pending";
        let transaction_ref = gatewayResponse.reference;
        // Wallet payment — deduct from balance immediately (No proof needed for wallet)
        if (method === "wallet") {
            const user = await User_1.User.findByPk(buyer_id, { transaction: t });
            if (!user || user.balance < Number(amount)) {
                await t.rollback();
                return res.status(400).json({ success: false, error: "رصيد غير كافي" });
            }
            await user.update({ balance: user.balance - Number(amount) }, { transaction: t });
            await WalletTransaction_1.WalletTransaction.create({
                user_id: user.id, amount: Number(amount), type: "debit",
                description: `دفع طلب رقم #${order_id}`, reference_type: "order", reference_id: order_id
            }, { transaction: t });
            paymentStatus = "completed";
        }
        const payment = await Payment_1.Payment.create({
            order_id,
            user_id: buyer_id || null,
            method,
            amount: Number(amount),
            status: paymentStatus,
            transaction_ref,
            proof_image
        }, { transaction: t });
        await t.commit();
        res.status(201).json({ success: true, data: payment, gateway_response: gatewayResponse });
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
}
async function depositToWallet(req, res, next) {
    try {
        const { user_id, amount, method } = req.body;
        const proof_image = req.file ? `/uploads/payments/${req.file.filename}` : null;
        if (!user_id || !amount)
            return res.status(400).json({ success: false, error: "بيانات ناقصة" });
        const gatewayResponse = simulateGateway(method, Number(amount));
        const payment = await Payment_1.Payment.create({
            order_id: null,
            user_id: Number(user_id),
            method,
            amount: Number(amount),
            status: "pending",
            transaction_ref: gatewayResponse.reference,
            proof_image: proof_image
        });
        res.json({ success: true, message: "تم تسجيل طلب الإيداع. سيتم تحديث الرصيد بعد مراجعة الصورة.", data: payment, gateway_response: gatewayResponse });
    }
    catch (err) {
        next(err);
    }
}
async function approvePayment(req, res, next) {
    const t = await models_1.sequelize.transaction();
    try {
        const { id } = req.params;
        const { admin_id, status } = req.body; // status: completed or failed
        const payment = await Payment_1.Payment.findByPk(id, { transaction: t });
        if (!payment || payment.status !== "pending") {
            await t.rollback();
            return res.status(400).json({ success: false, error: "العملية غير موجودة أو تم معالجتها مسبقاً" });
        }
        if (status === "completed") {
            // 1. If it's a deposit (no order_id), credit user wallet
            if (!payment.order_id && payment.user_id) {
                const user = await User_1.User.findByPk(payment.user_id, { transaction: t });
                if (user) {
                    await user.update({ balance: Number(user.balance) + Number(payment.amount) }, { transaction: t });
                    await WalletTransaction_1.WalletTransaction.create({
                        user_id: user.id,
                        amount: Number(payment.amount),
                        type: "credit",
                        description: `إيداع رصيد عبر ${payment.method} (موافقة أدمن)`,
                        reference_type: "deposit",
                        reference_id: payment.transaction_ref
                    }, { transaction: t });
                    await Notification_1.Notification.create({
                        user_id: user.id,
                        title: "تم تأكيد الإيداع",
                        message: `تمت الموافقة على إيداع ${payment.amount} ج.م في محفظتك.`,
                        type: "success"
                    }, { transaction: t });
                }
            }
            // 2. If it's an order payment, update order status if necessary
            else if (payment.order_id) {
                const order = await Order_1.Order.findByPk(payment.order_id, { transaction: t });
                if (order) {
                    await order.update({ status: "processing" }, { transaction: t });
                    await Notification_1.Notification.create({
                        user_id: order.buyer_id,
                        title: "تم تأكيد الدفع",
                        message: `تمت الموافقة على دفعة الطلب رقم #${order.id}.`,
                        type: "success"
                    }, { transaction: t });
                }
            }
            await payment.update({ status: "completed", admin_id, verified_at: new Date() }, { transaction: t });
        }
        else {
            await payment.update({ status: "failed", admin_id, verified_at: new Date() }, { transaction: t });
            const targetUserId = payment.user_id || (payment.order_id ? (await Order_1.Order.findByPk(payment.order_id))?.buyer_id : null);
            if (targetUserId) {
                await Notification_1.Notification.create({
                    user_id: targetUserId,
                    title: "فشل تأكيد الدفع",
                    message: `تم رفض إثبات الدفع للعملية #${payment.id}.`,
                    type: "error"
                }, { transaction: t });
            }
        }
        await t.commit();
        res.json({ success: true, message: `تمت معالجة العملية بنجاح: ${status}` });
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
}
async function getPayment(req, res, next) {
    try {
        const payment = await Payment_1.Payment.findByPk(req.params.id, { include: [{ model: Order_1.Order, as: "order" }] });
        if (!payment)
            return res.status(404).json({ success: false, error: "Payment not found" });
        res.json({ success: true, data: payment });
    }
    catch (err) {
        next(err);
    }
}
async function updatePaymentStatus(req, res, next) {
    try {
        const { status, transaction_ref } = req.body;
        const validStatuses = ["pending", "completed", "failed", "refunded"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }
        const payment = await Payment_1.Payment.findByPk(req.params.id);
        if (!payment)
            return res.status(404).json({ success: false, error: "Payment not found" });
        await payment.update({ status, transaction_ref: transaction_ref || payment.transaction_ref });
        res.json({ success: true, data: payment });
    }
    catch (err) {
        next(err);
    }
}
async function getPaymentMethods(_req, res) {
    res.json({
        success: true,
        data: [
            { id: "vodafone_cash", name: "فودافون كاش", icon: "fa-mobile-alt", description: "01006513814", type: "ewallet" },
            { id: "orange_cash", name: "أورنج كاش", icon: "fa-mobile-alt", description: "01206613977", type: "ewallet" },
            { id: "etisalat_cash", name: "اتصالات كاش", icon: "fa-mobile-alt", description: "01117651342", type: "ewallet" },
            { id: "instapay", name: "انستاباي", icon: "fa-bolt", description: "wtsra201006513814", type: "digital" },
            { id: "bank_transfer", name: "تحويل بنكي", icon: "fa-university", description: "IBAN: EG89...1409", type: "bank" },
            { id: "credit_card", name: "بطاقة ائتمانية", icon: "fa-credit-card", description: "الدفع أونلاين", type: "card" },
            { id: "wallet", name: "محفظة TradeLink", icon: "fa-wallet", description: "من رصيدك الحالي", type: "wallet" },
            { id: "cash", name: "الدفع عند الاستلام", icon: "fa-money-bill-wave", description: "نقداً للمندوب", type: "cod" }
        ]
    });
}
async function getBalance(req, res, next) {
    try {
        const user = await User_1.User.findByPk(req.params.userId);
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });
        res.json({ success: true, balance: user.balance });
    }
    catch (err) {
        next(err);
    }
}
async function verifyPaymentOTP(req, res, next) {
    try {
        const { code, payment_id } = req.body;
        if (!code || !payment_id) {
            return res.status(400).json({ success: false, error: "code and payment_id are required" });
        }
        // Look up the payment and check the stored OTP
        const payment = await Payment_1.Payment.findByPk(payment_id);
        if (!payment) {
            return res.status(404).json({ success: false, error: "Payment not found" });
        }
        const storedOtp = payment.otp_code;
        if (!storedOtp) {
            return res.status(400).json({ success: false, error: "No OTP was generated for this payment" });
        }
        if (code === storedOtp) {
            await payment.update({ status: "completed" });
            res.json({ success: true, message: "تم التأكيد بنجاح" });
        }
        else {
            res.status(400).json({ success: false, error: "كود التحقق غير صحيح" });
        }
    }
    catch (err) {
        next(err);
    }
}
async function listPayments(req, res, next) {
    try {
        const userId = req.userId;
        const role = req.userRole;
        const where = {};
        if (role !== "Admin") {
            where.user_id = userId;
        }
        const payments = await Payment_1.Payment.findAll({
            where,
            include: [{ model: Order_1.Order, as: "order" }],
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: payments });
    }
    catch (err) {
        next(err);
    }
}
