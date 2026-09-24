import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt";
import User, { IUser } from "@/models/user.model";

export interface AuthRequest extends Request {
  user?: IUser;
  userRole?: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded: any = verifyToken(token);

      const user = await User.findById(decoded.id)
        .select("-password")
        .populate("role");

      if (!user) {
        res
          .status(401)
          .json({ message: "Not authorized. User no longer exists." });
        return;
      }

      const roleObj: any = user.role;
      req.user = user;
      req.userRole = roleObj?.name || "User";

      next();
    } catch (error) {
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

// Role based Authorization Guard
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({
        message: `User role '${req.userRole}' is not authorized to access this route.`,
      });
      return;
    }
    next();
  };
};
