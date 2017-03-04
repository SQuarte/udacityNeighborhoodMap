var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    entry: [
        'webpack-dev-server/client?http://localhost:9000',
        'webpack/hot/only-dev-server',
        './src/index.js'
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.png$/,
            use: { loader: 'url-loader', options: { limit: 100000 } },
        }, {
            test: /\.jpg$/,
            use: ['file-loader']
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.html' }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: false,
            }
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        compress: true,
        inline: true,
        hot: true,
        port: 9000,
        publicPath: '/'
    }
};
