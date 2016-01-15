'use strict';

var Utils = {
  isArray: ('isArray' in Array) ? Array.isArray :
      function (value) {
          return Object.prototype.toString.call(value) === '[object Array]';
      }
};

var Context = function () {}

var Server = {
  createContext: function () {
    return new Context()
  },
  render: function (input, context) {
    if (input == null || typeof input == 'undefined') {
      return '';
    } else if (typeof input == 'object') {
      if (Utils.isArray(input)) {
        var out = '';
        input.forEach(function (item) {
          out += Server.render(item, context)
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
            innerHTML = Server.render(val, context);
          } else if (key == 'className') {
            tagDefinition += ' class="'+val+'"';
          } else {
            if (typeof val == 'function') {
              tagDefinition += ' '+key+'="'+val(context)+'"';
            } else {
              tagDefinition += ' '+key+'="'+val+'"';
            }
          }
        });
        tagDefinition += '>';
        return tagDefinition + innerHTML + '</'+input.tag+'>';
      }
    } else if (typeof input == 'function') {
      return this.render(input(context), context);
    } else {
      return input.toString();
    }
  }
}

module.exports = Server;
