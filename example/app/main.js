var verse = require('verse/client')
var App = require('./App')
var Store = require('verse/store')

document.addEventListener('DOMContentLoaded', function() {
  var context = {
    stores: {
      Posts: new Store({
        items: []
      })
    },
    actions: {
      Posts: require('./actions/PostActions')
    }
  }
  verse.render(document.getElementById('app'), App, context);
}, false);
