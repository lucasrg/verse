#Verse
###Universal (isomorphic) template engine.

* Pure JavaScript
* Small footprint: 4kb minified (1.5kb gzipped)
* "Reactive programming" through `listen` and `trigger`

##Template

```js
{
  tag: 'div',
  className: 'css-class',
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

| Key | Values | Description |
| --- | --- | --- |
| tag | String **Required** | supports any HTML tag |
| attribute | String or Function | supports any HTML attribute (id, name, href, src, etc) |
| className | String or Function | special case for class attribute |
| style | Object or Function | special case for style attribute |
| render | String, Array, Function or Object | generates children elements, any "template" format is accepted |
| listen | Array of Strings | re-renders element when triggered. caveat: only works for **render: function()** |
| events | Object | Same as Element.addEventListener('click',function(e){}) |
| events.render | Function | Special event called when DOM Element just rendered |


##Context

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
verse.render({
  template: 'Hello World!'
}, document.getElementById('body'))
```

## Render an Element
HTML element <i>Hello World!</i>

```js
verse.render({
  template: {tag:'i', render:'Hello World!'}
}, document.getElementById('body'))
```

## Render an Array
List of HTML elements <i>Hello</i><b>World!</b>

```js
verse.render({
  template: [{tag:'i', render:'Hello '}, {tag:'b', render:'World!'}]
}, document.getElementById('body'))
```

## Render a Function
Function that returns a list of HTML elements <i>Hello</i><b>World!</b>

```js
var template = function () {
  return [{tag:'i', render:'Hello '}, {tag:'b', render:'World!'}]
}
verse.render({
  template: template
}, document.getElementById('body'))
```

## Passing a Context
Using a context object as data source: context.name

```js
var context = {name:'World!'}
var template = function (context) {
  return [{tag:'i', render:'Hello '}, {tag:'b', render:context.name}]
}
verse.render({
  context: context,
  template: template
},document.getElementById('body'))
```

##Listen and Trigger
Re-render element using listen, events and context trigger

```js
var context = {name:'World!'}
var template = function(ctx) {
  return [
    {tag:'div', listen:['trigger-name'], render: function (context) {
      return [{tag:'i', render:'Hello '}, {tag:'b', render:context.name}]
    }},
    {tag:'button', render:'The World is not enough', events:{
      click: function(e) {
        ctx.name = 'Universe!!';
        ctx.trigger('trigger-name');
      }
    }}
  ]
}
verse.render({
  context: context,
  template: template
},document.getElementById('example6'))
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
}, document.getElementById('body'))
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
}, document.getElementById('body'))
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

Feel free to criticize, complain about YAJL (yet another js lib), ask questions, send Pull Requests or suggestions...
