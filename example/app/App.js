var App = function (ctx) {
  var examples = Examples.map(function (example) {
    return ScriptRunner(ctx, {example: example});
  })
  return [
    {tag:'h1', render:'Verse'},
    {tag:'div', render: examples}
  ]
}
