'use strict';

var Server = {
  render: function (options) {
    return this.recurse(options.template, contextualize(options.context));
  },
  recurse: function (input, context) {
    if (input == null || typeof input == 'undefined') {
      return '';
    } else if (typeof input == 'object') {
      if (Array.isArray(input)) {
        var out = '';
        input.forEach(function (item) {
          out += Server.recurse(item, context)
        })
        return out;
      } else {
        var tagDefinition = '<'+input.tag;
        var innerHTML = '';
        Object.keys(input).forEach(function(key) {
          var val = input[key];
          if (key == 'tag' || key == 'listen' || key == 'events' || val == null || typeof val == 'undefined') {
            // Ignore
          } else if (key == 'render') {
            innerHTML = Server.recurse(val, context);
          } else {
            if (key == 'className') key = 'class';
            if (typeof val == 'function') {
              var value = val(context);
            } else {
              var value = val;
            }
            if (key == 'style') {
              var styleValue = '';
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
      return this.recurse(input(context), context);
    } else {
      return input.toString();
    }
  }
}

function contextualize(ctx) {
  if (ctx) {
    ctx.trigger = ctx.trigger || function () {};
  }
  return ctx;
}

module.exports = Server;
