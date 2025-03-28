import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/client";
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({ message: "로그인이 필요합니다." });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(403).json({ message: "유효하지 않은 사용자입니다." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "토큰이 유효하지 않습니다." });
  }
};
