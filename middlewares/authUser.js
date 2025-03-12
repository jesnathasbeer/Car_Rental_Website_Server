import jwt from "jsonwebtoken";

export const authUser = (req, res, next) => {
    try {
        //collect token from cookies.
        const { token } = req.cookies;
console.log(req.cookies)

        if (!token) {
            return res.status(401).json({ message: "user not autherized" });
        }

        //decode token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodedToken, "=========Decoded token");

        if (!decodedToken) {
            return res.status(401).json({ message: "user not autherized" });
        }

        req.user = decodedToken;

        //check
        next();
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};