var http = require('http');

var handler = require('./handler');

http.createServer(handler(
  process.env.STRIPE_SECRET_KEY,
  process.env.STRIPE_PUBLISHABLE_KEY
))
  .listen(process.env.PORT || 8080);
