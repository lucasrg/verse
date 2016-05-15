var verse = require('verse/client')
var App = require('./App')
var Context = require('./Context');

document.addEventListener('DOMContentLoaded', function() {
  verse.render({
    root: document.getElementById('app'),
    template: App,
    context: Context,
    reconcile: true
  });
}, false);
