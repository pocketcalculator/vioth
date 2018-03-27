const router = require('express').Router()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const {
  SystemComponent
} = require('./model.js')

const jwtAuth = require('passport').authenticate('jwt', { session: false })

router.get('/', (req, res) => {
  SystemComponent
    .find()
    .then(systemComponents => {
      res.json({
        systemComponents: systemComponents.map(
          (systemComponent) => systemComponent.serialize())
      })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({
        message: 'Internal server error'
      })
    })
})

// can also request by ID
router.get('/:id', (req, res) => {
  SystemComponent
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .then(systemComponent => res.json(systemComponent.serialize()))
    .catch(err => {
      console.error(err)
      res.status(500).json({
        message: 'Internal server error'
      })
    })
})

router.post('/', [jwtAuth, jsonParser], (req, res) => {
  const requiredFields = ['name', 'isHuman', 'safeTempThreshold', 'installedDate'];
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
      safeTempThreshold: req.body.safeTempThreshold,
      installedDate: req.body.installedDate
    })
    .then(systemComponent => res.status(201).json(systemComponent.serialize()))
    .catch(err => {
      console.error(err)
      res.status(500).json({
        message: 'Internal server error'
      })
    })
})

router.put('/:id', [jwtAuth, jsonParser], (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`)
    console.error(message)
    return res.status(400).json({
      message: message
    })
  }
  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {}
  const updateableFields = ['name', 'isHuman', 'safeTempThreshold', 'readings']
  let updateOptions = {
    $set: toUpdate
  }
  updateableFields.forEach(field => {
    if (field in req.body) {
      if (field !== 'readings') {
        toUpdate[field] = req.body[field]
      }
      else if (field === 'readings') {
        updateOptions.$push = { readings: req.body['readings'] }
      }
    }
  })
  SystemComponent
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, updateOptions)
    .then(systemComponent => res.status(204).end())
    .catch(err => res.status(500).json({
      message: 'Internal server error'
    }))
})

router.delete('/:id', [jwtAuth, jsonParser], (req, res) => {
  SystemComponent
    .findByIdAndRemove(req.params.id)
    .then(systemComponent => res.status(204).end())
    .catch(err => res.status(500).json({
      message: 'Internal server error'
    }))
})

module.exports = {
  router
}
