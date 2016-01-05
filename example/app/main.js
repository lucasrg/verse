var verse = require('verse/client')
var App = require('./App')
var Context = require('./Context');

document.addEventListener('DOMContentLoaded', function() {
  var context = Context(verse.createContext());
  verse.render(document.getElementById('app'), App, context);
}, false);
