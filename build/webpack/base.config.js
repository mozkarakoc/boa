import webpack from 'webpack';
import yargs from 'yargs';

export const options = yargs
  .alias('p', 'optimize-minimize')
  .alias('d', 'debug')
  .argv;

const baseConfig = {
  entry: undefined,
  output: undefined,
  externals: undefined,
  module: { 
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: { 
              babelrc: false,
              presets: ['es2015', 'stage-0', 'react'],
              plugins: [require('babel-plugin-transform-decorators-legacy').default]
            }

          }

        ]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        }, {
          loader: 'css-loader' // translates CSS into CommonJS
        }, {
          loader: 'sass-loader' // compiles Sass to CSS
        }]
      },
      {
        test: /\.(eot|svg|jpe?g|png|gif|ttf|woff2?)$/,
        use: 'url-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV':  JSON.stringify('production') 
      }
    })
  ]
};

if (options.optimizeMinimize) {
  baseConfig.devtool = 'source-map';
}

export default baseConfig;