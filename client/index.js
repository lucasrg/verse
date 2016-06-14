var Client = {
  render: function (options) {
    if (options.context) contextualize(options.context);
    if (!options.reconcile) options.root.innerHTML = '';
    Client.recurse(options.root,options.template,options.context, options.reconcile, false);
  },
  recurse: function (parent, input, context, reconcile, append) {
    if (input == null || typeof input == 'undefined') {
      // ignore
    } else if (typeof input == 'object') {
      if (isArray(input)) {
        input.forEach(function (item) {
          Client.recurse(parent, item, context, reconcile, true)
        })
      } else {
        if (reconcile) {
          Client.reconcileElement(parent, input, context);
        } else {
          var el = document.createElement(input.tag);
          Client.renderElement(el, input, context, true);
          parent.appendChild(el);
        }
      }
    } else if (typeof input == 'function') {
      Client.recurse(parent, input(context), context, reconcile, append);
    } else if (!reconcile) {
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
  reconcileElement: function(parent, input, context) {
    if (!parent.firstChild) return;
    if (!parent.__cc) parent.__cc = parent.firstChild;
    var el = parent.__cc;
    parent.__cc = el.nextSibling;
    if (el.tagName.toLowerCase() != input.tag.toLowerCase()) {
      console.warn('Warning! Reconcilliation failed at', el, input, el.outerHTML);
      throw new ReconcileError();
    }
    if (input.listen && context) {
      context.__register(input, el);
    }
    if (input.events) {
      Object.keys(input.events).forEach(function(eventType) {
        if (eventType == 'render') {
          setTimeout(function () {
            input.events.render({context: context, target: el, triggers: []});
          }, 0)
        } else {
          el.addEventListener(eventType, input.events[eventType], false)
        }
      });
    }
    if (input.render) {
      Client.recurse(el, input.render, context, true, false);
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
  if (ctx.__register) return;

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

function ReconcileError() {
  this.name = 'ReconcileError';
  this.stack = (new Error()).stack;
}
ReconcileError.prototype = Object.create(Error.prototype);
ReconcileError.prototype.constructor = ReconcileError;

module.exports = Client;
