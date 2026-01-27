import { z } from "zod";
import { passwordComplexSchema } from "./common.validate";
import User from "../../../models/user.model";

export const userSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Vui lòng nhập họ tên!"),
    email: z.email("Email không được để trống!").refine(async (email) => {
      // Tìm user trong database
      const user = await User.findOne({
        email: email,
        deleted: false
      })
      return !user
    }, {
      message: "Email này đã tồn tại!"
    }),
    password: passwordComplexSchema,
    confirmPassword: passwordComplexSchema
  })
    // kiểm tra password có giống với confirmPassword hay không ?
    .refine((data) => {
      return data.password === data.confirmPassword
    }, {
      message: "Mật khẩu xác nhận không khớp!",
      path: ["confirmPassword"]
    })
});
