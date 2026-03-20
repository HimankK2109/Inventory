import express from 'express'
import cors from "cors";
import { connectDB } from './config/db.js'
import 'dotenv/config'
import router from "./routes.js"

// app config
const app = express()
const PORT = process.env.PORT || 4000;

// miidleware
app.use(express.json())
app.use(cors())

// DB Connection
connectDB();

// api endpoints
app.use("/api", router);

app.get("/", (req, res) => {
    res.send("API is working")
})

app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}`);
})