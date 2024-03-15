import { verifyAccessToken } from '../utils/jwt.js'

//Define the middleware function auth that takes three parameters: req, res, and next
export default async function auth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({'error': 'Unauthorized'})
  }
//Split the Authorization header value to extract the token
  const token = req.headers.authorization.split(' ')[1]
  if (!token) {
    return res.status(401).send({ 'error': 'Unauthorized' })
  }
//Verify the access token using the verifyAccessToken function
  await verifyAccessToken(token).then(user => {
    req.user = user // store the user in the `req` object. our next route now has access to the user via `req.user`
    next()   //Call the next() function to pass control to the next middleware or route handler
  }).catch(e => {
    return res.status(401).send({ 'error': e.message })
  })
}