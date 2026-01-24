import { type Request, type Response } from "express";
import Task, { TASK_STATUS } from "../models/task.model";

export const index = async (req: Request, res: Response) => {
  try {
    interface Find {
      deleted: boolean;
      status?: string;
    }

    const find: Find = {
      deleted: false,
    };

    // lọc theo trạng thái
    if (req.query.status && TASK_STATUS.includes(req.query.status.toString())) {
      find.status = req.query.status.toString();
    } else {
      return res.status(400).json({
        code: 400,
        message: "Trạng thái không tồn tại !!!"
      })
    }

    const tasks = await Task.find(find);

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
