var superagent = require('superagent');

module.exports = function (context) {
  return {
    list: function () {
      context.stores.posts.loading = true;
      context.trigger('posts')
      superagent.get('/api/posts').end(function (err, res) {
        context.stores.posts.loading = false;
        context.stores.posts.items = res.body;
        context.trigger('posts')
      })
    },
    clear: function () {
      context.stores.posts.items = [];
      context.trigger('posts');
    }
  }
}
