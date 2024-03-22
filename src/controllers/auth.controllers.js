import express from 'express'
import bcrypt from "bcryptjs"
import prisma from "../utils/prisma.js"
import { validateLogin } from "../validators/auth.js"
import { filter } from "../utils/common.js"
import { signAccessToken } from "../utils/jwt.js"
const router = express.Router()


router.post('/', async (req, res) => {
    const data = req.body
  
    const validationErrors = validateLogin(data)// checks if the data from the user is acceptable

    // if the user's data is not acceptable this will tell the frontend that
    if (Object.keys(validationErrors).length != 0) return res.status(401).send({
      error: validationErrors
    })
  
    // finds the user with the email provided
    const user = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    })
  
    // if there was no user with the email provided this will tell the frontend that
    if (!user) return res.status(401).send({
      error: 'Email address or password not valid'
    })
  
    // if the email and password do not match this will tell the frontend that
    const checkPassword = bcrypt.compareSync(data.password, user.password)
    if (!checkPassword) return res.status(401).send({
      error: 'Email address or password not valid'
    })
  
    // gives the user an access token
    const userFiltered = filter(user, 'id', 'name', 'email')
    const accessToken = await signAccessToken(userFiltered)
    return res.json({ accessToken, userFiltered })
  })

  export default router