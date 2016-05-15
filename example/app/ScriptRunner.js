var verse = require('verse/client')

function toScript(example) {
  var script = '';
  if (example.components) {
    script += example.components+'\n\n';
  }
  if (example.context) {
    script += 'var context = '+example.context+'\n';
  }
  script += "var template = "+example.template+'\n';

  script += "verse.render({\n";
  script += "  root: document.getElementById('"+example.id+"'),\n";
  if (example.context) {
    script += "  context: context,\n";
  }
  script += "  template: template\n";
  script += "})";
  return script;
}

module.exports = function (ctx, props) {
  props = props || {};
  var example = toScript(props.example);

  return {tag:'div', className:'example', render:[
    {tag:'h2', render: props.example.title},
    {tag:'h3', render: props.example.description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")},
    {tag:'div', className:'input', render:[
      {tag:'form', render:[
        {tag:'pre', render: {tag:'code', className:'language-js', render: example}},
        // {tag:'textarea', name:'input', rows: example.rows, cols: 120, value: toScript(example)},
        {tag:'button', render:'Run'}
      ], events:{
        submit: function (e) {
          e.preventDefault();
          // eval(e.target.elements['input'].value);
          eval(example);
        }
      }}
    ]},
    {tag:'div', id:props.example.id, className:'output'}
  ]}
}
