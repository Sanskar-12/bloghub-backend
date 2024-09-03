import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.bloghubtoken;

  if (!token) {
    return next(new ErrorHandler("Unauthorised", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded;
  next();
};
