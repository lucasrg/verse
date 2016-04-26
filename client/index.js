var Client = {
  render: function (parent, input, context) {
    contextualize(context);
    parent.innerHTML = '';
    Client.recurse(parent,input,context);
  },
  recurse: function (parent, input, context, append) {
    if (input == null || typeof input == 'undefined') {
      // ignore
    } else if (typeof input == 'object') {
      if (isArray(input)) {
        input.forEach(function (item) {
          Client.recurse(parent, item, context, true)
        })
      } else {
        var el = document.createElement(input.tag);
        Client.renderElement(el, input, context, true);
        parent.appendChild(el);
      }
    } else if (typeof input == 'function') {
      Client.recurse(parent, input(context), context);
    } else {
      parent.innerHTML = append ? parent.innerHTML + input.toString() : input.toString();
    }
  },
  renderElement: function (el, input, context, initialize, triggers) {
    Object.keys(input).forEach(function(key) {
      var val = input[key];
      if (val == null || typeof val == 'undefined' || key == 'tag') {
        // Ignore
      } else if (key == 'listen' && context) {
        context.__register(input, el);
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
      setTimeout(function () {
        input.events.render({
          context: context,
          target: el,
          triggers: triggers || []
        });
      }, 0)
    }
  },
  recurseDOM: function (node, triggeredEvents) {
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
        Client.recurseDOM(node, triggeredEvents);
        node = node.nextSibling;
      }
    }
  }
}

var isArray = ('isArray' in Array) ? Array.isArray : function (value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

function contextualize(ctx) {
  if (!ctx || ctx.__register) return;

  ctx.__listeners = {};
  ctx.__listenersUniqueId = 0;
  ctx.__lastTriggeredEvents = {};

  ctx.__register = function(component, element) {
    if (!component._uid) component._uid = (++ctx.__listenersUniqueId);
    ctx.__listeners[component._uid] = {
      element: element,
      component: component,
      context: ctx
    }
  }

  ctx.trigger = function () {
    Array.prototype.slice.call(arguments).forEach(function (event) {
      ctx.__lastTriggeredEvents[event] = true;
    });

    if (!ctx.__triggerTimeout) {
      ctx.__triggerTimeout = setTimeout(function () {
        var triggeredEvents = Object.keys(ctx.__lastTriggeredEvents);
        ctx.__lastTriggeredEvents = {};
        ctx.__triggerTimeout = null;
        Object.keys(ctx.__listeners).forEach(function (uid) {
          var l = ctx.__listeners[uid];
          if (l.element.__removed) {
            delete ctx.__listeners[uid];
            return;
          }
          triggeredEvents.forEach(function (event) {
            if (l.component.listen.indexOf(event) >= 0) {
              l.element.__trigger = l;
            }
          });
        });
        Client.recurseDOM(document, triggeredEvents);
      }, 0);
    }
  }
}

module.exports = Client;
