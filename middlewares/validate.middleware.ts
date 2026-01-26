import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ZodError } from "zod";

// hàm nhận vào 1 schema (luật) và trả về middleware
export const validate = (schema: z.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // kiểm tra toàn bộ dữ liệu
      await schema.parseAsync({
        body: req.body,
        query: req.query, 
        params: req.params,
      });
      // nếu ổn thì đi tiếp
      next();
    } catch (error) {
      // Nếu có lỗi, trả về 400 ngay lập tức
      if (error instanceof ZodError) {
        const err = error as ZodError
        // Format lại lỗi cho đẹp để Frontend dễ hiển thị
        const errorMessages = err.issues.map((issue) => ({
          field: issue.path[1], // Tên trường bị lỗi (ví dụ: title)
          message: issue.message, // Nội dung lỗi
        }));

        return res.status(400).json({
          code: 400,
          message: "Dữ liệu không hợp lệ",
          errors: errorMessages,
        });
      }

      return res
        .status(500)
        .json({ code: 500, message: "Lỗi kiểm tra dữ liệu" });
    }
  };
};
