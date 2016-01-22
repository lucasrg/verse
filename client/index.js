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
  if (this.state.element) {
    var newElement = document.createElement(this.state.component.tag);
    Client.renderElement(newElement, this.state.component, this.state.context);
    var el = this.state.element;
    el.parentNode.replaceChild(newElement, el);
    this.state.element = newElement;
  }
}

var Context = function () {
  this.listeners = {};
}

Context.prototype.trigger = function (postRenderCallback) {
  var args = Array.prototype.slice.call(arguments);
  var selectedListeners = [];
  args.forEach(function (event) {
    var l = this.listeners[event];
    if (l) {
      this.listeners[event] = [];
      selectedListeners = selectedListeners.concat(l)
    } else {
      console.warn('Warning! No event registered for "'+event+'"');
    }
  }.bind(this))
  selectedListeners.forEach(function (listener) {
    listener.trigger();
  })
  if (postRenderCallback) postRenderCallback(this.context, this.component, this.el);
}

Context.prototype.register = function(event, listener) {
  this.listeners[event] = this.listeners[event] || [];
  this.listeners[event].push(listener);
}

var Client = {
  createContext: function () {
    return new Context();
  },
  render: function (parent, input, context) {
    parent.innerHTML = '';
    this.recurse(parent,input,context);
  },
  renderElement: function (el, input, context) {
    Object.keys(input).forEach(function(key) {
      var val = input[key];
      if (val == null || typeof val == 'undefined' || key == 'tag') {
        // Ignore
      } else if (key == 'listen') {
        if (context && context.register) {
          val.forEach(function (observer) {
            context.register(observer, new Listener({
              element: el,
              component: input,
              context: context
            }));
          })
        }
      } else if (key == 'render') {
        Client.recurse(el, val, context);
      } else if (key == 'events') {
        Object.keys(val).forEach(function(eventType) {
          el.addEventListener(eventType, val[eventType])
        });
      } else {
        if (typeof val == 'function') {
          var value = val(context);
        } else {
          var value = val;
        }
        if (key == 'style') {
          Object.keys(value).forEach(function(styleKey) {
            el.style[styleKey] = value[styleKey];
          });
        } else {
          el[key] = value;
        }
      }
    });
  },
  recurse: function (parent, input, context) {
    if (input == null || typeof input == 'undefined') {
      // ignore
    } else if (typeof input == 'object') {
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
    } else {
      parent.innerHTML = input.toString();
    }
  }
}

module.exports = Client;
