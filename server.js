const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* ---------------- Upload Images ---------------- */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

/* ---------------- Database Fake (JSON) ---------------- */

let products = [];
let orders = [];
let coupons = [];

/* ---------------- Admin Login ---------------- */

app.post("/admin-login", (req,res)=>{
    if(req.body.password === "11211"){
        res.json({success:true});
    }else{
        res.json({success:false});
    }
});

/* ---------------- Products ---------------- */

app.get("/products",(req,res)=>{
    res.json(products);
});

app.post("/add-product", upload.single("image"), (req,res)=>{

    const product = {
        id: Date.now(),
        name: req.body.name,
        price: Number(req.body.price),
        discount: Number(req.body.discount) || 0,
        stock: Number(req.body.stock),
        description: req.body.description,
        image: "/uploads/" + req.file.filename
    };

    products.push(product);

    res.json({success:true});
});

app.delete("/delete-product/:id",(req,res)=>{
    products = products.filter(p=>p.id != req.params.id);
    res.json({success:true});
});

/* ---------------- Orders ---------------- */

app.post("/order",(req,res)=>{

    const order = {
        id: Date.now(),
        customer:req.body.customer,
        cart:req.body.cart,
        total:req.body.total
    };

    orders.push(order);

    res.json({success:true});
});

app.get("/orders",(req,res)=>{
    res.json(orders);
});

/* ---------------- Coupons ---------------- */

app.post("/add-coupon",(req,res)=>{

    coupons.push(req.body);

    res.json({success:true});
});

app.post("/check-coupon",(req,res)=>{

    const c = coupons.find(x=>x.code === req.body.code);

    if(!c) return res.json({valid:false});

    res.json({
        valid:true,
        discount:c.discount
    });

});

/* ---------------- Start ---------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("🔥 Tech Store Server Running");
});
