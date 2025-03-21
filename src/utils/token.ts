import jwt from "jsonwebtoken";

export const generateToken = (userId: number, type: "access" | "refresh") => {
  const secret =
    type === "access"
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET;
  const expiresIn = type === "access" ? "1h" : "1d";

  return jwt.sign({ id: userId, scope: type }, secret, {
    expiresIn,
    issuer: "panda-market",
  });
};
