const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

/* أهم سطر في حياتك 😄 */
app.use(express.static(path.join(__dirname, "public")));


// test route
app.get("/api/test", (req,res)=>{
    res.send("SERVER WORKING ✅");
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server running on port " + PORT);
});
