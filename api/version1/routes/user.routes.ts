import express, {type Router } from "express"
const routes = express.Router()
import * as controller from "../controllers/user.controller"
import { validate } from "../../../middlewares/validate.middleware"

routes.post("/register", controller.postRegister)

export const userRoutes: Router = routes