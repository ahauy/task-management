import express, { type Router } from "express"
const routes = express.Router()
import * as controller from "../controllers/task.controller"

routes.get("/", controller.index);

routes.get("/detail/:id", controller.detailTask)

export const taskRoutes: Router = routes
