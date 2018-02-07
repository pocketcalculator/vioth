const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.static('public'))

app.get('/status', (req, res) => {
  res.status('200').json()
})

app.listen(process.env.PORT || 8080)
