import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Op } from "sequelize";

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, location, category_id, role } = req.query;
    const where: any = {};
    const userWhere: any = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (category_id) where.category_id = category_id;
    if (location) userWhere.location = { [Op.like]: `%${location}%` };

    const products = await Product.findAll({
      where,
      include: [
        {
          model: User,
          as: "supplier",
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined
        },
        { model: Category, as: "category" }
      ]
    });

    // Strategy: for Retailer → show wholesale_price as price; for Wholesaler → show existing prices
    const processedProducts = products.map(p => {
      const data = p.toJSON() as any;
      if (role === "Retailer" && data.wholesale_price) {
        data.price = data.wholesale_price;
        data.is_wholesale = true;
      } else if (role === "Wholesaler") {
        // For wholesalers browsing supplier products, show wholesale_price prominently
        data.is_wholesale = !!data.wholesale_price;
      }
      return data;
    });

    res.json({ success: true, data: processedProducts });
  } catch (err) { next(err); }
}


export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findByPk(req.params.id, { include: [{ model: User, as: "supplier" }] });
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, sku, price, wholesale_price, min_order_qty, supplier_id, quantity, status, category_id, description, image } = req.body;

    if (!name || !sku || price === undefined || !supplier_id) {
      return res.status(400).json({
        success: false,
        error: "Required fields: name, sku, price, supplier_id"
      });
    }
    const product = await Product.create({
      name, sku,
      price: Number(price),
      wholesale_price: wholesale_price ? Number(wholesale_price) : null,
      min_order_qty: Number(min_order_qty) || 1,
      supplier_id: Number(supplier_id),
      quantity: Number(quantity) || 0,
      status: status || "active",
      category_id: category_id ? Number(category_id) : null,
      description: description || null,
      image: image || null
    });
    res.status(201).json({ success: true, data: product });
  } catch (err: any) {
    console.error("Product creation error:", err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, error: "SKU already exists" });
    }
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ success: false, error: "Invalid supplier_id or category_id" });
    }
    res.status(500).json({ success: false, error: err.message || "Failed to create product" });
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    await product.update(req.body);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    await product.destroy();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) { next(err); }
}
