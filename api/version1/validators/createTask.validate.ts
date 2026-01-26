import { z } from "zod";
import { TASK_STATUS } from "../../../models/task.model";

export const createTaskSchema = z.object({
  body: z.object({

    // tiêu đề không được để trống và phải có trên 5 ký tự
    title: z
      .string({
        error: (issue) => issue.input === undefined ? "Tiêu đề không được để trống!" : "Tiêu đề phải là một chuỗi các ký tự!"
      })
      .min(5, "Tiêu đề phải có ít nhất 5 ký tự"),

    // status phải nằm trong danh sách cho phép (initial, doing, ...)
    status: z.enum(TASK_STATUS as [string, ...string[]]).optional(),

    // content là chuỗi và không bắt buộc
    content: z.string().optional(),

    // kiểm tra định dạng thời gian
    timeStart: z.iso.datetime({message: "Ngày bắt đầu không đúng định dạng!"}).optional(),
    timeFinish: z.iso.datetime({message: "Ngày kết thúc không đúng định dạng!"}).optional()
  })
    //Logic nâng cao: Kiểm tra ngày bắt đầu < ngày kết thúc
    .refine((data) => {
      if (data.timeStart && data.timeFinish) {
        return new Date(data.timeStart) <= new Date(data.timeFinish); // true
      }
      return true;
    }, {
      message: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu",
      path: ["timeFinish"], // Báo lỗi cụ thể ở trường timeFinish
    }),
});
