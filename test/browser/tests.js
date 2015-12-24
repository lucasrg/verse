
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
    list: [1,2,3,4,5,'six','seven'],
    image: 'http://www.keenthemes.com/preview/metronic/theme/assets/global/plugins/jcrop/demos/demo_files/image1.jpg'
  }

  var ListComponent = function(list) {
    return {tag:'ul', render: function () {
      return list.map(function (i) {
        return {tag:'li', render:i}
      })
    }}
  }

  var template = function(context) {
    return [
        {tag:'h1', render:context.title},
        {tag:'h2', render:context.nested.subtitle},
        ListComponent(context.list),
        {tag:'img', src:context.image}
      ]
  }

  var root = document.getElementById('sandbox');
  Client.render(root, template, helloWorldContext);
}

function testHead() {
  var title = 'TITLE CHANGED '+(new Date())+' - Universal Client Test';
  var template = [
    {tag:'title', render:title},
    {tag:'script', type:'text/javascript', src:'../../src/Client.js'},
    {tag:'script', type:'text/javascript', src:'browser.js'},
  ];
  Client.render(document.getElementsByTagName('head')[0], template);
  Client.render(document.getElementById('sandbox'), { tag:'h1', render:title});
}
