var should = require('chai').should(),
    verse = require('../server/index.js');

describe('#Server', function() {
  it('render static hello world', function() {
    var template = {
      tag: 'html', render: [
        {tag:'head'},
        {tag:'body', render: {tag:'h1', render:'Hello World!'}}
      ]
    };
    verse.render(template).should.equal('<html><head></head><body><h1>Hello World!</h1></body></html>');
  });

  it('render context hello world', function() {
    var helloWorldContext = {
      title: 'Hello World?',
      nested: {subtitle: 'Hello Hello'}
    };
    var template = function(context) {
      return {
        tag: 'html', render: [
          {tag:'head'},
          {tag:'body', render: [
              {tag:'h1', className: 'title', render: function (ctx) {
                  return ctx.title
                }
              },
              {tag:'h2', render: context.nested.subtitle}
            ]
          }
        ]
      }
    };
    verse.render(template, helloWorldContext).should.equal('<html><head></head><body><h1 class="title">Hello World?</h1><h2>Hello Hello</h2></body></html>');
  });

  it('render components', function() {
    var HelloComponent = { tag: 'span', render: 'Hello' };
    var WorldComponent = function(props) {
      return { tag: 'span', render: props.name }
    }
    var HelloWorldComponent = function(context){
      return {tag:'h1', render: [ HelloComponent, WorldComponent({name: context.prefix}), WorldComponent({name: 'World'}) ]}
    }
    var helloWorldContext = {prefix: 'Big Old'};
    verse.render(HelloWorldComponent, helloWorldContext).should.equal('<h1><span>Hello</span><span>Big Old</span><span>World</span></h1>');
  });

});
