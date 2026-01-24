import { type Request, type Response } from "express"
import Task from "../models/task.model"

export const index = async (req: Request, res: Response) => {
  const tasks = await Task.find({
    deleted: false
  })

  console.log(tasks)

  res.json(tasks)
}
