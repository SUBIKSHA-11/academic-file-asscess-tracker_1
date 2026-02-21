const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query?.token;

  if ((!authHeader || !authHeader.startsWith("Bearer ")) && !queryToken) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = queryToken || authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.userId || decoded.id,
      userId: decoded.userId || decoded.id,
      role: decoded.role,
      name: decoded.name
    };

    if (!req.user.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
