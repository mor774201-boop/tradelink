import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { Offer } from "../models/Offer";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Op } from "sequelize";

export const offerRouter = Router();

// List all active offers (public)
offerRouter.get("/", async (req, res) => {
  try {
    const where: any = {};
    if (req.query.user_id) where.user_id = req.query.user_id;
    if (req.query.status) where.status = req.query.status;
    
    const offers = await Offer.findAll({
      where,
      include: [
        { model: Product, as: "product" },
        { model: User, as: "user", attributes: ["id", "name", "company_name"] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: offers });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get active offers only (for browsing)
offerRouter.get("/active", async (_req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.findAll({
      where: {
        status: "active",
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
      include: [
        { model: Product, as: "product" },
        { model: User, as: "user", attributes: ["id", "name", "company_name"] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: offers });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create an offer
offerRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { product_id, user_id, title, discount_percentage, original_price, offer_price, start_date, end_date, description } = req.body;
    
    const discount_amount = original_price - offer_price;
    
    const offer = await Offer.create({
      product_id,
      user_id,
      title,
      discount_percentage: discount_percentage || (discount_amount / original_price * 100),
      discount_amount,
      original_price,
      offer_price,
      start_date,
      end_date,
      description,
    });
    
    res.json({ success: true, data: offer });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Update offer status
offerRouter.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ success: false, error: "العرض غير موجود" });
    await offer.update({ status: req.body.status });
    res.json({ success: true, data: offer });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete offer
offerRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ success: false, error: "العرض غير موجود" });
    await offer.destroy();
    res.json({ success: true, message: "تم حذف العرض" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});
