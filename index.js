import express from 'express';
import cors from 'cors';
import { connectDB } from "./config/db.js";
import { apiRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';

const app = express();
const port = 3002;

connectDB();

app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTION"],
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRouter);

app.all("*", (req, res, next) => {
    res.status(404).json({ message: "endpoint does not exist" });
});

//app.use('/api/cars', carRoutes);
mongoose.set('debug', true);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});