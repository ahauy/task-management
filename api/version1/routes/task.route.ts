import express, { type Router } from "express"
const routes = express.Router()
import * as controller from "../controllers/task.controller"
import { validate } from "../../../middlewares/validate.middleware";
import { createTaskSchema } from "../validators/createTask.validate";

routes.get("/", controller.index);

routes.get("/detail/:id", controller.detailTask)

routes.patch("/change-status/:id", controller.changeStatus)

routes.patch("/change-multi", controller.changeMulti)

routes.post("/create", validate(createTaskSchema), controller.createTask)

export const taskRoutes: Router = routes
