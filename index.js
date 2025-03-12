import express from 'express';
import cors from 'cors';
import { connectDB } from "./config/db.js";
import { apiRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";

const app = express();
const port = 3002;

connectDB();

app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRouter);

app.all("*", (req, res, next) => {
    res.status(404).json({ message: "endpoint does not exist" });
});

//app.use('/api/cars', carRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});