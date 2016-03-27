var verse = require('verse/client')

function toScript(example) {
  var script = "var template = "+example.template;
  if (example.context) {
    var context = 'var context = '+example.context+';';
    var render = "\nvar target = document.getElementById('"+example.id+"')\nverse.render(target, template, context);";
    return context+'\n\n'+script+'\n'+render;
  } else {
    var render = "\nvar target = document.getElementById('"+example.id+"')\nverse.render(target, template);";
    return script+'\n'+render;
  }
}

module.exports = function (ctx, props) {
  props = props || {};
  var example = props.example;
  return {tag:'div', className:'example', render:[
    {tag:'h2', render: example.title},
    {tag:'h3', render: example.description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")},
    {tag:'div', className:'input', render:[
      {tag:'form', render:[
        {tag:'textarea', name:'input', rows: example.rows, cols: 80, value: toScript(example)},
        {tag:'button', render:'Run'}
      ], events:{
        submit: function (e) {
          e.preventDefault();
          eval(e.target.elements['input'].value);
        }
      }}
    ]},
    {tag:'div', id:example.id, className:'output'}
  ]}
}
