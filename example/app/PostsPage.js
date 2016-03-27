module.exports = function (context) {
  return [
    {tag:'h1', render:'Posts Example'},
    {tag:'div', listen:['posts'], render: function () {
      if (context.stores.posts.loading) {
        return {tag:'button', render: 'Loading...', disabled: true}
      } else if (context.stores.posts.items.length > 0) {
        return {tag:'button',
          render: 'Clear '+context.stores.posts.items.length+' posts',
          events: {
            'click': function () {
              context.actions.posts.clear();
            }
          }
        }
      } else {
        return {tag:'button',
          render: 'Load posts',
          events: {
            'click': function () {
              context.actions.posts.list();
            }
          }
        }
      }
    }},
    {tag:'ul', listen: ['posts'], render: function (context) {
      return context.stores.posts.items.map(function(item) {
        return {tag: 'li', render: item.title}
      })
    }}
  ]
}
