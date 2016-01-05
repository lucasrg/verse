'use strict';

var Utils = {
  isArray: ('isArray' in Array) ? Array.isArray :
      function (value) {
          return Object.prototype.toString.call(value) === '[object Array]';
      }
};

var Server = {
  render: function (input, context) {
    if (typeof input == 'object') {
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
          if (key == 'tag' || key == 'listen' || key == 'events') {
            // Ignore
          } else if (key == 'render') {
            innerHTML = Server.render(val, context);
          } else if (key == 'className') {
            tagDefinition += ' class="'+val+'"';
          } else {
            if (typeof val != 'function') {
              tagDefinition += ' '+key+'="'+val+'"';
            }
          }
        });
        tagDefinition += '>';
        return tagDefinition + innerHTML + '</'+input.tag+'>';
      }
    } else if (typeof input == 'function') {
      return this.render(input(context), context);
    } else if (typeof input != 'undefined' && input != null){
      return input.toString();
    }
    return '';
  }
}

module.exports = Server;
