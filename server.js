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
systemComponent.create('packingEngineer', 36.8, true)

app.get("/", (request, res) => {
  res.sendFile(__dirname + '/public/index.html')
  res.status('200').json()
})

app.get('/status', (req, res) => {
  res.json(systemComponent.get())
  res.status('200').json()
})

app.post('/status', jsonParser, (req, res) => {
// ensure `name` and `safeTempThreshold` are in request body
  const requiredFields = ['name', 'safeTempThreshold'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = systemComponent.create(req.body.name, req.body.safeTempThreshold, req.body.isHuman);
  res.status(201).json(item);
});

app.listen(process.env.PORT || 8080, () => {
  console.log( `Your app is listening on port ${process.env.PORT || 8080}`)
})
module.exports = app
