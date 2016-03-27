var App = require('./App.js')

module.exports = {
  tag: 'html', render: [
    {tag:'head', render: [
      {tag:'script', src: '/build/bundle.js'},
      {tag:'link', rel:'stylesheet', href: '/main.css'}
    ]},
    {tag:'body', render: {
      tag:'div', id:'app', render: App
    }}
  ]
};
