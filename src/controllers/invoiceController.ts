import { Request, Response, NextFunction } from "express";
import { Invoice } from "../models/Invoice";
import { Order } from "../models/Order";

export async function listInvoices(_req: Request, res: Response, next: NextFunction) {
    try {
        const invoices = await Invoice.findAll({ include: [{ model: Order, as: "order" }] });
        res.json({ success: true, data: invoices });
    } catch (err) { next(err); }
}

export async function getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
        const invoice = await Invoice.findByPk(req.params.id, { include: [{ model: Order, as: "order" }] });
        if (!invoice) return res.status(404).json({ success: false, error: "Invoice not found" });
        res.json({ success: true, data: invoice });
    } catch (err) { next(err); }
}

export async function createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
        const { order_id, invoice_number, amount, status } = req.body;
        if (!order_id || !invoice_number || amount === undefined) {
            return res.status(400).json({ success: false, error: "Required: order_id, invoice_number, amount" });
        }
        const invoice = await Invoice.create({ order_id, invoice_number, amount: Number(amount), status: status || "unpaid" });
        res.status(201).json({ success: true, data: invoice });
    } catch (err: any) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ success: false, error: "Invoice number already exists" });
        }
        next(err);
    }
}

export async function updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, error: "Invoice not found" });
        await invoice.update(req.body);
        res.json({ success: true, data: invoice });
    } catch (err) { next(err); }
}
