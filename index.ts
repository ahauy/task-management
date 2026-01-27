import express, { type Express, type Request, type Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import * as database from "./config/database"
import mainV1Rotes from "./api/version1/routes/index.route"

dotenv.config()

database.connect()

const app: Express = express()
const port: number | string = process.env.PORT || 3000

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

mainV1Rotes(app)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})