const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access Denied" });
    }

    try {
        const tokenValue = token.split(' ')[1]; // Remove 'Bearer ' prefix
        const verified = jwt.verify(tokenValue, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
