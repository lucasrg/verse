var verse = require('verse/client')
var App = require('./App')
var Context = require('./Context');

document.addEventListener('DOMContentLoaded', function() {
  verse.render(document.getElementById('app'), App, Context);
}, false);
