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
        }, {
            test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
            use: { loader: "url-loader", options: { limit: 10000, mimetype: 'application/font-woff' } }
        }, {
            test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
            use: { loader: "url-loader", options: { limit: 10000, mimetype: 'application/font-woff' } }
        }, {
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
            use: { loader: "url-loader", options: { limit: 10000, mimetype: 'application/octet-stream' } }
        }, {
            test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
            use: ['file-loader']
        }, {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            use: { loader: "url-loader", options: { limit: 10000, mimetype: 'image/svg+xml' } }

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
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        })
    ],
    devServer: {
        compress: false,
        inline: true,
        hot: true,
        watchContentBase: true,
        port: 9000,
        publicPath: '/'
    }
};
