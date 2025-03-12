import { connect } from "mongoose";

const MONGO_URI = process.env.MONGO_URI;


export const connectDB = async () => {
    try {
        const response = await connect(MONGO_URI);
        console.log("db connected successfully");
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;
