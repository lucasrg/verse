#Verse
###Universal/isomorphic javascript template engine.

* Pure JavaScript
* Small footprint: 4kb minified (1.5kb gzipped)
* Reactive programming through `listen` and `trigger`

## Live example
https://lucasrg.github.io/verse/

##API

```js
// Render as string
var html = verse.render(options)

// Render in DOM
verse.render(options, document.body)
```

##Options
```js
{
  template: String, Object, Array or Function,
  context: Object,
  reconcile: Boolean
}
```

##Template option

| Key | Values | Description |
| --- | --- | --- |
| tag | String **Required** | supports any HTML tag |
| attribute | String or Function | supports any HTML attribute (id, name, href, src, etc) |
| class | String or Function | special case for class attribute |
| style | Object or Function | special case for style attribute |
| render | String, Array, Function or Object | generates children elements, any "template" format is accepted |
| listen | Array of Strings | re-renders element when triggered. caveat: only works for **render: function()** |
| events | Object | Same as Element.addEventListener('click',function(e){}) |
| events.render | Function | Special event called when DOM Element just rendered |

```js
{
  tag: 'div',
  class: 'css-class',
  style: {backgroundColor:'blue'},
  listen: ['trigger-name', 'other-trigger-name'],
  render: function(ctx) {
    return [{tag:'span', render: 'Hello'}, {tag:'b', render: ctx.name}]
  },
  events: {
    click: function(e) {},
    render: function(e) {}
  },
}
```

##Context option

For dynamic data, **Verse** uses a `context` object as data source and triggering changes:

```js
var context = {name: 'My name is'}
verse.render({
  template: function(ctx) {
    return {tag:'h1', listen:['my-trigger'], render: ctx.name}
  },
  context: context
}, rootElement)

context.name = 'Jonas';
context.trigger('my-trigger'); // This will re-render the H1 tag
```

#Some Examples

##Render a String
The good old "Hello World"

```js
verse.render({template: 'Hello World'}, document.body)
```

## Render an Element
HTML element <i>Hello World!</i>

```js
verse.render({
  template: {tag:'i', render:'Hello World!'}
}, document.body)
```

## Render an Array
List of HTML elements <i>Hello</i><b>World!</b>

```js
verse.render({
  template: [{tag:'i', render:'Hello '}, {tag:'b', render:'World!'}]
}, document.body)
```

## Render a Function
Function that returns a list of HTML elements <i>Hello</i><b>World!</b>

```js
verse.render({
  template: function () {
    return [{tag:'i', render:'Hello '}, {tag:'b', render:'World!'}]
  }
}, document.body)
```

## Passing a Context
Using a context object as data source: context.name

```js
verse.render({
  context: {name:'World!'},
  template: function (ctx) {
    return [{tag:'i', render:'Hello '}, {tag:'b', render:ctx.name}]
  }
}, document.body)
```

##Listen and Trigger
Re-render element using listen, events and context trigger

```js
verse.render({
  context: {name:'World!'},
  template: {
    tag:'div',
    listen:['trigger-name'],
    render: function(ctx) {
      return [
        {tag:'div', render: [{tag:'i', render:'Hello '}, {tag:'b', render:ctx.name}] },
        {tag:'button', render:'The World is not enough', events:{
          click: function(e) {
            ctx.name = 'Universe!!';
            ctx.trigger('trigger-name');
          }
        }}
      ]
    }
  }
}, document.body)
```

## Render Event
Mainly for third-party libs, the render event gives access to the DOM element when needed

```js
var context = {renderCount:1}
var template = function(ctx) {
  return [
    { tag:'div', listen:['trigger-name'], render: function (context) {
        return [{tag:'i', render:'Render count: '}, {tag:'b', render:context.renderCount}]
      },
      events: {
        render: function(e) {
          //This example uses jQuery
          $(e.target).animate({fontSize: "3em", height: "show"}, 1000)
        }
      }
    },
    {tag:'button', render:'Render again', events:{
      click: function(e) {
        ctx.renderCount++;
        ctx.trigger('trigger-name');
      }
    }}
  ]
}
verse.render({
  context: context,
  template: template
}, document.body)
```

## Components
Easy to refactor templates into components

```js
var BeatlesComponent = function(name) {
  return {tag:'li', render:name}
}
var context = {beatles:['John','Paul','George','Ringo']}
var template = {tag:'ul', render: function (ctx) {
    return ctx.beatles.map(BeatlesComponent)
  }
}
verse.render({
  context: context,
  template: template
}, document.body)
```

See https://github.com/lucasrg/verse/tree/master/example for a project example.


##Reconciliation

**Verse** also supports DOM reconciliation, to avoid re-rendering the page on first load.
It's critical that the `context` in both server and client have the same data.

```js
verse.render({
  template: ...,
  context: ...,
  reconcile: true
}, rootElement)
```


# That's all

See https://github.com/lucasrg/verse-boot/ for an universal bootstrap project
