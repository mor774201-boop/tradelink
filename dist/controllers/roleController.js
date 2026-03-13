"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRoles = listRoles;
exports.createRole = createRole;
const Role_1 = require("../models/Role");
async function listRoles(_req, res, next) {
    try {
        const roles = await Role_1.Role.findAll();
        res.json({ success: true, data: roles });
    }
    catch (err) {
        next(err);
    }
}
async function createRole(req, res, next) {
    try {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ success: false, error: "name is required" });
        const role = await Role_1.Role.create({ name });
        res.status(201).json({ success: true, data: role });
    }
    catch (err) {
        next(err);
    }
}
