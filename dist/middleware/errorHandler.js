"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.error("[Error]", err);
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    res.status(status).json({ success: false, error: message, details: err.errors || undefined });
}
