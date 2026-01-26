import { searchHelpers } from "./../../../helpers/searchHelpers";
import { type Request, type Response } from "express";
import Task, { TASK_STATUS } from "../../../models/task.model";
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
    const status: string = req.body.status; // Lấy status người dùng gửi lên

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

export const changeMulti = async (req: Request, res: Response) => {
  try {
    // 1. Lấy dữ liệu
    const ids: string[] = req.body.ids;
    const key: string = req.body.key;
    const value: string = req.body.value;

    // 2. Validate cơ bản
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "Danh sách ID không hợp lệ hoặc rỗng !!",
      });
    }

    if (!key) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu trường muốn thay đổi !!",
      });
    }

    // 3. Xử lý theo từng loại Key
    switch (key) {
      case "status":
        // Validate kỹ hơn: Value gửi lên có nằm trong danh sách cho phép không?
        if (!TASK_STATUS.includes(value)) {
          return res.status(400).json({
            code: 400,
            message: "Trạng thái công việc không hợp lệ !!",
          });
        }

        // Thực hiện Update
        const resultStatus = await Task.updateMany(
          {
            _id: { $in: ids }, // Tìm các task có ID nằm trong danh sách
            deleted: false, // Chỉ update task chưa bị xóa
          },
          {
            status: value,
          }
        );

        // Kiểm tra xem có bản ghi nào được update không
        // matchedCount = 0 nghĩa là không tìm thấy task nào với ID đó
        if (resultStatus.matchedCount === 0) {
          return res.status(404).json({
            // 404: Not Found
            code: 404,
            message: "Không tìm thấy công việc (hoặc đã bị xóa)!",
          });
        }

        // Báo kết quả
        return res.status(200).json({
          code: 200,
          message: "Cập nhật trạng thái thành công !!",
          data: {
            matched: resultStatus.matchedCount, // Số bản ghi tìm thấy
            modified: resultStatus.modifiedCount, // Số bản ghi thực sự thay đổi
          },
        });

      // Mở rộng thêm: Trường hợp muốn xóa nhiều (Soft Delete)
      case "delete":
        const resultDelete = await Task.updateMany(
          { _id: { $in: ids }, deleted: false },
          {
            deleted: true,
            deletedAt: new Date(), // Lưu thời gian xóa
          }
        );

        if (resultDelete.matchedCount === 0) {
          return res.status(404).json({
            // 404: Not Found
            code: 404,
            message: "Không tìm thấy công việc (hoặc đã bị xóa)!",
          });
        }

        return res.status(200).json({
          code: 200,
          message: "Xóa thành công các công việc đã chọn !!",
        });

      default:
        return res.status(400).json({
          code: 400,
          message: "Trường dữ liệu này không được phép thay đổi !!",
        });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: 500,
      message: "Lỗi hệ thống!",
    });
  }
};

// định nghĩa interface cho dữ liệu người dùng gửi lên - chỉ liệt kê những trường mà người dùng sẽ gửi lên (nhập)
interface TaskCreateBody {
  title: string;
  status?: string;
  content?: string;
  timeStart?: Date;
  timeFinish?: Date;
}

export const createTask = async (
  req: Request<{}, {}, TaskCreateBody>,
  res: Response
) => {
  try {
    // Lấy những dữ liệu cần thiêt
    const { title, status, content, timeStart, timeFinish } = req.body;

    const newTask = new Task({
      title: title,
      status: status, // nếu status là undefind thì tự động gán là initial
      content: content,
      timeStart: timeStart,
      timeFinish: timeFinish,
    });

    await newTask.save();

    return res.status(201).json({
      code: 201,
      message: "Tạo mới công việc thành công!",
      data: newTask,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: 500,
      message: "Lỗi hệ thống!",
    });
  }
};
