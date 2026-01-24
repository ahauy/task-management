import express, { type Router } from "express"
const routes = express.Router()
import * as controller from "../controllers/task.controller"

routes.get("/", controller.index);

export const taskRoutes: Router = routes
