import path from 'path';

const config = {
    mode: 'production',
    target: 'node',
    entry: './index.ts',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(import.meta.dirname, 'dist'),
        filename: 'bundle.cjs'
    },
    resolve: {
        extensions: ['.js', '.ts'],
        alias: {
            '@db': path.resolve(import.meta.dirname, 'src/db'),
            '@http_server': path.resolve(import.meta.dirname, 'src/http_server'),
            '@websocket_server': path.resolve(import.meta.dirname, 'src/websocket_server'),
            "@websocket_client_bot": path.resolve(import.meta.dirname, 'src/websocket_client_bot')
        },
        // Add support for TypeScripts fully qualified ESM imports
        extensionAlias: {
        ".js": [".js", ".ts"],
        ".cjs": [".cjs", ".cts"],
        ".mjs": [".mjs", ".mts"],
       },
    },     
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    stats: {
        colors: true
    },
    devtool: 'source-map',
};

export default config;
