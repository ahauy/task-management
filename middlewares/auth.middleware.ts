import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model";

// Định nghĩa lại Request để có thêm biến User để có thể gửi qua controller
interface AuthRequest extends Request {
  user?: IUser
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const token: string | undefined = req.headers.authorization.split(" ").at(1)

    if(!token) {
      res.status(401).json({
        code: 401,
        message: "Sai định dạng token!"
      })
      return
    }

    // tìm xem có user nào có token như token gửi lên hay không ?
    const user = await User.findOne({
      token: token,
      deleted: false
    }).select("-password -token")

    if(!user) {
      res.status(401).json({
        code: 401,
        message: "Token không hợp lệ!"
      })
      return
    }

    // gắn user tìm được vào trong req để gửi sang controller
    req.user = user

    next();
  } catch (e) {
    res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ!" });
  }
};
