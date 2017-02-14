var Verse = {
  render: function (options, root) {
    if (root) {
      // Render as DOM and track events (client side)
      if (options.context) contextualize(options.context, true);
      if (!options.reconcile) root.innerHTML = '';
      this._renderDOM(root,options.template,options.context, options.reconcile, false);
    } else {
      // Render as string (server side)
      if (options.context) contextualize(options.context, false);
      return this._renderString(options.template, options.context);
    }
  },

  _renderString: function (input, context) {
    if (input == null || typeof input == 'undefined') {
      return '';
    } else if (typeof input == 'object') {
      if (isArray(input)) {
        var out = '';
        input.forEach(function (item) {
          out += Verse._renderString(item, context)
        })
        return out;
      } else {
        var tagDefinition = '<'+input.tag;
        var innerHTML = '';
        Object.keys(input).forEach(function(key) {
          var val = input[key];
          if (key == 'tag' || key == 'listen' || key == 'events' || key == 'transition' || val == null || typeof val == 'undefined') {
            // Ignore
          } else if (key == 'render') {
            innerHTML = Verse._renderString(val, context);
          } else {
            if (key == 'className') key = 'class';
            if (typeof val == 'function') {
              var value = val(context) || '';
            } else {
              var value = val;
            }
            if (key == 'style') {
              var styleKeyValuePairs = '';
              Object.keys(value).forEach(function(styleKey) {
                var dashedKey = styleKey.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                styleKeyValuePairs += dashedKey+':'+value[styleKey]+';';
              });
              value = styleKeyValuePairs;
            }
            tagDefinition += ' '+key+'="'+value+'"';
          }
        });
        tagDefinition += '>';
        return tagDefinition + innerHTML + '</'+input.tag+'>';
      }
    } else if (typeof input == 'function') {
      return Verse._renderString(input(context), context);
    } else {
      return input.toString();
    }
  },

  _renderDOM: function (parent, input, context, reconcile, append) {
    if (input == null || typeof input == 'undefined') {
      // ignore
    } else if (typeof input == 'object') {
      if (isArray(input)) {
        input.forEach(function (item) {
          Verse._renderDOM(parent, item, context, reconcile, true)
        })
      } else {
        if (reconcile) {
          Verse._reconcileElement(parent, input, context);
        } else {
          var el = document.createElement(input.tag);
          Verse._renderElement(el, input, context, true);
          parent.appendChild(el);
        }
      }
    } else if (typeof input == 'function') {
      Verse._renderDOM(parent, input(context), context, reconcile, append);
    } else if (!reconcile) {
      parent.innerHTML = append ? parent.innerHTML + input.toString() : input.toString();
    }
  },

  _renderElement: function (el, input, context, initialize, triggers) {
    Object.keys(input).forEach(function(key) {
      var val = input[key];
      if (val == null || typeof val == 'undefined' || key == 'tag' || key == 'transition') {
        // Ignore
      } else if (key == 'listen' && context) {
        context.__register(input, el);
      } else if (key == 'render') {
        Verse._renderDOM(el, val, context);
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
          var value = val(context) || '';
        } else {
          var value = val;
        }
        if (key == 'className') key = 'class';
        if (key == 'style') {
          Object.keys(value).forEach(function(styleKey) {
            el.style[styleKey] = value[styleKey];
          });
        } else if (key == 'class') {
          el.setAttribute(key,el.__transitionClass || value);
          if (input.transition) el.__transitionClass = value;
        } else {
          el.setAttribute(key,value);
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

    if (input.transition && el.__transitionClass) {
      if (el.__transitionTimeout) clearTimeout(el.__transitionTimeout)
      el.__transitionTimeout = setTimeout(function () {
        el.className = el.__transitionClass
      }, input.transition)
    }
  },

  _reconcileElement: function(parent, input, context) {
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
      Verse._renderDOM(el, input.render, context, true, false);
    }
  },

  _recurseDOM: function (node, triggeredEvents) {
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
      Verse._renderElement(node, l.component, l.context, false, triggeredEvents);
    } else {
      node = node.firstChild;
      while(node) {
        Verse._recurseDOM(node, triggeredEvents);
        node = node.nextSibling;
      }
    }
  }
}

function contextualize(ctx, registerEvents) {
  if (!registerEvents) {
    ctx.trigger = ctx.trigger || function () {};
    return;
  }

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
          } else {
            triggeredEvents.forEach(function (event) {
              if (l.component.listen == event ||
                  (l.component.listen.indexOf &&
                    l.component.listen.indexOf(event) >= 0)) {
                l.element.__trigger = l;
              }
            });
          }
        });
        Verse._recurseDOM(document, triggeredEvents);
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

var isArray = ('isArray' in Array) ? Array.isArray : function (value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

module.exports = Verse;
