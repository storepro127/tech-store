const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

/* DATABASE */

const db = new sqlite3.Database("./store.db");

db.serialize(()=>{

db.run(`
CREATE TABLE IF NOT EXISTS products(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
price REAL,
discount REAL,
stock INTEGER,
image TEXT,
description TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS orders(
id INTEGER PRIMARY KEY AUTOINCREMENT,
customer TEXT,
phone TEXT,
address TEXT,
items TEXT,
total REAL,
date TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS coupons(
id INTEGER PRIMARY KEY AUTOINCREMENT,
code TEXT,
discount REAL
)
`);

});

/* ADMIN */

const ADMIN_PASSWORD="11211";

app.post("/admin-login",(req,res)=>{
if(req.body.password===ADMIN_PASSWORD){
return res.json({success:true});
}
res.json({success:false});
});

/* MULTER */

const storage = multer.diskStorage({
destination:(req,file,cb)=>cb(null,"uploads/"),
filename:(req,file,cb)=>cb(null,Date.now()+path.extname(file.originalname))
});

const upload = multer({storage});

/* PRODUCTS */

app.get("/api/products",(req,res)=>{
db.all("SELECT * FROM products",(err,rows)=>{
res.json(rows);
});
});

app.post("/api/products",upload.single("image"),(req,res)=>{

db.run(`
INSERT INTO products(name,price,discount,stock,image,description)
VALUES(?,?,?,?,?,?)
`,[
req.body.name,
req.body.price,
req.body.discount||0,
req.body.stock||0,
"/uploads/"+req.file.filename,
req.body.description||""
]);

res.json({success:true});

});

app.delete("/api/products/:id",(req,res)=>{
db.run("DELETE FROM products WHERE id=?",[req.params.id]);
res.sendStatus(200);
});

/* ORDERS */

app.post("/api/orders",(req,res)=>{

db.run(`
INSERT INTO orders(customer,phone,address,items,total,date)
VALUES(?,?,?,?,?,?)
`,[
req.body.name,
req.body.phone,
req.body.address,
JSON.stringify(req.body.cart),
req.body.total,
new Date().toLocaleString()
]);

res.json({success:true});
});

app.get("/api/orders",(req,res)=>{
db.all("SELECT * FROM orders",(err,rows)=>{
res.json(rows);
});
});

/* COUPONS */

app.get("/api/coupons",(req,res)=>{
db.all("SELECT * FROM coupons",(err,rows)=>{
res.json(rows);
});
});

app.post("/api/coupons",(req,res)=>{
db.run("INSERT INTO coupons(code,discount) VALUES(?,?)",
[req.body.code,req.body.discount]);
res.json({success:true});
});

app.delete("/api/coupons/:code",(req,res)=>{
db.run("DELETE FROM coupons WHERE code=?",[req.params.code]);
res.sendStatus(200);
});

app.post("/api/check-coupon",(req,res)=>{
db.get("SELECT * FROM coupons WHERE code=?",[req.body.code],(err,row)=>{
if(!row) return res.json({valid:false});
res.json({valid:true,discount:row.discount});
});
});

const PORT=process.env.PORT||3000;

app.listen(PORT,()=>{
console.log("🔥 TECH STORE RUNNING");
});
