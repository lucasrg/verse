
function testStaticHelloWorld() {
  var template = {
    tag: 'div', render: [
      {tag:'h1', render:'Hello World!'},
      {tag:'h2', render:'Hello Hello'}
    ]
  };

  var root = document.getElementById('sandbox');
  Client.render(root, template);
}


function testContextHelloWorld() {
  var helloWorldContext = {
    title: 'Hello World!',
    nested: { subtitle: 'Hi with context'},
    list: [1,2,3,4,5,'six','seven']
  }

  var template = function(context) {
    return {
      tag: 'div', render: [
        {tag:'h1', render:context.title},
        {tag:'h2', render:context.nested.subtitle},
        {tag:'ul', render: function (ctx) {
          return ctx.list.map(function (i) {
            return {tag:'li', render:i}
          })
        }}
      ]
    }
  }

  var root = document.getElementById('sandbox');
  Client.render(root, template, helloWorldContext);
}
