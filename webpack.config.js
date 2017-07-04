let path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: ['angularjs-annotate']
          }
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'src')
  }
}
