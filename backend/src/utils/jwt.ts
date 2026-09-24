import jwt from "jsonwebtoken";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return secret;
};

export const generateToken = (
  payload: object,
  expiresIn: string | number = "1d",
): string => {
  return jwt.sign(payload, getSecret(), { expiresIn } as jwt.SignOptions);
};

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, getSecret()) as T;
};
