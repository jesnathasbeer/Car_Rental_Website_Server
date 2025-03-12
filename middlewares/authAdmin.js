import jwt from "jsonwebtoken";

export const authAdmin = (req, res, next) => {
    try {
        //collect token from cookies.
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "user not authorized" });
        }

        //decode token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodedToken, "=========Decoded token");

        if (!decodedToken) {
            return res.status(401).json({ message: "user not authorized" });
        }
        
        if( decodedToken.role!=="admin"){
            return res.status(401).json({ message: "user not authorized" });
        }

        req.user = decodedToken;

        //check
        next();
    } catch (error) {
        console.log(error);
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
    }
};