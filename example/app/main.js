var verse = require('verse/client')
var App = require('./App')
var Context = require('./Context');

document.addEventListener('DOMContentLoaded', function() {
  try {
    verse.render({
      root: document.getElementById('app'),
      template: App,
      context: Context,
      reconcile: true
    });
  } catch (e) {
      if (e.name == 'ReconcileError') {
        verse.render({
          root: document.getElementById('app'),
          template: App,
          context: Context,
          reconcile: false // Do not reconcile, use client context data instead
        });
      }
    }
}, false);
