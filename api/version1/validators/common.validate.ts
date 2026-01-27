import { z } from "zod";

// check mật khẩu
export const passwordComplexSchema = z.string()
  .min(6, "Tối thiểu 6 ký tự")
  .regex(/[A-Z]/, "Cần 1 chữ hoa")
  .regex(/[0-9]/, "Cần 1 số")
  .regex(/[^A-Za-z0-9]/, "Cần 1 ký tự đặc biệt");