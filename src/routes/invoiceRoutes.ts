import { Router } from "express";
import { listInvoices, getInvoice, createInvoice, updateInvoice } from "../controllers/invoiceController";

export const invoiceRouter = Router();

invoiceRouter.get("/", listInvoices);
invoiceRouter.post("/", createInvoice);
invoiceRouter.get("/:id", getInvoice);
invoiceRouter.put("/:id", updateInvoice);
