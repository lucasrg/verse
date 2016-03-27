var PostActions = require('./actions/PostActions');

module.exports = function(context) {

  context.stores = {
    compiled: {},
    posts: {
      items: []
    }
  }

  context.actions = {
    posts: PostActions(context)
  }

  return context;
}
