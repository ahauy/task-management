import { type Request, type Response } from "express";
import { generateRandomString } from "../../../helpers/generateRandomString";
import bcrypt from "bcryptjs";
import User, { IUser } from "../../../models/user.model";
import jwt from "jsonwebtoken";
import RefeshToken from "../../../models/refeshToken.model";

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

export const postLogin = async (req: Request, res: Response): Promise<void> => {
  const accessTokenSecret = process.env.ACCESS_TOKEN;

  const refeshTokenSecret = process.env.REFESH_TOKEN;

  if (!accessTokenSecret || !refeshTokenSecret) {
    res.status(500).json({
      message: "Lỗi cấu hình Sever!",
    });
    return;
  }

  try {
    const { email, password } = req.body;

    // kiểm tra email xem có tồn tại trong hệ thống hay chưa
    const user = await User.findOne({
      email: email,
      deleted: false,
    });

    // chưa có user nào với email như người dùng đã nhập
    if (!user) {
      res.status(401).json({
        code: 401,
        message: "Tài khoản hoặc mật khẩu không chính xác!",
      });
      return;
    }

    // Nếu có user với email trên thì kiểm tra xem mật khẩu có đúng hay không?
    const passwordMatch: boolean = await bcrypt.compare(
      password,
      user.password
    ); // nên dùng await bcrypt.compare() để tránh sập server khi có nhiều người cùng đăng nhập (bất đồng bộ). Ta có bcrypt.compareSync() nhưng nó sẽ phải so sánh xong mật khẩu của người dùng này mới đến người dúng khác, nếu có 100 người cùng đăng nhập thì sẽ sặp server
    if (!passwordMatch) {
      res.status(401).json({
        code: 401,
        message: "Tài khoản hoặc mật khẩu không chính xác!",
      });
      return;
    }

    // Tạo Access Token và Refesh Token
    if (user) {
      const accessToken = jwt.sign(
        {
          _id: user.id,
          fulName: user.fullName,
          email: user.email,
        },
        accessTokenSecret,
        { expiresIn: "30m" }
      );

      const refeshToken = jwt.sign(
        {
          _id: user.id,
          fulName: user.fullName,
          email: user.email,
        },
        refeshTokenSecret,
        { expiresIn: "10d" }
      );

      // lưu refesh token vào trong database

      interface IRefeshToken {
        userId: string;
        token: string;
        expires: Date;
        created: Date;
        createByIp?: string;
        revoked?: Date;
        revokedByIp?: string;
        replacedByToken?: string;
        createdAt?: Date; // auto nhờ có timestamps: true
        updatedAt?: Date; // auto nhờ có timestamps: true
      }

      const objRefeshToken: IRefeshToken = {
        userId: user.id,
        token: refeshToken,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        created: new Date(),
      };

      const newRefeshToken = new RefeshToken(objRefeshToken);
      newRefeshToken.save();

      res.status(200).json({
        code: 200,
        message: "Đăng nhập thành công!",
        token: accessToken,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

interface AuthRequest extends Request {
  user?: IUser;
}

export const getDetail = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    res.status(200).json({
      code: 200,
      message: "Lấy người dùng thành công!",
      user: user,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const postRefeshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refeshToken = req.body.refeshToken;

    const refeshTokenSecret = process.env.REFESH_TOKEN;

    const accessTokenSecret = process.env.ACCESS_TOKEN

    if (!refeshTokenSecret || !accessTokenSecret) {
      res.status(500).json({
        message: "Lỗi cấu hình Sever!",
      });
      return;
    }

    if (!refeshToken) {
      res.status(401).json({
        message: "Vui lòng gửi refesh token!",
      });
      return;
    } else {
      jwt.verify(refeshToken, refeshTokenSecret, async (err: any, data: any) => {
        if (err) {
          res.status(401).json({ message: "Refesh Token không hợp lệ!" });
          return;
        }

        const userID = data.id;
        
        const storedToken = await RefeshToken.findOne({
          token: refeshToken
        })

        if(!storedToken || storedToken.userId !== userID || storedToken.expires < new Date) {
          res.status(401).json({message: "Mã thông báo làm mới không hợp lệ!"})
          return
        }

        const objPayload = {
          _id: data.id,
          fullName: data.fullName,
          email: data.email
        }

        // tạo access token mới
        const accessToken = jwt.sign(objPayload, accessTokenSecret, { expiresIn: '30m' })

        const refeshTokenNew = jwt.sign(objPayload, refeshTokenSecret, { expiresIn: '10d' })

        await RefeshToken.updateOne({
          token: refeshToken,
        }, {
          token: refeshTokenNew
        })

        res.status(200).json({
          token: accessToken
        })
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
