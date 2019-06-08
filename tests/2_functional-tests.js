/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let _idToAfter1;
let _idToTest5;

chai.use(chaiHttp);

suite('Functional Tests', function() {

  before(async function() {
      await chai.request(server)
      .post('/api/books')
      .send({'title': 'Imagination'})
      .then(res => {
        _idToAfter1 = res.body._id;
      });
   });
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');//console.log(true);
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({'title': 'Fantasy'})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.isArray(res.body.comments);
          //assert.property(res.body, 'commentcount');
          assert.property(res.body, 'comments');
          assert.property(res.body, 'title');
          assert.property(res.body, '_id');
          assert.equal(res.body.title, 'Fantasy');//console.log(res.body);
          //assert.equal(res.body.commentcout, 0);
          _idToTest5 = res.body._id;
          done();
        });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'missing title');
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        //.query({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          //assert.equal(res.body[0].title, 'Fantasy');
          assert.property(res.body[0], 'title');
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'commentcount');
          done();
        });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/unknownid')
        //.query({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books/'+_idToTest5)
        //.query({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'title');
          assert.property(res.body, '_id');
          assert.property(res.body, 'comments');
          assert.isArray(res.body.comments);
          assert.equal(res.body.title, 'Fantasy');
          assert.equal(res.body._id, _idToTest5);
          done();
        });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .post('/api/books/'+_idToTest5)
        .send({comment: 'Nice book'})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'title');
          assert.property(res.body, '_id');
          assert.property(res.body, 'comments');
          assert.isArray(res.body.comments);
          assert.deepEqual(res.body.comments, ['Nice book']);
          done();
        });
      });
      
    });
    
    after(async function() {
      await chai.request(server)
      .delete('/api/books/'+_idToAfter1)
      .send({});
      await chai.request(server)
      .delete('/api/books/'+_idToTest5)
      .send({});
   });
  });

});
