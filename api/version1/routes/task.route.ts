import express, { type Router } from "express"
const routes = express.Router()
import * as controller from "../controllers/task.controller"

routes.get("/", controller.index);

routes.get("/detail/:id", controller.detailTask)

routes.patch("/change-status/:id", controller.changeStatus)

routes.patch("/change-multi", controller.changeMulti)

routes.post("/create", controller.createTask)

export const taskRoutes: Router = routes
