var verse = require('verse/client')
var App = require('./App.js')

document.addEventListener('DOMContentLoaded', function() {
  verse.render(document.getElementById('app'), App);
}, false);
