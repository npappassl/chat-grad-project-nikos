var path = require('path');
var webpack = require('webpack');

module.exports = {
    // devServer: {
    //     inline: true,
    //     contentBase: './public/build',
    //     port: 8080,
    // },
    devtool: 'cheap-module-source-map',
    entry: './dev/js/index.js',
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    minified: false,
                    sourceMap: false,
                    presets: ["es2015", "stage-0", "react"],
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
        filename: 'bundle.js',
        path:  path.resolve(__dirname, "public/build"),
        publicPath: "/build/",
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
};
