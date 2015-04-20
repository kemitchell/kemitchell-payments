/* jshint mocha: true */
var assign = require('object-assign');
var clone = require('clone');
var expect = require('chai').expect;
var http = require('http');

var handler = require('..');

describe('Payment Processing Endpoint', function() {
  before(function(done) {
    var test = this;
    test.server = http.createServer(handler());
    test.server.listen(0, function() {
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

  describe('POST /payment', function() {
    describe('without a request body', function() {
      it('responds 400', function(done) {
        this.request({
          method: 'POST',
          path: '/payment'
        }, function(response) {
          expect(response).to.have.property('statusCode', 400);
          done();
        }).end();
      });
    });
  });

  describe('GET /payment', function() {
    it('responds 405', function(done) {
      this.request({
        method: 'GET',
        path: '/payment'
      }, function(response) {
        expect(response).to.have.property('statusCode', 405);
        done();
      }).end();
    });
  });

  after(function() {
    this.server.close();
  });
});
