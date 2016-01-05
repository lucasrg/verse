var PostActions = require('./actions/PostActions');

module.exports = function(context) {
  context.stores = {
    posts: {
      items: []
    }
  }
  context.actions = {
    posts: PostActions(context)
  }

  return context;
}
