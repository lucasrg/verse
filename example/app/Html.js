var App = require('./App.js')

module.exports = {
  tag: 'html', render: [
    {tag:'head', render: [
      {tag:'script', src: '/build/bundle.js'},
      {tag:'link', rel:'stylesheet', href: '/main.css'},
      {tag:'script', src: '/prism.js'},
      {tag:'link', rel:'stylesheet', href: '/prism.css'},
      {tag:'script', src:"https://code.jquery.com/jquery-2.2.3.min.js", integrity:"sha256-a23g1Nt4dtEYOj7bR+vTu7+T8VP13humZFBJNIYoEJo=", crossorigin:"anonymous"}
    ]},
    {tag:'body', render: {
      tag:'div', id:'app', render: App
    }}
  ]
};
