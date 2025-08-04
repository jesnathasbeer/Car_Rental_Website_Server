import jwt from "jsonwebtoken";

export const authAdmin = (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access only" });
    }

    req.user = decoded; // contains { id, role, ... }

    next();
  } catch (error) {
    console.error("authAdmin error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
