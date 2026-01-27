import { type Request, type Response } from "express";
import { generateRandomString } from "../../../helpers/generateRandomString";
import bcrypt, { compare } from "bcryptjs";
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

export const postLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // kiểm tra email xem có tồn tại trong hệ thống hay chưa
    const user = await User.findOne({
      email: email,
      deleted: false
    });

    // chưa có user nào với email như người dùng đã nhập
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Tài khoản hoặc mật khẩu không chính xác!",
      });
    }

    // Nếu có user với email trên thì kiểm tra xem mật khẩu có đúng hay không?
    const passwordMatch: boolean = await bcrypt.compare(password, user.password) // nên dùng await bcrypt.compare() để tránh sập server khi có nhiều người cùng đăng nhập (bất đồng bộ). Ta có bcrypt.compareSync() nhưng nó sẽ phải so sánh xong mật khẩu của người dùng này mới đến người dúng khác, nếu có 100 người cùng đăng nhập thì sẽ sặp server 
    if (!passwordMatch) {
      return res.status(401).json({
        code: 401,
        message: "Tài khoản hoặc mật khẩu không chính xác!",
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Đăng nhập thành công!",
      token: user.token
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
