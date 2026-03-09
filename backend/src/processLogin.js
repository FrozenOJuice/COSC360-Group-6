import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ // Vite dev URL
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("/login", cors());

// Middleware to parse JSON
app.use(express.json());

app.post("/login", (req,res)=>{
    console.log("HIT /login", req.body);
    const username = req.body.username;
    const password = req.body.password;

    console.log(username, password);

    if(username === "admin" && password === "1234"){
        res.json({message: "Login successful"});
    }
    else{
        res.json({message: "Invalid credentials"});
    }
});

app.listen(3000, ()=>{
    console.log("Server running on port 3000");
});