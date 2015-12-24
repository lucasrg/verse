var Utils = {
  isArray: ('isArray' in Array) ? Array.isArray :
      function (value) {
          return Object.prototype.toString.call(value) === '[object Array]';
      }
};

var Client = {
  render: function (parent, input, context) {
    parent.innerHTML = '';
    this.recurse(parent,input,context);
  },
  recurse: function (parent, input, context) {
    if (typeof input == 'object') {
      if (Utils.isArray(input)) {
        input.forEach(function (item) {
          Client.recurse(parent, item, context)
        })
      } else {
        var el = document.createElement(input.tag);
        parent.appendChild(el);
        Object.keys(input).forEach(function(key) {
          var val = input[key];
          if (key == 'tag') {
            // Ignore
          } else if (key == 'listen') {
            //TODO
          } else if (key == 'render') {
            Client.recurse(el, val, context);
          } else if (key == 'events') {
            Object.keys(val).forEach(function(eventType) {
              el.addEventListener(eventType, val[eventType])
            });
          } else {
            el[key] = val;
          }
        });
      }
    } else if (typeof input == 'function') {
      this.recurse(parent, input(context), context);
    } else if (typeof input != 'undefined' && input != null){
      parent.innerHTML = input.toString();
    }
  }
}
