const router = require('express').Router()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

router.get('/', (req, res) => {
  res.json(systemComponent.get())
  res.status('200').json()
})

router.post('/', jsonParser, (req, res) => {
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

module.exports = {router}
