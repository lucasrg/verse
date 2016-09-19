var webpack = require('webpack');

module.exports = {
  entry: {
    library: './index'
  },
  output: {
    path: "./dist",
    filename: "verse.min.js",
    libraryTarget: 'window',
    library: 'verse'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      output: {comments: false},
      compress: {
        warnings: false,
        pure_funcs: [ 'console.log', 'console.dir' ],
        screw_ie8: true
      }
    })
  ]
};
