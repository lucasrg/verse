var PostActions = require('./actions/PostActions');

module.exports = {

  stores: {
    compiled: {},
    posts: {
      items: []
    }
  },

  actions: {
    posts: PostActions(this)
  }

}
