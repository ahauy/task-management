import { type Express } from "express"
import { taskRoutes } from "./task.route"

const mainV1Rotes = (app: Express) => {
  const apiVersion1 = "/api/version1"

  app.use(apiVersion1 + "/tasks", taskRoutes)
}

export default mainV1Rotes