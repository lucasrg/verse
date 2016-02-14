var Utils = {
  isArray: ('isArray' in Array) ? Array.isArray :
      function (value) {
          return Object.prototype.toString.call(value) === '[object Array]';
      }
};

var Listener = function(state) {
  this.state = state;
}

Listener.prototype.trigger = function(triggers) {
  var el = this.state.element;
  while(el.attributes.length > 0) {
    el.removeAttribute(el.attributes[0].name);
  }
  el.innerHTML = '';
  Client.renderElement(el, this.state.component, this.state.context, triggers);
}

var Context = function () {
  this.listeners = {};
}

Context.prototype.trigger = function () {
  var args = Array.prototype.slice.call(arguments);
  args.forEach(function (event) {
    var l = this.listeners[event];
    this.listeners[event] = [];
    if (l) {
      l.forEach(function (listener) {
        listener.trigger(args);
      })
    } else {
      console.warn('Warning! No event registered for "'+event+'"');
    }
  }.bind(this))

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
  renderElement: function (el, input, context, triggers) {
    Object.keys(input).forEach(function(key) {
      var val = input[key];
      if (val == null || typeof val == 'undefined' || key == 'tag') {
        // Ignore
      } else if (key == 'listen') {
        if (context && context.register) {
          val.forEach(function (observer) {
            context.register(observer, new Listener({
              parentNode: el.parentNode,
              element: el,
              component: input,
              context: context
            }));
          })
        }
      } else if (key == 'render') {
        Client.recurse(el, val, context);
      } else if (key == 'events') {
        if (!el.__events_initialized__) {
          el.__events_initialized__ = true;
          Object.keys(val).forEach(function(eventType) {
            if (eventType != 'render') {
              el.addEventListener(eventType, val[eventType], false)
            }
          });
        }
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
    if (input.events && input.events.render) {
      input.events.render({
        context: context,
        target: el,
        triggers: triggers || []
      });
    }
  },
  recurse: function (parent, input, context, append) {
    if (input == null || typeof input == 'undefined') {
      // ignore
    } else if (typeof input == 'object') {
      if (Utils.isArray(input)) {
        parent.innerHTML = '';
        input.forEach(function (item) {
          Client.recurse(parent, item, context, true)
        })
      } else {
        var el = document.createElement(input.tag);
        Client.renderElement(el, input, context);
        parent.appendChild(el);
      }
    } else if (typeof input == 'function') {
      this.recurse(parent, input(context), context);
    } else {
      parent.innerHTML = append ? parent.innerHTML + input.toString() : input.toString();
    }
  }
}

module.exports = Client;
