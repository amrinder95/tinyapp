const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);


describe('Route Access Tests', function() {
  let agent; // To persist session cookies

  before(function() {
    agent = chai.request.agent('http://localhost:3000');
  });

  it('should redirect / to /login with status code 302', function() {
    return agent
      .get('/')
      .then(function(res) {
        expect(res).to.redirect;
        expect(res).to.redirectTo('http://localhost:3000/login');
      });
  });

  it('should redirect /urls/new to /login with status code 302', function() {
    return agent
      .get('/urls/new')
      .then(function(res) {
        expect(res).to.redirect;
        expect(res).to.redirectTo('http://localhost:3000/login');
      });
  });

  it('should return 404 for non-existent URL', function() {
    return agent
      .get('/urls/NOTEXISTS')
      .then(function(res) {
        expect(res).to.have.status(404);
      });
  });

  describe("Login and Access Control Test", () => {
    it('should return 403 status code for unauthorized access to "http://localhost:3000/urls/b2xVn2"', () => {
      const agent = chai.request.agent("http://localhost:3000");
  
      // Step 1: Login with valid credentials
      return agent
        .post("/login")
        .send({ email: "user2@example.com", password: "dishwasher-funk" })
        .then((loginRes) => {
          // Step 2: Make a GET request to a protected resource
          return agent.get("/urls/b2xVn2").then((accessRes) => {
            // Step 3: Expect the status code to be 403
            expect(accessRes).to.have.status(403);
          });
        });
    });
  });
    
  after(function() {
    agent.close(); // Close agent after all tests
  });
});