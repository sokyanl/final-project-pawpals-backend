import express from "express"
import prisma from "./src/utils/prisma.js"
import { Prisma } from "@prisma/client"

const app = express()
app.use(express.json())
// const port = process.env.PORT || 8080


// app.use("/users", userRouter);
// app.use("/auth", authRouter);
// app.use("/pet", petRouter);



export default app;