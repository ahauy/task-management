import express, {type Router } from "express"
const routes = express.Router()
import * as controller from "../controllers/user.controller"
import { validate } from "../../../middlewares/validate.middleware"
import { loginSchema, registerSchema } from "../validators/user.validate"

routes.post("/register", validate(registerSchema), controller.postRegister)

routes.post("/login", validate(loginSchema), controller.postLogin)

export const userRoutes: Router = routes