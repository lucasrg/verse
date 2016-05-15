'use strict';

var Server = {
  render: function (options) {
    return this.recurse(options.template, options.context);
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
          } else if (key == 'className') {
            tagDefinition += ' class="'+val+'"';
          } else {
            if (typeof val == 'function') {
              tagDefinition += ' '+key+'="'+val(context)+'"';
            } else {
              tagDefinition += ' '+key+'="'+val+'"';
            }
            //TODO Handle 'style' attribute
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

module.exports = Server;
