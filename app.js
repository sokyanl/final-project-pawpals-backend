import express from "express"
import prisma from "./src/utils/prisma.js"
import { Prisma } from "@prisma/client"
import cors from "cors"
import morgan from "morgan"
import userRouter from "./src/controllers/users.controllers.js"
import authRouter from "./src/controllers/auth.controllers.js"
import auth from "./src/middlewares/auth.js";
import petRouter from "./src/controllers/pet.controllers.js";


const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('combined'))

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/pet", petRouter);

app.get('/protected', auth, (req, res) => {
    res.json({ "hello": "world" })
  });


export default app;

