var Store = function (state) {
  this.state = state;
}
Store.prototype.trigger = function () {

}

var ListStore = new Store({
  items: []
});

var ListActions = {
  add: function (item) {
    ListStore.state.items.push(item);
    ListStore.trigger();
  }
}

var List = function (store) {
  return {
    tag: 'ul',
    className: 'list-component',
    listen: [store],
    render: function (context) {
      return store.state.items.map(function(item) {
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
        id: 'list-form',
        render: [
          {tag:'input', name:'name-field'},
          {tag:'input', type:'submit', render:'Add item'}
        ],
        events: {
          'submit': function (e) {
            e.preventDefault();
            var item = {
              name: e.target.elements['name-field'].value
            }
            console.log('On Submit', item);
            context.actions.List.add(item);
          }
        }
      }
    ]
  }
}

function listApp() {
  var context = {
    stores: {
      List: ListStore
    },
    actions: {
      List: ListActions
    }
  }
  Client.render(document.getElementById('sandbox'), ListApp, context);
}

window.onload = function () {
  listApp();
}
