import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt";
import { Employee, IEmployee, Organization, IOrganization } from "@/models";

export interface AuthRequest extends Request {
  user?: IEmployee | IOrganization | any;
  userRole?: string;
  orgId?: any;
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

      let user: any = await Employee.findById(decoded.id).select("-passwordHash");
      let role = user?.role || "Employee";

      if (!user) {
        user = await Organization.findById(decoded.id).select("-passwordHash");
        role = "Organization";
      }

      if (!user) {
        res
          .status(401)
          .json({ message: "Not authorized. User no longer exists." });
        return;
      }

      req.user = user;
      req.userRole = role;
      req.orgId = user.orgId || user._id;

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
