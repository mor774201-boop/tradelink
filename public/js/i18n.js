/* ═══════════════════════════════════════════════════════════════
   TradeLink Internationalization (i18n) System
   ═══════════════════════════════════════════════════════════════ */

// Master Arabic to English Dictionary
const arToEnMap = {
    // Nav & Common
    'الرئيسية': 'Home',
    'نظرة عامة': 'Overview',
    'إدارة التجارة': 'Trade Management',
    'منتجاتي': 'My Products',
    'الطلبات الواردة': 'Incoming Orders',
    'الطلبات': 'Orders',
    'إضافة منتج': 'Add Product',
    'التوريد': 'Supply',
    'تصفح الموردين': 'Browse Suppliers',
    'تصفح المنتجات': 'Browse Products',
    'تصفح منتجات الجملة': 'Browse Wholesale',
    'طلباتي': 'My Orders',
    'المالية': 'Finance',
    'المحفظة والعمليات': 'Wallet & Transactions',
    'المحفظة والمدفوعات': 'Wallet & Payments',
    'المدفوعات': 'Payments',
    'إيداع رصيد': 'Deposit Balance',
    'إعدادات البنك': 'Bank Settings',
    'اللوجستيات': 'Logistics',
    'الشحنات': 'Shipments',
    'تتبع الشحنات': 'Track Shipments',
    'الفواتير': 'Invoices',
    'التواصل والتقارير': 'Communication & Reports',
    'الإشعارات': 'Notifications',
    'التقارير المالية': 'Financial Reports',
    'تسجيل الخروج': 'Logout',
    'الإعدادات': 'Settings',
    'إدارة المستخدمين': 'User Management',
    'إدارة النظام': 'System Management',
    'الاشتراكات': 'Subscriptions',
    'التسوق': 'Shopping',
    'الموردين': 'Suppliers',
    // Headers & Labels
    'إضافة منتج جديد': 'Add New Product',
    'مرحباً، تاجر الجملة': 'Welcome, Wholesaler',
    'مرحباً، تاجر التجزئة': 'Welcome, Retailer',
    'مرحباً، المورد': 'Welcome, Supplier',
    'مرحباً، المستهلك': 'Welcome, Consumer',
    'مرحباً، أدمن': 'Welcome, Admin',
    'لوحة التحكم': 'Dashboard',
    'إجمالي الإيرادات': 'Total Revenue',
    'الإيرادات (ج.م)': 'Revenue (EGP)',
    'رصيد المحفظة': 'Wallet Balance',
    'تجار جملة': 'Wholesalers',
    'تجار تجزئة': 'Retailers',
    'في الانتظار': 'Pending',
    'المستخدمين': 'Users',
    // Table Headers
    'رقم': 'No.',
    'المشتري': 'Buyer',
    'المورد': 'Supplier',
    'المبلغ': 'Amount',
    'الحالة': 'Status',
    'التاريخ': 'Date',
    'المنتج': 'Product',
    'السعر': 'Price',
    'سعر الجملة': 'Wholesale Price',
    'الكمية': 'Quantity',
    'الحد الأدنى': 'Min. Order',
    'إجراء': 'Action',
    'الإجمالي': 'Total',
    'طريقة الدفع': 'Payment Method',
    // Forms & Buttons
    'اسم المنتج': 'Product Name',
    'السعر للتجزئة (ج.م)': 'Retail Price (EGP)',
    'سعر الجملة (ج.م)': 'Wholesale Price (EGP)',
    'الفئة': 'Category',
    'الحد الأدنى للطلب': 'Minimum Order',
    'رابط صورة المنتج (URL)': 'Product Image URL',
    'وصف المنتج': 'Product Description',
    'المبلغ (ج.م)': 'Amount (EGP)',
    'إيداع الآن': 'Deposit Now',
    'إتمام الطلب الآن': 'Complete Order',
    'اشترك الآن': 'Subscribe Now',
    'تسوق الآن': 'Shop Now',
    'شراء': 'Buy',
    'الوضع الفاتح': 'Light Mode',
    'الوضع الغامق': 'Dark Mode',
    'وضع النهار': 'Light Mode',
    'وضع الليل': 'Dark Mode',
    // Deposit Info
    'صورة الإيصال / سكرين شوت': 'Receipt / Screenshot',
    'اضغط هنا لرفع صورة الإيصال أو السكرين شوت': 'Click here to upload receipt',
    'اختر طريقة الإيداع': 'Choose Deposit Method',
    'تعليمات الإيداع': 'Deposit Instructions',
    'تحويل بنكي': 'Bank Transfer',
    'انستاباي': 'InstaPay',
    'فودافون كاش': 'Vodafone Cash',
    // Stat & Empty states
    'لا توجد منتجات': 'No products',
    'لا توجد طلبات': 'No orders',
    'لا توجد مدفوعات': 'No payments',
    'السلة فارغة حالياً': 'Cart is empty',
    'الإجمالي الكلي:': 'Grand Total:',
    'آخر الطلبات الواردة': 'Latest Incoming Orders',
    'آخر طلباتي من الموردين': 'My Latest Supplier Orders',
    'العروض والتخفيضات': 'Offers & Discounts',
    'العروض': 'Offers'
};

