"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jwt_1 = require("../utils/jwt.js");
const user_model_1 = __importDefault(require("../models/user.model.js"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = await user_model_1.default.findById(decoded.id)
                .select("-password")
                .populate("role");
            if (!user) {
                res
                    .status(401)
                    .json({ message: "Not authorized. User no longer exists." });
                return;
            }
            const roleObj = user.role;
            req.user = user;
            req.userRole = roleObj?.name || "User";
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized. Token failed." });
            return;
        }
    }
    if (!token) {
        res.status(401).json({ message: "Not authorized. No token provided." });
        return;
    }
};
exports.protect = protect;
// Role based Authorization Guard
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            res.status(403).json({
                message: `User role '${req.userRole}' is not authorized to access this route.`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
