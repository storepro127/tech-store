const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const DB_FILE = "database.json";

function getDB(){
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data){
  fs.writeFileSync(DB_FILE, JSON.stringify(data,null,2));
}

/* GET PRODUCTS */
app.get("/api/products",(req,res)=>{
  res.json(getDB().products);
});

/* ADMIN LOGIN */
app.post("/api/admin-login",(req,res)=>{
  if(req.body.password === "11211"){
    res.json({success:true});
  }else{
    res.json({success:false});
  }
});

/* ADD PRODUCT */
app.post("/api/add-product",(req,res)=>{

  const db = getDB();

  const product = {
    id: Date.now(),
    name:req.body.name,
    price:req.body.price,
    image:req.body.image
  };

  db.products.push(product);

  saveDB(db);

  res.json({success:true});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("SERVER STARTED 🔥");
});
