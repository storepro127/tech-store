const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

if (!fs.existsSync("data")) fs.mkdirSync("data");
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
 destination: (req, file, cb) => cb(null, "uploads"),
 filename: (req, file, cb) =>
   cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* PRODUCTS */

app.get("/api/products", (req, res) => {
 const products = JSON.parse(
   fs.readFileSync("data/products.json")
 );
 res.json(products);
});

app.post("/api/add-product", upload.single("image"), (req, res) => {
 const products = JSON.parse(
   fs.readFileSync("data/products.json")
 );

 const newProduct = {
   id: Date.now(),
   name: req.body.name,
   price: req.body.price,
   image: req.file ? "/uploads/" + req.file.filename : "",
 };

 products.push(newProduct);

 fs.writeFileSync(
   "data/products.json",
   JSON.stringify(products, null, 2)
 );

 res.json({ success: true });
});

/* COUPONS */

app.post("/api/add-coupon", (req, res) => {
 const coupons = JSON.parse(
   fs.readFileSync("data/coupons.json")
 );

 coupons.push(req.body);

 fs.writeFileSync(
   "data/coupons.json",
   JSON.stringify(coupons, null, 2)
 );

 res.json({ success: true });
});

app.post("/api/check-coupon", (req, res) => {
 const coupons = JSON.parse(
   fs.readFileSync("data/coupons.json")
 );

 const found = coupons.find(c => c.code === req.body.code);

 res.json(found || { discount: 0 });
});

/* ADMIN LOGIN */

const ADMIN_PASSWORD = "112211";

app.post("/api/admin-login", (req, res) => {
 if (req.body.password === ADMIN_PASSWORD)
   res.json({ success: true });
 else res.json({ success: false });
});

app.listen(3000, () =>
 console.log("Server Running...")
);
