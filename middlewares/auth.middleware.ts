import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model";

// Định nghĩa lại Request để có thêm biến id để có thể gửi qua controller
interface IDRequest extends Request {
  id?: string;
}

export const requireAuth = async (
  req: IDRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {

  const accessTokenSecret = process.env.ACCESS_TOKEN

  if(!accessTokenSecret) {
    res.status(500).json({
      message: "Lỗi cấu hình Sever!"
    })
    return
  }

  try {
    // lấy token tử Header "Authorization: Bearer <token>"
    if (!req.headers.authorization) {
      res.status(401).json({
        code: 401,
        message: "Vui lòng gửi kèm token!"
      })
      return
    }

    // tách bearer ra để lấy chuối token
    const token = req.headers.authorization.split(" ").at(1)

    if(!token) {
      res.status(401).json({
        code: 401,
        message: "Sai định dạng token!"
      })
      return
    }

    jwt.verify(token, process.env.ACCESS_TOKEN || "", (err: any, payload: any) => {
      if(err) {
        res.status(403).json({
          error: "Token hết hạn hoặc không hợp lệ!"
        })
      }
      req.id = payload.id
    })
    next();
  } catch (e) {
    res.status(500).json({ message: "Lỗi hệ thống!" });
  }
};
