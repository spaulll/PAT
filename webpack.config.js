const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
        content: './src/content.js',
        background: './src/background.js'

    },
    devtool: 'source-map',
    target: 'web',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        fallback: {
            
            worker_threads: require.resolve('worker_threads'),
            crypto: require.resolve('crypto-browserify'),
        },
    },
    externals: [nodeExternals()], 
    mode: 'development',
    watch: true,
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{
                from: 'prop'
            }]
        })
    ]
};