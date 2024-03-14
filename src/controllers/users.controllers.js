import express from 'express'
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import prisma from "../utils/prisma.js"
import { validateUser } from "../validators/users.js"
import { filter } from "../utils/common.js"
const router = express.Router()

//sign up endpoint
router.post('/', async (req, res) => {
    const data = req.body

    const validationErrors = validateUser(data)

    if (Object.keys(validationErrors).length != 0) return res.status(400).send({
        error: validationErrors
    })

    data.password = bcrypt.hashSync(data.password, 8);

    prisma.user.create({
        data
    }).then(user => {
        return res.json(filter(user, 'id', 'name', 'email'))

    }).catch(err => {
        // we have unique index on user's email field in our schema, Postgres throws an error when we try to create 2 users with the same email. here's how we catch the error and gracefully return a friendly message to the user.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const formattedError = {}
            formattedError[`${err.meta.target[0]}`] = 'email already taken'

            return res.status(500).send({
                error: formattedError
            }); // friendly error handling
        }
        throw err // if this happens, our backend application will crash and not respond to the client. because we don't recognize this error yet, we don't know how to handle it in a friendly manner. we intentionally throw an error so that the error monitoring service we'll use in production will notice this error and notify us and we can then add error handling to take care of previously unforeseen errors.
    })
})

export default router