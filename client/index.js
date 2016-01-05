var Utils = {
  isArray: ('isArray' in Array) ? Array.isArray :
      function (value) {
          return Object.prototype.toString.call(value) === '[object Array]';
      }
};

var Listener = function(state) {
  this.state = state;
}

Listener.prototype.trigger = function() {
  var newElement = document.createElement(this.state.component.tag);
  Client.renderElement(newElement, this.state.component, this.state.context);
  var el = this.state.element;
  el.parentNode.replaceChild(newElement, el);
  this.state.element = newElement;
}

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

var Client = {
  render: function (parent, input, context) {
    parent.innerHTML = '';
    this.recurse(parent,input,context);
  },
  renderElement: function (el, input, context) {
    Object.keys(input).forEach(function(key) {
      var val = input[key];
      if (key == 'tag') {
        // Ignore
      } else if (key == 'listen') {
        val.forEach(function (observer) {
          observer.register(new Listener({
            element: el,
            component: input,
            context: context
          }));
        })
      } else if (key == 'render') {
        Client.recurse(el, val, context);
      } else if (key == 'events') {
        Object.keys(val).forEach(function(eventType) {
          el.addEventListener(eventType, val[eventType])
        });
      } else {
        el[key] = val;
      }
    });
  },
  recurse: function (parent, input, context) {
    if (typeof input == 'object') {
      if (Utils.isArray(input)) {
        input.forEach(function (item) {
          Client.recurse(parent, item, context)
        })
      } else {
        var el = document.createElement(input.tag);
        Client.renderElement(el, input, context);
        parent.appendChild(el);
      }
    } else if (typeof input == 'function') {
      this.recurse(parent, input(context), context);
    } else if (typeof input != 'undefined' && input != null){
      parent.innerHTML = input.toString();
    }
  }
}

module.exports = Client;
