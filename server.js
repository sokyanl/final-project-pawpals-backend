import app from "./app.js"
const port = process.env.PORT || 8080

app.listen(port, () => {
  // console.log(process.env.DATABASE_URL)
  console.log(`App started; listening on port ${port}`)
})