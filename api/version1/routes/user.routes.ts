import express, {type Router } from "express"
const routes = express.Router()
import * as controller from "../controllers/user.controller"
import { validate } from "../../../middlewares/validate.middleware"
import { loginSchema, registerSchema } from "../validators/user.validate"
import { requireAuth } from "../../../middlewares/auth.middleware"

routes.post("/register", validate(registerSchema), controller.postRegister)

routes.post("/login", validate(loginSchema), controller.postLogin)

routes.get("/detail", requireAuth, controller.getDetail)

routes.post("/refesh", controller.postRefeshToken)


export const userRoutes: Router = routes