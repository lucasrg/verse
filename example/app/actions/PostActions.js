var superagent = require('superagent');

module.exports = {
  list: function (context) {
    superagent.get('/api/posts').end(function (err, res) {
      context.stores.Posts.state.items = res.body;
      context.stores.Posts.trigger()
    })
  }
}
