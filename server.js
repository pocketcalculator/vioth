const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
mongoose.Promise = global.Promise

const { DATABASE_URL, PORT } = require('./config')
const { SystemComponent } = require('./model')

const app = express()

app.use(express.static('public'))
app.use(morgan('common'))
app.use(bodyParser.json())

app.get('/', (request, res) => {
  res.sendFile(__dirname + '/public/index.html')
  res.status('200').json()
})

app.get('/systemcomponents', (req, res) =>{
  SystemComponent
    .find()
    .then(systemComponents =>{
      res.json({
        systemComponents: systemComponents.map(
          (systemComponent) => systemComponent.serialize())
      })
  })
  .catch(err => {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  })
})

// can also request by ID
app.get('/systemcomponents/:id', (req, res) => {
  SystemComponent
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .then(systemComponent => res.json(systemComponent.serialize()))
    .catch(err => {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    })
})

app.post('/systemcomponents', (req, res) => {
  const requiredFields = ['name', 'isHuman', 'safeTempThreshold'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i]
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message)
      return res.status(400).send(message)
    }
  }
  SystemComponent
    .create({
      name: req.body.name,
      isHuman: req.body.isHuman,
      safeTempThreshold: req.body.safeTempThreshold
    })
    .then(systemComponent => res.status(201).json(systemComponent.serialize()))
    .catch(err => {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    })
})

app.put('/systemcomponents/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`)
    console.error(message)
    return res.status(400).json({ message: message })
  }
  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {}
  const updateableFields = ['name', 'isHuman', 'safeTempThreshold']
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field]
    }
  })
  SystemComponent
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(systemComponent => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }))
})

app.delete('/systemcomponents/:id', (req, res) => {
  SystemComponent
    .findByIdAndRemove(req.params.id)
    .then(systemComponent => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }))
})

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' })
})

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useMongoClient: true}, err => {
      if (err) {
        return reject(err)
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`)
        resolve()
      })
        .on('error', err => {
          mongoose.disconnect()
          reject(err)
        })
    })
  })
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server')
      server.close(err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  })
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err))
}

module.exports = { app, runServer, closeServer }
