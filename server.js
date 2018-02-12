const express = require('express')
const morgan = require('morgan')
const app = express()
const bodyParser = require('body-parser')
const {systemComponent} = require('./model.js')
const jsonParser = bodyParser.json()

app.use(express.static('public'))
app.use(morgan('common'))

systemComponent.create('roboticArm', 50, false)
systemComponent.create('conveyerBelt2', 18, false)
systemComponent.create('serverB', 28, false)
systemComponent.create('packingEngineer', 37, true)

app.get('/status', (req, res) => {
  res.json(systemComponent.get())
  res.status('200').json()
})

app.get("/", (request, res) => {
  res.sendFile(__dirname + '/public/index.html')
  res.status('200').json()
})

app.listen(process.env.PORT || 8080, () => {
  console.log( `Your app is listening on port ${process.env.PORT || 8080}`)
})
module.exports = app
