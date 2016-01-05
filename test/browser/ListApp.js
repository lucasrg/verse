var ListActions = function(context) {
  return {
    add: function (item) {
      context.stores.List.items.push(item);
      context.trigger('items-changed');
    }
  }
}

var List = function (store) {
  return {
    tag: 'ul',
    className: 'list-component',
    listen: ['items-changed'],
    render: function (context) {
      return context.stores.List.items.map(function(item) {
        return {tag: 'li', render: item.name}
      })
    }
  }
}

var ListApp = function(context) {
  return {
    tag: 'div', render: [
      List(context.stores.List),
      {
        tag:'form',
        render: [
          {tag:'input', name:'name-field'},
          {tag:'input', type:'submit', value:'Add item'}
        ],
        events: {
          'submit': function (e) {
            e.preventDefault();
            var item = {
              name: e.target.elements['name-field'].value
            }
            console.log('On Submit', item);
            context.actions.List.add(item, context);
          }
        }
      }
    ]
  }
}

function listApp() {
  var context = verse.createContext();
  context.stores = {
    List: {
      items: []
    }
  }
  context.actions = {
    List: new ListActions(context)
  }
  Client.render(document.getElementById('sandbox'), ListApp, context);
}

window.onload = function () {
  listApp();
}
