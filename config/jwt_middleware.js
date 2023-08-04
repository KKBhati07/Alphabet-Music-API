// importing jwt
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "secretkey";


//to authenticate a user
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided",
        });
    }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, jwtSecret, (error, decodedToken) => {
        if (error) return res.status(403).json({
            message: "Invalid token"
        });
        // setting the decoded user in request user
        req.user = decodedToken;
        //passing request to next middleware
        next();
    });

};


