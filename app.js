import express from "express"
import prisma from "./src/utils/prisma.js"
import { Prisma } from "@prisma/client"
import cors from "cors"
import morgan from "morgan"
import userRouter from "./src/controllers/users.controllers.js"

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('combined'))

app.use("/users", userRouter);
// app.use("/auth", authRouter);
// app.use("/pet", petRouter);



export default app;

