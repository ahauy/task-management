import { searchHelpers } from './../../../helpers/searchHelpers';
import { type Request, type Response } from "express";
import Task, { TASK_STATUS } from "../models/task.model";
import { paginationHelpers } from "../../../helpers/paginationHelpers";

export const index = async (req: Request, res: Response) => {
  try {
    interface Find {
      deleted: boolean,
      status?: string,
      title?: RegExp
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
    const limit: number = req.query.limit ? parseInt(req.query.limit.toString()) : 4
    const countPage = await Task.countDocuments(find);
    const objPagination = paginationHelpers(
      req.query,
      {
        limitItem: limit,
        currentPage: 1,
        skip: 0
      },
      countPage
    );

    // tìm kiếm theo tiêu đề
    const objSearch = searchHelpers(req.query)
    if(req.query.keyword && objSearch.title) {
      find.title = objSearch.title
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
