const chai = require('chai');
const chaiHttp = require('chai-http')
const app = require('../server')
const expect = chai.expect

describe('GET endpoint', function() {
  it('should respond with a 200 status code', function() {
    let res
    return chai.request(app)
      .get('/status')
      .then(function(_res) {
        res = _res
        expect(res).to.have.status(200)
      })
  })
})
