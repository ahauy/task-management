import express, {type Router } from "express"
const routes = express.Router()
import * as controller from "../controllers/user.controller"
import { validate } from "../../../middlewares/validate.middleware"
import { userSchema } from "../validators/user.validate"

routes.post("/register", validate(userSchema), controller.postRegister)

export const userRoutes: Router = routes