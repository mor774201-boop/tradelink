import bcrypt from "bcryptjs";
import { sequelize } from "./models";
import { Role } from "./models/Role";
import { User } from "./models/User";
import { Product } from "./models/Product";
import { Category } from "./models/Category";
import { Warehouse } from "./models/Warehouse";
import { Inventory } from "./models/Inventory";
import { Order } from "./models/Order";
import { OrderItem } from "./models/OrderItem";
import { Invoice } from "./models/Invoice";
import { Payment } from "./models/Payment";
import { Shipment } from "./models/Shipment";
import { Notification } from "./models/Notification";
import { Withdrawal } from "./models/Withdrawal";
import { initModels } from "./models/initModels";

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        initModels();
        await sequelize.sync({ force: true });
        console.log("Database synced (forced).");

        // ── Roles ──
        const roles = await Role.bulkCreate([
            { name: "Supplier" },
            { name: "Wholesaler" },
            { name: "Retailer" },
            { name: "Customer" },
            { name: "Admin" }
        ]);
        console.log("Roles seeded.");

        const supplierRole = roles.find(r => r.name === "Supplier")!;
        const wholesalerRole = roles.find(r => r.name === "Wholesaler")!;
        const customerRole = roles.find(r => r.name === "Customer")!;

        // ── Users ──
        const hashedPass = await bcrypt.hash("password123", 10);

        const subExpiry = new Date();
        subExpiry.setMonth(subExpiry.getMonth() + 1);
        const expiredDate = new Date();
        expiredDate.setMonth(expiredDate.getMonth() - 1);

        const supplier = await User.create({
            name: "Super Supplier Ltd.",
            email: "supplier@tradelink.com",
            password: hashedPass,
            role_id: supplierRole.id,
            company_name: "Super Supplier Ltd.",
            location: "Cairo",
            balance: 1000.0,
            status: "active",
            subscription_status: "active",
            subscription_date: new Date(),
            subscription_expiry: subExpiry,
            instapay_address: "super_supplier@instapay",
            vodafone_cash_number: "01012345678"
        });

        const wholesaler = await User.create({
            name: "Cairo Wholesale Co.",
            email: "wholesale@tradelink.com",
            password: hashedPass,
            role_id: wholesalerRole.id,
            company_name: "Cairo Wholesale Co.",
            location: "Alexandria",
            balance: 500.0,
            status: "active",
            subscription_status: "active",
            subscription_date: new Date(),
            subscription_expiry: subExpiry,
            instapay_address: "cairo_wholesale@instapay",
            vodafone_cash_number: "01288887777"
        });

        const retailerRole = roles.find(r => r.name === "Retailer")!;
        const retailer = await User.create({
            name: "Giza Retail Shop",
            email: "retail@tradelink.com",
            password: hashedPass,
            role_id: retailerRole.id,
            company_name: "Giza Retail Shop",
            location: "Giza",
            balance: 200.0,
            status: "active",
            subscription_status: "active",
            subscription_date: new Date(),
            subscription_expiry: subExpiry
        });

        const customer = await User.create({
            name: "Ahmed Mohamed",
            email: "ahmed@consumer.com",
            password: hashedPass,
            role_id: customerRole.id,
            company_name: "Ahmed's Shop",
            status: "active"
        });

        const adminRole = roles.find(r => r.name === "Admin")!;
        const admin = await User.create({
            name: "System Admin",
            email: "admin@tradelink.com",
            password: hashedPass,
            role_id: adminRole.id,
            company_name: "TradeLink HQ",
            location: "Cairo",
            balance: 5000.0,
            status: "active"
        });
        console.log("Users seeded.");

        // ── Categories ──
        const categories = await Category.bulkCreate([
            { name: "Food & Grains", description: "Food products, rice, wheat, oils" },
            { name: "Oils & Fats", description: "Cooking oils, ghee, and fats" },
            { name: "Beverages", description: "Water, juices, and soft drinks" },
            { name: "Personal Care", description: "Shampoo, soap, and cosmetics" },
            { name: "Cleaning Supplies", description: "Detergents and house cleaning tools" },
            { name: "Electronics", description: "Mobiles, computers, and home appliances" },
            { name: "Clothing & Fashion", description: "Clothes, shoes, and accessories" },
            { name: "Construction Materials", description: "Cement, steel, and building tools" },
            { name: "Home & Furniture", description: "Furniture, kitchenware, and decor" },
            { name: "Auto Parts", description: "Car parts and accessories" },
            { name: "Medical Supplies", description: "Medicines and health equipment" },
            { name: "Industrial Equipment", description: "Machines and factory tools" },
            { name: "Plastics & Packaging", description: "Plastic products and packing materials" },
            { name: "Agriculture", description: "Seeds, fertilizers, and farm tools" },
            { name: "Textiles", description: "Fabrics and threads" }
        ]);
        console.log("Categories seeded.");

        const products = await Product.bulkCreate([
            {
                name: "Premium Egyptian Rice", sku: "RICE-001", price: 25.0, wholesale_price: 20.0, min_order_qty: 10,
                supplier_id: supplier.id, category_id: categories[0].id, quantity: 500, status: "active",
                image: "assets/product_rice.png",
                ai_description: "تم تحليل جودة هذا الأرز بواسطة الذكاء الاصطناعي: نسبة كسر أقل من 2%، نقاوة عالية، ومثالي للتخزين الطويل."
            },
            {
                name: "Refined Sunflower Oil", sku: "OIL-002", price: 45.0, wholesale_price: 38.0, min_order_qty: 5,
                supplier_id: supplier.id, category_id: categories[1].id, quantity: 200, status: "active",
                image: "assets/product_oil.png",
                ai_description: "خوارزمية الذكاء الاصطناعي تؤكد: زيت نقي 100%، غني بفيتامين E، ونقطة غليان مرتفعة للطهي الصحي."
            },
            {
                name: "Smart Phone X1", sku: "ELEC-001", price: 8500.0, wholesale_price: 7800.0, min_order_qty: 2,
                supplier_id: supplier.id, category_id: categories[5].id, quantity: 50, status: "active",
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60",
                ai_description: "تقييم الذكاء الاصطناعي: أداء فائق في تشغيل التطبيقات الثقيلة، بطارية تدوم طويلاً، وشاشة فائقة الوضوح."
            },
            {
                name: "Cotton T-Shirt (Pack of 5)", sku: "CLOT-001", price: 450.0, wholesale_price: 350.0, min_order_qty: 10,
                supplier_id: supplier.id, category_id: categories[6].id, quantity: 150, status: "active",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60",
                ai_description: "توصية ذكية: نسيج قطني 100% مقاوم للانكماش، ألوان ثابتة بعد الغسيل، وتصميم مريح للارتداء اليومي."
            },
            {
                name: "Portland Cement (50kg)", sku: "CONS-001", price: 180.0, wholesale_price: 165.0, min_order_qty: 20,
                supplier_id: supplier.id, category_id: categories[7].id, quantity: 1000, status: "active",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
                ai_description: "تحليل إنشائي (AI): درجة تماسك عالية، زمن شك قياسي، ومطابق لأعلى المواصفات العالمية للبناء."
            },
            {
                name: "Modern Sofa Set", sku: "HOME-001", price: 12000.0, wholesale_price: 10500.0, min_order_qty: 1,
                supplier_id: supplier.id, category_id: categories[8].id, quantity: 10, status: "active",
                image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60",
                ai_description: "رؤية التصميم الذكي: هيكل خشبي متين، أقمشة سهلة التنظيف، وتصميم مريح يوفر أقصى درجات الدعم للظهر."
            },
            {
                name: "Brake Pads Set", sku: "AUTO-001", price: 650.0, wholesale_price: 550.0, min_order_qty: 5,
                supplier_id: supplier.id, category_id: categories[9].id, quantity: 80, status: "active",
                image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&auto=format&fit=crop&q=60",
                ai_description: "فحص الجودة الذكي: مادة احتكاك عالية الأداء، هدوء تام عند المكابح، وعمر افتراضي طويل للسلامة."
            },
            {
                name: "Medical Face Masks (Box 50)", sku: "MED-001", price: 75.0, wholesale_price: 55.0, min_order_qty: 20,
                supplier_id: supplier.id, category_id: categories[10].id, quantity: 2000, status: "active",
                image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60",
                ai_description: "تحليل الكفاءة الحيوية: 3 طبقات حماية عالية الترشيح، جسر أنف قابل للتعديل، وأربطة مريحة للأذن."
            },
            {
                name: "Organic NPK Fertilizer (25kg)", sku: "AGRI-001", price: 320.0, wholesale_price: 280.0, min_order_qty: 10,
                supplier_id: supplier.id, category_id: categories[13].id, quantity: 300, status: "active",
                image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=60",
                ai_description: "توصية زراعية ذكية: تركيبة متوازنة للنمو السريع، غني بالعناصر الصغرى، وآمن تماماً للتربة والمحاصيل."
            },
            {
                name: "Silk Thread (Bulk Roll)", sku: "TEX-001", price: 150.0, wholesale_price: 120.0, min_order_qty: 5,
                supplier_id: supplier.id, category_id: categories[14].id, quantity: 100, status: "active",
                image: "https://images.unsplash.com/photo-1520004434532-668416a08753?w=500&auto=format&fit=crop&q=60",
                ai_description: "تحليل النسيج (AI): قوة شد عالية، لمعان طبيعي يدوم، ومثالي لماكينات التطريز والنسيج الحديثة."
            },
            {
                name: "Basmati Rice 5kg", sku: "BR-001", price: 150.0, wholesale_price: 130.0, min_order_qty: 5,
                supplier_id: wholesaler.id, category_id: categories[0].id, quantity: 200, status: "active",
                image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
                ai_description: "أرز بسمتي فاخر تم استيراده وفحصه ذكياً لضمان طول الحبة ورائحتها العطرية الفواحة."
            },
            {
                name: "Wholesale Flour 25kg", sku: "WF-001", price: 300.0, wholesale_price: 270.0, min_order_qty: 10,
                supplier_id: wholesaler.id, category_id: categories[0].id, quantity: 150, status: "active",
                image: "https://images.unsplash.com/photo-1627485601819-74cefd5f1eb5?w=500&auto=format&fit=crop&q=60",
                ai_description: "دقيق استخراج 72% مثالي للمخابز والحلويات، مدعم بالفيتامينات ومحلل آلياً لضمان الجودة."
            },
            {
                name: "Sugar Wholesale Pack", sku: "SW-001", price: 200.0, wholesale_price: 180.0, min_order_qty: 5,
                supplier_id: wholesaler.id, category_id: categories[0].id, quantity: 300, status: "active",
                image: "https://images.unsplash.com/photo-1581447100595-3773ca02c34a?w=500&auto=format&fit=crop&q=60",
                ai_description: "سكر أبيض نقي مكرر، حبيبات متساوية، معبأ آلياً تحت رقابة صحية صارمة."
            }
        ]);
        console.log("Products seeded.");

        // ── Warehouse ──
        const warehouse = await Warehouse.create({
            owner_id: supplier.id,
            city: "Cairo",
            address: "10th of Ramadan Industrial Zone, Block A7",
            capacity: 5000
        });
        console.log("Warehouse seeded.");

        // ── Inventory ──
        await Inventory.bulkCreate([
            { product_id: products[0].id, warehouse_id: warehouse.id, quantity: 500 },
            { product_id: products[1].id, warehouse_id: warehouse.id, quantity: 200 },
            { product_id: products[2].id, warehouse_id: warehouse.id, quantity: 300 },
            { product_id: products[3].id, warehouse_id: warehouse.id, quantity: 100 },
            { product_id: products[4].id, warehouse_id: warehouse.id, quantity: 1000 }
        ]);
        console.log("Inventory seeded.");

        // ── Orders ──
        const order1 = await Order.create({
            buyer_id: customer.id,
            seller_id: supplier.id,
            total_amount: 475.0,
            status: "delivered"
        });

        const order2 = await Order.create({
            buyer_id: wholesaler.id,
            seller_id: supplier.id,
            total_amount: 1250.0,
            status: "processing"
        });

        const order3 = await Order.create({
            buyer_id: customer.id,
            seller_id: supplier.id,
            total_amount: 250.0,
            status: "pending"
        });

        // ── Order Items ──
        await OrderItem.bulkCreate([
            { order_id: order1.id, product_id: products[0].id, quantity: 10, unit_price: 25.0 },
            { order_id: order1.id, product_id: products[1].id, quantity: 5, unit_price: 45.0 },
            { order_id: order2.id, product_id: products[0].id, quantity: 50, unit_price: 25.0 },
            { order_id: order3.id, product_id: products[0].id, quantity: 10, unit_price: 25.0 }
        ]);
        console.log("Orders & Items seeded.");

        // ── Invoices ──
        await Invoice.bulkCreate([
            { order_id: order1.id, invoice_number: "INV-2024-001", amount: 475.0, status: "paid" },
            { order_id: order2.id, invoice_number: "INV-2024-002", amount: 1250.0, status: "unpaid" },
            { order_id: order3.id, invoice_number: "INV-2024-003", amount: 250.0, status: "unpaid" }
        ]);
        console.log("Invoices seeded.");

        // ── Payments ──
        await Payment.bulkCreate([
            { order_id: order1.id, method: "bank_transfer", amount: 475.0, status: "completed", transaction_ref: "TXN-BT-001" },
            { order_id: order2.id, method: "instapay", amount: 500.0, status: "completed", transaction_ref: "TXN-IP-002" }
        ]);
        console.log("Payments seeded.");

        // ── Shipments ──
        await Shipment.bulkCreate([
            { order_id: order1.id, company: "Aramex Egypt", tracking_number: "ARX-EG-20240001", status: "delivered", delivered_at: new Date() },
            { order_id: order2.id, company: "DHL Egypt", tracking_number: "DHL-EG-20240002", status: "in_transit" }
        ]);
        console.log("Shipments seeded.");

        // ── Notifications ──
        await Notification.bulkCreate([
            { user_id: supplier.id, title: "New Order Received", message: "You received a new order #3 from Ahmed Mohamed", type: "info" },
            { user_id: supplier.id, title: "Payment Confirmed", message: "Payment of EGP 475 for order #1 has been confirmed", type: "success" },
            { user_id: customer.id, title: "Order Delivered", message: "Your order #1 has been delivered successfully", type: "success" },
            { user_id: customer.id, title: "New Products Available", message: "Check out new products from Super Supplier Ltd.", type: "info" },
            { user_id: wholesaler.id, title: "Shipment Update", message: "Your order #2 is now in transit via DHL", type: "info" }
        ]);
        console.log("Notifications seeded.");

        // ── Withdrawals ──
        await Withdrawal.bulkCreate([
            { user_id: supplier.id, amount: 200.0, method: "bank_transfer", status: "completed", transaction_ref: "WD-BNK-SEED001" },
            { user_id: supplier.id, amount: 100.0, method: "instapay", status: "pending", transaction_ref: "WD-INS-SEED002" },
            { user_id: wholesaler.id, amount: 50.0, method: "vodafone_cash", status: "pending", transaction_ref: "WD-VOD-SEED003" }
        ]);
        console.log("Withdrawals seeded.");

        console.log("\n✅ Seeding completed successfully!");
        console.log("──────────────────────────────────────");
        console.log("  Login credentials (all same password):");
        console.log("  Admin:      admin@tradelink.com     / password123");
        console.log("  Supplier:   supplier@tradelink.com  / password123");
        console.log("  Wholesaler: wholesale@tradelink.com / password123");
        console.log("  Retailer:   retail@tradelink.com    / password123");
        console.log("  Customer:   ahmed@consumer.com      / password123");
        console.log("──────────────────────────────────────");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
