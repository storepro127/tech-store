const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// يخلي public يتعرض للموقع
app.use(express.static("public"));


// 🔥 تأكد إن الفولدرات موجودة
if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// ملفات التخزين
const productsFile = "data/products.json";
const ordersFile = "data/orders.json";
const couponsFile = "data/coupons.json";

// لو مش موجودين يعملهم
if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, "[]");
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, "[]");
if (!fs.existsSync(couponsFile)) fs.writeFileSync(couponsFile, "[]");


// 🔥 رفع الصور من الموبايل
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));


// =============================
// 📌 PRODUCTS
// =============================

// إضافة منتج
app.post("/api/add-product", upload.single("image"), (req, res) => {

    const products = JSON.parse(fs.readFileSync(productsFile));

    const newProduct = {
        id: Date.now().toString(),
        name: req.body.name,
        price: Number(req.body.price),
        discount: Number(req.body.discount || 0),
        stock: Number(req.body.stock || 0),
        description: req.body.description || "",
        image: req.file ? "/uploads/" + req.file.filename : "",
    };

    products.push(newProduct);

    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

    res.json({ success: true });
});


// كل المنتجات
app.get("/api/products", (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsFile));
    res.json(products);
});


// حذف منتج
app.delete("/api/delete-product/:id", (req, res) => {

    let products = JSON.parse(fs.readFileSync(productsFile));

    products = products.filter(p => p.id !== req.params.id);

    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

    res.json({ success: true });
});


// =============================
// 📌 ORDERS
// =============================

app.post("/api/create-order", (req, res) => {

    const orders = JSON.parse(fs.readFileSync(ordersFile));

    const newOrder = {
        id: Date.now(),
        customer: req.body.customer,
        cart: req.body.cart,
        total: req.body.total,
        date: new Date(),
    };

    orders.push(newOrder);

    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    res.json({ success: true });
});


app.get("/api/orders", (req, res) => {
    const orders = JSON.parse(fs.readFileSync(ordersFile));
    res.json(orders);
});


// =============================
// 📌 COUPONS
// =============================

app.post("/api/add-coupon", (req, res) => {

    const coupons = JSON.parse(fs.readFileSync(couponsFile));

    coupons.push({
        code: req.body.code,
        discount: Number(req.body.discount),
    });

    fs.writeFileSync(couponsFile, JSON.stringify(coupons, null, 2));

    res.json({ success: true });
});


app.post("/api/check-coupon", (req, res) => {

    const coupons = JSON.parse(fs.readFileSync(couponsFile));

    const found = coupons.find(c => c.code === req.body.code);

    if (found) {
        res.json(found);
    } else {
        res.json({ discount: 0 });
    }
});


// =============================
// 🔥 ADMIN LOGIN
// =============================

const ADMIN_PASSWORD = "11211";

app.post("/api/admin-login", (req, res) => {

    if (req.body.password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});


// =============================
// 🔥 SERVER
// =============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server Running on port " + PORT);
});
