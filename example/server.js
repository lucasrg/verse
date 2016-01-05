'use strict';


var express = require('express');
var verse = require('verse/server');
var path = require('path');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();
var app = express();

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 3000;
var publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

// We only want to run the workflow when not in production
if (!isProduction) {

  // We require the bundler inside the if block because
  // it is only needed in a development environment. Later
  // you will see why this is a good idea
  var bundle = require('./webpack.bundler.js');
  bundle();

  // Any requests to localhost:3000/build is proxied
  // to webpack-dev-server
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8080'
    });
  });

}

var Html = require('./app/Html')
var Context = require('./app/Context')

app.get('/', function (req, res) {
  var context = Context(verse.createContext());
  res.send(verse.render(Html, context));
});

// Just a simple API test proxy
var apiProxy = require('express-http-proxy');
app.use('/api', apiProxy('jsonplaceholder.typicode.com', {
  forwardPath: function(req, res) {
    return require('url').parse(req.url).path.replace(/\/api/,'/');
  }
}));

// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...');
});

app.listen(port, function () {
  console.log('Server running on port ' + port);
});
