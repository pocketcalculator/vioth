const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const { DATABASE_URL, PORT } = require('./config')
const app = express()

const {router:componentRouter} = require('./systemcomponent')

app.use(express.static('public'))
app.use(morgan('common'))

app.get('/', (request, res) => {
  res.sendFile(__dirname + '/public/index.html')
  res.status('200').json()
})

app.use('/systemcomponent/', componentRouter)

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
