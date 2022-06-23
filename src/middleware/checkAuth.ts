import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken";

export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // first get the token
  let token = req.header("authorization");

  if (!token) {
    return res.status(403).json({
      errors: [
        {
          msg: "unauthorized",
        },
      ],
    });
  }

  // split out berer and the token
  token = token.split(" ")[1];

  try {
    const user = await JWT.verify(
        token,
        process.env.JWT_SECRET as string
    ) as { email: string };
    
    req.user = user.email;
    next();

  } catch {
    return res.status(403).json({
      errors: [
        {
          msg: "unauthorized",
        },
      ],
    });
  }
}

export default checkAuth;
