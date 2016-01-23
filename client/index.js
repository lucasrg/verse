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
  var el = this.state.element;
  if (el && el.parentNode) {
    var newElement = document.createElement(this.state.component.tag);
    Client.renderElement(newElement, this.state.component, this.state.context);
    var pos = el.scrollTop;
    el.parentNode.replaceChild(newElement, el);
    newElement.scrollTop = pos;
    this.state.element = newElement;
  } else {
    console.warn('Warning! Element parent node not found on trigger', this.state.component);
  }
}

var Context = function () {
  this.listeners = {};
}

Context.prototype.trigger = function () {
  var args = Array.prototype.slice.call(arguments);
  var selectedListeners = [];
  args.forEach(function (event) {
    var l = this.listeners[event];
    if (l) {
      this.listeners[event] = [];
      l.forEach(function (listener) {
        var found = false;
        selectedListeners.some(function (selected) {
          if (selected.state.component == listener.state.component) {
            found = true;
            return true;
          }
        })
        if (!found) selectedListeners.push(listener);
      })
    } else {
      console.warn('Warning! No event registered for "'+event+'"');
    }
  }.bind(this))

  selectedListeners.forEach(function (listener) {
    listener.trigger();
  })
  selectedListeners.forEach(function (listener) {
    var c = listener.state.component;
    if (c.events && c.events.render) {
      c.events.render({
        context: listener.state.context,
        target: listener.state.element,
        triggers: args
      });
    }
  })
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
          if (eventType != 'render') {
            el.addEventListener(eventType, val[eventType])
          }
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
