import { searchHelpers } from "./../../../helpers/searchHelpers";
import { type Request, type Response } from "express";
import Task, { TASK_STATUS } from "../models/task.model";
import { paginationHelpers } from "../../../helpers/paginationHelpers";

export const index = async (req: Request, res: Response) => {
  try {
    interface Find {
      deleted: boolean;
      status?: string;
      title?: RegExp;
    }

    const find: Find = {
      deleted: false,
    };

    // lọc theo trạng thái
    if (req.query.status && TASK_STATUS.includes(req.query.status.toString())) {
      find.status = req.query.status.toString();
    }

    // Key là string, Value cũng là any (để Mongoose tự xử lý)
    const sort: Record<string, any> = {};
    // sắp xếp theo công việc
    if (req.query.sortKey && req.query.sortValue) {
      const sortKey = req.query.sortKey.toString();
      sort[sortKey] = req.query.sortValue.toString();
    }

    // Phân trang
    const limit: number = req.query.limit
      ? parseInt(req.query.limit.toString())
      : 4;
    const countPage = await Task.countDocuments(find);
    const objPagination = paginationHelpers(
      req.query,
      {
        limitItem: limit,
        currentPage: 1,
        skip: 0,
      },
      countPage
    );

    // tìm kiếm theo tiêu đề
    const objSearch = searchHelpers(req.query);
    if (req.query.keyword && objSearch.title) {
      find.title = objSearch.title;
    }

    const tasks = await Task.find(find)
      .sort(sort)
      .limit(objPagination.limitItem)
      .skip(objPagination.skip);

    res.json(tasks);
  } catch (e) {
    console.log(e);
    res.json({
      code: 400,
    });
  }
};

export const detailTask = async (req: Request, res: Response) => {
  const id = req.params.id;

  const task = await Task.findOne({
    _id: id,
    deleted: false,
  });

  res.json(task);
};

export const changeStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const status = req.body.status; // Lấy status người dùng gửi lên

    // 1. Kiểm tra ID có tồn tại không
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu ID công việc!",
      });
    }

    // 2. Kiểm tra Status có hợp lệ không (Quan trọng)
    // Nếu status rỗng HOẶC status không nằm trong danh sách cho phép
    if (!status || !TASK_STATUS.includes(status)) {
      return res.status(400).json({
        code: 400,
        message: "Trạng thái không hợp lệ!",
      });
    }

    // 3. Thực hiện Update và lấy kết quả
    const result = await Task.updateOne(
      { _id: id, deleted: false }, // Chỉ update task chưa bị xóa
      { status: status }
    );

    // 4. Kiểm tra xem có bản ghi nào được update không
    // matchedCount = 0 nghĩa là không tìm thấy task nào với ID đó
    if (result.matchedCount === 0) {
      return res.status(404).json({
        // 404: Not Found
        code: 404,
        message: "Không tìm thấy công việc (hoặc đã bị xóa)!",
      });
    }

    // Update thành công
    return res.status(200).json({
      code: 200,
      message: "Cập nhật trạng thái thành công !!",
    });
  } catch (e) {
    console.log(e); // Log lỗi ra terminal để debug
    return res.status(500).json({
      // 500: Lỗi Server
      code: 500,
      message: "Lỗi hệ thống!",
    });
  }
};
