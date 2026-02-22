import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 4️⃣ STANDARDIZED user object
    req.user = {
      id: decoded.id
    };

    // 5️⃣ Continue
    next();

  } catch (error) {
    console.error("AUTH ERROR:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;