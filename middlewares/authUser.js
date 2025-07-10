import jwt from "jsonwebtoken";

export const authUser = (req, res, next) => {
    try {
        //collect token from cookies.
        const { token } = req.cookies;


        if (!token) {
            return res.status(401).json({ message: "user not authorized" });
        }

        //decode token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodedToken, "=========Decoded token");

       
req.user = { id: decodedToken.id || decodedToken._id || decodedToken };

        if (!decodedToken) {
            return res.status(401).json({ message: "user not authorized" });
        }

       // req.user = decodedToken;
        req.user = { id: decodedToken.id || decodedToken._id || decodedToken };
console.log("Cookies received:", req.cookies);

        //check
        next();
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};