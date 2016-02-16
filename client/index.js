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
  while (el.firstChild) {
    el.firstChild.__removed = true;
    el.removeChild(el.firstChild);
  }
  Client.renderElement(el, this.state.component, this.state.context, false, triggers);
}

var Context = function () {
  this.listeners = {};
  this.listenersUniqueId = 0;
}

Context.prototype.trigger = function () {
  var args = Array.prototype.slice.call(arguments);
  var listeners = Object.keys(this.listeners);
  var selected = {};
  var selectedList = [];
  listeners.forEach(function (uid) {
    var l = this.listeners[uid];
    if (l.state.element.__removed) {
      delete this.listeners[uid];
      return;
    }
    args.forEach(function (event) {
      if (!selected[l.state.component._uid] && l.state.component.listen.indexOf(event) >= 0) {
        selected[l.state.component._uid] = l;
        selectedList.push(l);
      }
    });
  }.bind(this))
  selectedList.forEach(function (l) {
    delete this.listeners[l.state.component._uid];
    l.trigger(args);
  }.bind(this));
}

Context.prototype.register = function(component, element) {
  if (!component._uid) component._uid = (++this.listenersUniqueId);
  if (!this.listeners[component._uid]) {
    this.listeners[component._uid] = new Listener({
      parentNode: element.parentNode,
      element: element,
      component: component,
      context: this
    });
  }
}

var Client = {
  createContext: function () {
    return new Context();
  },
  render: function (parent, input, context) {
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
        parent.innerHTML = '';
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
