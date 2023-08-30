import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

export default {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: resolve(_dirname, 'dist'),
  },
  devServer: {
    static: resolve(_dirname, 'dist'),
    port: 8080,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' })
  ],
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            // Adds CSS to the DOM by injecting a `<style>` tag
            loader: 'style-loader'
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader'
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: () => [
                  autoprefixer
                ]
              }
            }
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
};
