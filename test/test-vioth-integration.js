const chai = require('chai');
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const expect = chai.expect
const {SystemComponent} = require('../model');
const {app, runServer, closeServer} = require('../server');
const {DATABASE_URL} = require('../config');


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
//  1. make a POST request with data for a new item
//  2. inspect response object and prove it has right
//  status code and that the returned object has an `id`
describe('POST endpoint', function() {
  it('should add an item on POST', function() {
    const newItem = {
      name: 'batteryInstaller',
      safeTempThreshold: 36.5,
      isHuman: true,
    }
    return chai.request(app)
      .post('/systemcomponents')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'name', 'installedDate', 'safeTempThreshold', 'isHuman');
        expect(res.body.id).to.not.equal(null);
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
      .get('/systemcomponents')
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
