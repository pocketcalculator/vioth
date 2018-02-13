const express = require('express')
const morgan = require('morgan')
const app = express()
const {router:statusRouter} = require('./status')

app.use(express.static('public'))
app.use(morgan('common'))

app.get("/", (request, res) => {
  res.sendFile(__dirname + '/public/index.html')
  res.status('200').json()
})

app.use('/status', statusRouter)
app.listen(process.env.PORT || 8080, () => {
  console.log( `Your app is listening on port ${process.env.PORT || 8080}`)
})
module.exports = app
