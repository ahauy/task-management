import { type Express } from "express"
import { taskRoutes } from "./task.route"
import { userRoutes } from "./user.routes"


const mainV1Rotes = (app: Express) => {
  const apiVersion1 = "/api/version1"

  app.use(apiVersion1 + "/tasks", taskRoutes)

  app.use(apiVersion1 + "/user", userRoutes)
}

export default mainV1Rotes