const chai = require('chai');
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const faker = require('faker')
const expect = chai.expect
const {
  SystemComponent
} = require('../model');
const {
  app,
  runServer,
  closeServer
} = require('../server');
const {
  DATABASE_URL
} = require('../config');


chai.use(chaiHttp)

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedSystemComponentsData() {
  console.info('seeding system components data');
  const seedData = [];

  for (let i = 1; i <= 10; i++) {
    seedData.push(generateSystemComponentsData());
  }
  // this will return a promise
  return SystemComponent.insertMany(seedData);
}

// generate an object represnting a restaurant.
// can be used to generate seed data for db
// or request.body data
function generateSystemComponentsData() {
  return {
    name: faker.commerce.productName(),
    safeTempThreshold: faker.random.number(),
    isHuman: false,
    installedDate: Date.now()
  }
}

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('System Components API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(DATABASE_URL);
  });

  beforeEach(function() {
    return seedSystemComponentsData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

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
  // 1. make a request to `/systemcomponents`
  // 2. inspect response object and ensure code is correct and has
  //    matching keys.
  describe('GET endpoint', function() {
    it('should list items on GET', function() {
      let res
      return chai.request(app)
        .get('/systemcomponents')
        .then(function(_res) {
          res = _res
          console.log(res.body)
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body.systemComponents).to.be.an.array
          console.log(res.body.length)
          expect(res.body.systemComponents.length).to.be.at.least(1)
          // each item should be an object with correct key/value pairs
          const expectedKeys = ['id', 'name', 'safeTempThreshold', 'isHuman', 'installedDate']
          res.body.forEach(function(item) {
            expect(item).to.be.a('object')
            expect(item).to.include.keys(expectedKeys)
          })
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
        installedDate: Date.now()
      }
      return chai.request(app)
        .post('/systemcomponents')
        .send(newItem)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name', 'safeTempThreshold', 'isHuman', 'installedDate');
          expect(res.body.id).to.not.equal(null);
        })
    })
  })

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a restaurant
    //  2. make a DELETE request for that restaurant's id
    //  3. assert that response has right status code
    //  4. prove that restaurant with the id doesn't exist in db anymore
    it('delete a system component by id', function() {

      let res

      return SystemComponent
        .findOne()
        .then(function(_res) {
          res = _res
          return chai.request(app).delete(`/systemcomponents/${res.id}`)
        })
        .then(function(res) {
          expect(res).to.have.status(204)
          return SystemComponent.findById(res.id)
        })
        .then(function(_res) {
          expect(_res).to.be.null
        })
    })
  })
})
