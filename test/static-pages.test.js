/* jshint mocha: true */
var assign = require('object-assign');
var clone = require('clone');
var expect = require('chai').expect;
var http = require('http');

var handler = require('..');

var RANDOM_HIGH_PORT = 0;

describe('Static Pages', function() {
  before(function(done) {
    var test = this;
    test.server = http.createServer(handler());
    test.server.listen(RANDOM_HIGH_PORT, function() {
      test.request = (function() {
        var defaultOptions = {port: test.server.address().port};
        return function(newOptions, callback) {
          var options = assign(clone(defaultOptions), newOptions);
          return http.request(options, callback);
        };
      })();
      done();
    });
  });

  describe('GET /', function() {
    before(function(done) {
      this.request({path: '/'}, function(response) {
        this.response = response;
        done();
      }.bind(this)).end();
    });

    it('responds 200', function() {
      expect(this.response)
        .to.have.property('statusCode', 200);
    });

    it('serves Content-Type: text/html', function() {
      expect(this.response.headers)
        .to.have.property('content-type', 'text/html');
    });
  });

  describe('GET /payments.js', function() {
    before(function(done) {
      this.request({path: '/payments.js'}, function(response) {
        this.response = response;
        done();
      }.bind(this)).end();
    });

    it('responds 200', function() {
      expect(this.response)
        .to.have.property('statusCode', 200);
    });

    it('serves Content-Type: application/json', function() {
      expect(this.response.headers)
        .to.have.property('content-type', 'application/json');
    });
  });

  describe('GET /payments.css', function() {
    before(function(done) {
      this.request({path: '/payments.css'}, function(response) {
        this.response = response;
        done();
      }.bind(this)).end();
    });

    it('responds 200', function() {
      expect(this.response)
        .to.have.property('statusCode', 200);
    });

    it('serves Content-Type: text/css', function() {
      expect(this.response.headers)
        .to.have.property('content-type', 'text/css');
    });
  });

  describe('GET /<nonexistent>', function() {
    it('responds 404', function(done) {
      this.request({path: '/nonexistent'}, function(response) {
        expect(response).to.have.property('statusCode', 404);
        done();
      }).end();
    });
  });

  after(function() {
    this.server.close();
  });
});
