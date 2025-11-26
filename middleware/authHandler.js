import jwt from "jsonwebtoken";

export default function authHandler(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(403).json({ message: "No token provided." });
        }

        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded;

        next();
    } catch (err) {
        res.status(401).json({ message: "Unauthorized access." });
    }
}
