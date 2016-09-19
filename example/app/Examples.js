var Examples = [
  {
    id: 'example1',
    title: 'Example #1 - String',
    description: 'Render the good old "Hello World"',
    rows: 5,
    template: "'Hello World!'"
  },
  {
    id: 'example2',
    title: 'Example #2 - Element',
    description: 'Render an HTML element <i>Hello World!</i>',
    rows: 5,
    template: "{tag:'i', render:'Hello World!'}"
  },
  {
    id: 'example3',
    title: 'Example #3 - Array',
    description: 'Render a list of HTML elements <i>Hello</i><b>World!</b>',
    rows: 5,
    template: "[{tag:'i', render:'Hello '}, {tag:'b', render:'World!'}]"
  },
  {
    id: 'example4',
    title: 'Example #4 - Function',
    description: 'Function that renders a list of HTML elements <i>Hello</i><b>World!</b>',
    rows: 7,
    template:
"function () {\n\
  return [{tag:'i', render:'Hello '}, {tag:'b', render:'World!'}]\n\
}"
  },
  {
    id: 'example5',
    title: 'Example #5 - Context',
    description: 'Render using a context as source of data: context.name',
    context: "{name:'World!'}",
    rows: 10,
    template:
"function (context) {\n\
  return [{tag:'i', render:'Hello '}, {tag:'b', render:context.name}]\n\
}"
  },
  {
    id: 'example6',
    title: 'Example #6 - Listen and Trigger',
    description: 'Re-render element using listen, events and context trigger',
    context: "{name:'World!'}",
    rows: 20,
    template:
"function(ctx) {\n\
  return [\n\
    {tag:'div', listen:['trigger-name'], render: function (context) {\n\
      return [{tag:'i', render:'Hello '}, {tag:'b', render:context.name}]\n\
    }},\n\
    {tag:'button', render:'The World is not enough', events:{\n\
      click: function(e) {\n\
        ctx.name = 'Universe!!';\n\
        ctx.trigger('trigger-name');\n\
      }\n\
    }}\n\
  ]\n\
}"
  },
  {
    id: 'example7',
    title: 'Example #7 - Render Event',
    description: 'Good for third-party addons, the render event gives access to the DOM element when needed',
    context: "{renderCount:1}",
    rows: 25,
    template:
"function(ctx) {\n\
  return [\n\
    { tag:'div', listen:['trigger-name'], render: function (context) {\n\
        return [{tag:'i', render:'Render count: '}, {tag:'b', render:context.renderCount}]\n\
      },\n\
      events: {\n\
        render: function(e) {\n\
          $(e.target).animate({fontSize: \"3em\", height: \"show\"}, 1000)\n\
        }\n\
      }\n\
    },\n\
    {tag:'button', render:'Render again', events:{\n\
      click: function(e) {\n\
        ctx.renderCount++;\n\
        ctx.trigger('trigger-name');\n\
      }\n\
    }}\n\
  ]\n\
}"
  },
  {
    id: 'example8',
    title: 'Example #8 - Components',
    description: 'Quite easy to create a component',
    context: "{beatles:['John','Paul','George','Ringo']}",
    rows: 15,
    components:
"var BeatlesComponent = function(name) {\n\
  return {tag:'li', render:name}\n\
}",
    template:
"{tag:'ul', render: function (ctx) {\n\
    return ctx.beatles.map(BeatlesComponent)\n\
  }\n\
}"
  }
]
