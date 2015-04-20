var concat = require('concat-stream');
var fs = require('fs');
var path = require('path');
var replace = require('stream-replace');
var routes = require('routes');
var stripe = require('stripe');
var url = require('url');

var clientFile = (function() {
  var CLIENT = path.join(
    path.dirname(fs.realpathSync(__filename)), '..', 'client'
  );

  return function(file) {
    return fs.createReadStream(path.join(CLIENT, file));
  };
})();

var serve = function(file, mime) {
  return function(_, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', mime);
    clientFile(file).pipe(response);
  };
};

var STRIPE_ERROR_CODES = {
  'incorrect_number': 'The card number is incorrect.',
  'invalid_number':
    'The card number is not a valid credit card number.',
  'invalid_expiry_month': 'The card\'s expiration month is invalid.',
  'invalid_expiry_year': 'The card\'s expiration year is invalid.',
  'invalid_cvc': 'The card\'s security code is invalid.',
  'expired_card': 'The card has expired.',
  'incorrect_cvc': 'The card\'s security code is incorrect.',
  'incorrect_zip': 'The card\'s zip code failed validation.',
  'card_declined': 'The card was declined.',
  'missing': 'There is no card on a customer that is being charged.',
  'processing_error': 'An error occurred while processing the card.'
};

module.exports = function(stripeSecretKey, stripePublishableKey) {
  var stripeAPI = stripe(stripeSecretKey);
  var router = routes();

  router.addRoute('/', function(request, response) {
    response.statusCode = 301;
    response.setHeader('Location', 'http://kemitchell.com');
    response.end();
  });

  router.addRoute('/robots.txt', serve('robots.txt', 'text/plain'));

  router.addRoute('/payments.css', serve('payments.css', 'text/css'));

  router.addRoute('/payments.js', function(_, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    clientFile('payments.js')
      .pipe(replace('STRIPE_PUBLISHABLE_KEY', stripePublishableKey))
      .pipe(response);
  });

  router.addRoute('/new', function(request, response) {
    if (request.method === 'GET') {
      serve('index.html', 'text/html')(request, response);
    } else if (request.method === 'POST') {
      request.pipe(concat(function(buffered) {
        try {
          var body = JSON.parse(buffered);
          stripeAPI.charges.create({
            amount: body.amount,
            currency: 'usd',
            source: body.stripeToken,
            description: 'web payment'
          }, function(errorObject) {
            if (errorObject) {
              var error = errorObject.error;
              if (
                error === 'invalid_request_error' ||
                error === 'api_error'
              ) {
                response.statusCode = 400;
                response.end('Invalid request');
              } else if (error === 'card_error') {
                response.statusCode = 400;
                response.end(STRIPE_ERROR_CODES[error.code]);
              } else {
                console.error(error);
                response.statusCode = 500;
                response.end();
              }
            } else {
              response.statusCode = 201;
              response.end();
            }
          });
        } catch (e) {
          response.statusCode = 400;
          response.end();
        }
      }));
    } else {
      response.statusCode = 405;
      response.end();
    }
  });

  return function(request, response) {
    if (request.headers['x-forwarded-proto'] === 'http') {
      var location = 'https://' + request.headers.host + request.url;
      console.log('Redirecting to HTTPS');
      response.statusCode = 301;
      response.setHeader('Location', location);
      response.end();
    } else {
      var route = router.match(url.parse(request.url).pathname);
      if (route) {
        route.fn(request, response, route);
      } else {
        response.statusCode = 404;
        response.end();
      }
    }
  };
};
