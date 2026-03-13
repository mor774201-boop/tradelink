"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInvoices = listInvoices;
exports.getInvoice = getInvoice;
exports.createInvoice = createInvoice;
exports.updateInvoice = updateInvoice;
const Invoice_1 = require("../models/Invoice");
const Order_1 = require("../models/Order");
async function listInvoices(_req, res, next) {
    try {
        const invoices = await Invoice_1.Invoice.findAll({ include: [{ model: Order_1.Order, as: "order" }] });
        res.json({ success: true, data: invoices });
    }
    catch (err) {
        next(err);
    }
}
async function getInvoice(req, res, next) {
    try {
        const invoice = await Invoice_1.Invoice.findByPk(req.params.id, { include: [{ model: Order_1.Order, as: "order" }] });
        if (!invoice)
            return res.status(404).json({ success: false, error: "Invoice not found" });
        res.json({ success: true, data: invoice });
    }
    catch (err) {
        next(err);
    }
}
async function createInvoice(req, res, next) {
    try {
        const { order_id, invoice_number, amount, status } = req.body;
        if (!order_id || !invoice_number || amount === undefined) {
            return res.status(400).json({ success: false, error: "Required: order_id, invoice_number, amount" });
        }
        const invoice = await Invoice_1.Invoice.create({ order_id, invoice_number, amount: Number(amount), status: status || "unpaid" });
        res.status(201).json({ success: true, data: invoice });
    }
    catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ success: false, error: "Invoice number already exists" });
        }
        next(err);
    }
}
async function updateInvoice(req, res, next) {
    try {
        const invoice = await Invoice_1.Invoice.findByPk(req.params.id);
        if (!invoice)
            return res.status(404).json({ success: false, error: "Invoice not found" });
        await invoice.update(req.body);
        res.json({ success: true, data: invoice });
    }
    catch (err) {
        next(err);
    }
}
