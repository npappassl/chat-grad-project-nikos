var path = require('path');
var webpack = require('webpack');

module.exports = {
    devServer: {
        inline: true,
        contentBase: './public',
        port: 8080,
    },
    devtool: 'cheap-module-eval-source-map',
    entry: './dev/js/index.js',
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ["es2015", "stage-0", "react"]
                },
                exclude: /node_modules/
            },
            {
                test: /\.scss/,
                loader: 'style-loader!css-loader!sass-loader'
            }
        ]
    },
    output: {
        filename: 'bundle.min.js',
        path:  path.resolve(__dirname, "build"),
        publicPath: "/",
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
};