var Store = function (state) {
  this.state = state;
  this.listeners = [];
}

Store.prototype.trigger = function () {
  var l = this.listeners;
  this.listeners = [];
  l.forEach(function (listener) {
    listener.trigger();
  })
}

Store.prototype.register = function(listener) {
  this.listeners.push(listener);
}

module.exports = Store;