const enToArMap = {};
Object.entries(arToEnMap).forEach(([ar, en]) => { enToArMap[en] = ar; });

let currentLang = localStorage.getItem('tl-lang') || 'ar';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get user language, default to Arabic
    applyLanguage(currentLang);

    // 2. Inject Language Toggle Button
    injectLangToggle();
});

function injectLangToggle() {
    const isEn = (currentLang === 'en');
    const toggleHTML = `
        <button id="lang-toggle-nav" class="btn btn-sm btn-outline-secondary ms-2 me-2 font-weight-bold" style="border-radius: 8px; width: 40px; height: 40px; border-color: var(--border-color); font-family: 'Segoe UI', sans-serif;">
            ${isEn ? 'ع' : 'En'}
        </button>
    `;

    setTimeout(() => {
        let controlsDesktop = document.querySelector('.global-controls');
        const headerDesktop = document.querySelector('.sidebar-brand');
        if (!controlsDesktop && headerDesktop) {
             controlsDesktop = document.createElement('div');
             controlsDesktop.className = 'd-flex justify-content-center mt-3 global-controls';
             headerDesktop.appendChild(controlsDesktop);
        }
        if (controlsDesktop && !document.getElementById('lang-toggle-nav')) {
            controlsDesktop.insertAdjacentHTML('beforeend', toggleHTML);
        }

        let controlsMobile = document.querySelector('.global-controls-mobile');
        const headerMobile = document.querySelector('.mobile-top-bar');
        if (!controlsMobile && headerMobile) {
             controlsMobile = document.createElement('div');
             controlsMobile.className = 'd-flex align-items-center global-controls-mobile';
             headerMobile.insertBefore(controlsMobile, headerMobile.firstChild);
        }
        if (controlsMobile && !controlsMobile.querySelector('#lang-toggle-nav')) {
            controlsMobile.insertAdjacentHTML('beforeend', toggleHTML.replace('lang-toggle-nav', 'lang-toggle-nav-m'));
        }

        document.querySelectorAll('[id^="lang-toggle-nav"]').forEach(btn => {
            btn.addEventListener('click', () => {
                currentLang = currentLang === 'ar' ? 'en' : 'ar';
                localStorage.setItem('tl-lang', currentLang);
                window.location.reload();
            });
        });
    }, 100);
}

function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    if (lang === 'ar') return; // Default layout is Arabic, no translation needed.

    // Translate all text nodes to English using TreeWalker
    const dict = (lang === 'en') ? arToEnMap : enToArMap;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach(node => {
        const trimmed = node.textContent.trim();
        // Exact match replacement
        if (trimmed && dict[trimmed]) {
            node.textContent = node.textContent.replace(trimmed, dict[trimmed]);
        } else if (trimmed) {
            // Partial match for compound strings (like "Welcome, Admin")
            for (const [ar, en] of Object.entries(dict)) {
                if (node.textContent.includes(ar)) {
                    node.textContent = node.textContent.replace(ar, en);
                }
            }
        }
    });

    // Translate placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
        const p = el.placeholder.trim();
        if (dict[p]) el.placeholder = dict[p];
    });
}

