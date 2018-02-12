const chai = require('chai');
const chaiHttp = require('chai-http')
const app = require('../server')
const expect = chai.expect

chai.use(chaiHttp)

describe('GET endpoint', function() {
  it('should respond with a 200 status code', function() {
    let res
    return chai.request(app)
      .get('/')
      .then(function(_res) {
        res = _res
        expect(res).to.have.status(200)
      })
  })
})
// 1. make a request to `/status`
// 2. inspect response object and ensure code is correct and has
//    matching keys.
describe('GET endpoint', function() {
  it('should list items on GET', function() {
    let res
    return chai.request(app)
      .get('/status')
      .then(function(_res) {
        res = _res
        expect(res).to.have.status(200)
        expect(res).to.be.json;
        expect(res.body).to.be.a('array')
        expect(res.body.length).to.be.at.least(1)
// each item should be an object with correct key/value pairs
        const expectedKeys = ['id', 'name', 'installedDate', 'safeTempThreshold', 'isHuman'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object')
          expect(item).to.include.keys(expectedKeys)
        })
      })
  })
})
