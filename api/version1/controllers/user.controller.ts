import { type Request, type Response } from "express";
import { generateRandomString } from "../../../helpers/generateRandomString";
import bcrypt from "bcryptjs";
import User from "../../../models/user.model";

export const postRegister = async (req: Request, res: Response) => {
  try {
    // lấy các trường mà người dùng nhập vào
    const { fullName, email, password } = req.body;

    // tạo token cho người dùng - length = 30
    const tokenUser: string = generateRandomString(30);

    // mã hóa mật khẩu dùng bcrypt
    const saltRounds: number = 10;
    const hash: string = bcrypt.hashSync(password, saltRounds);

    // lưu người dùng vào database
    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hash,
      token: tokenUser,
    });

    await newUser.save();

    res.status(201).json({
      code: 201,
      message: "Tạo tài khoản thành công!",
      toke: tokenUser,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
