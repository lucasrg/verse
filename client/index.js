var Utils = {
  isArray: ('isArray' in Array) ? Array.isArray :
      function (value) {
          return Object.prototype.toString.call(value) === '[object Array]';
      }
};

var Context = function (ctx) {
  if (ctx) {
    Object.keys(ctx).forEach(function(key) {
      this[key] = ctx[key];
    }.bind(this));
  }
  this.__listeners = {};
  this.__listenersUniqueId = 0;
  this.__lastTriggeredEvents = {};
}

Context.prototype.trigger = function () {
  var triggeredEvents = Array.prototype.slice.call(arguments);
  triggeredEvents.forEach(function (event) {
    this.__lastTriggeredEvents[event] = true;
  }.bind(this));

  if (!this.__triggerTimeout) {
    var self = this;
    this.__triggerTimeout = setTimeout(function () {
      self.executeTriggers(Object.keys(self.__lastTriggeredEvents));
      self.__lastTriggeredEvents = {};
      self.__triggerTimeout = null;
    }, 0);
  }
}

Context.prototype.executeTriggers = function (triggeredEvents) {
  var listeners = Object.keys(this.__listeners);
  listeners.forEach(function (uid) {
    var l = this.__listeners[uid];
    if (l.element.__removed) {
      delete this.__listeners[uid];
      return;
    }
    triggeredEvents.forEach(function (event) {
      if (l.component.listen.indexOf(event) >= 0) {
        l.element.__trigger = l;
      }
    });
  }.bind(this))

  var recurseDOM = function (node) {
    if (node.__trigger) {
      var l = node.__trigger;
      delete node.__trigger;
      while(node.attributes.length > 0) {
        node.removeAttribute(node.attributes[0].name);
      }
      while (node.firstChild) {
        node.firstChild.__removed = true;
        node.removeChild(node.firstChild);
      }
      Client.renderElement(node, l.component, l.context, false, triggeredEvents);
    } else {
      node = node.firstChild;
      while(node) {
        recurseDOM(node);
        node = node.nextSibling;
      }
    }
  };

  recurseDOM(document);
}

Context.prototype.register = function(component, element) {
  if (!component._uid) component._uid = (++this.__listenersUniqueId);
  this.__listeners[component._uid] = {
    element: element,
    component: component,
    context: this
  }
}

var Client = {
  createContext: function () {
    return new Context();
  },
  render: function (parent, input, context) {
    if (context && !(context instanceof Context)) {
      context = new Context(context);
    }
    parent.innerHTML = '';
    this.recurse(parent,input,context);
  },
  renderElement: function (el, input, context, initialize, triggers) {
    Object.keys(input).forEach(function(key) {
      var val = input[key];
      if (val == null || typeof val == 'undefined' || key == 'tag') {
        // Ignore
      } else if (key == 'listen') {
        if (context) {
          context.register(input, el);
        }
      } else if (key == 'render') {
        Client.recurse(el, val, context);
      } else if (key == 'events') {
        if (initialize) {
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
        input.forEach(function (item) {
          Client.recurse(parent, item, context, true)
        })
      } else {
        var el = document.createElement(input.tag);
        Client.renderElement(el, input, context, true);
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
