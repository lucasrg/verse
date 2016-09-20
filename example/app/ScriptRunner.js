function toScript(example) {
  var script = '';
  if (example.components) {
    script += example.components+'\n\n';
  }
  script += "var root = document.getElementById('"+example.id+"')\n";
  if (example.context) {
    script += 'var context = '+example.context+'\n';
  }
  script += "var template = "+example.template+'\n';

  script += "verse.render({\n";
  if (example.context) {
    script += "  context: context,\n";
  }
  script += "  template: template\n";
  script += "}, root)";
  return script;
}

var ScriptRunner = function (ctx, props) {
  props = props || {};
  var example = toScript(props.example);

  return {tag:'div', className:'example', render:[
    {tag:'h2', render: props.example.title},
    {tag:'h3', render: props.example.description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")},
    {tag:'div', className:'input', render:[
      {tag:'form', render:[
        {tag:'pre', render: {tag:'code', className:'language-js', render: example}},
        {tag:'textarea', name:'input', rows: props.example.rows, cols: 120, render: example},
        {tag:'button', render:'Run'}
      ], events:{
        submit: function (e) {
          e.preventDefault();
          eval(e.target.elements['input'].value);
        }
      }}
    ]},
    {tag:'div', id:props.example.id, className:'output'}
  ]}
}
