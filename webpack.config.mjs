import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename);

export default {
    devtool: 'source-map',
    entry: './src/index.mts',
    experiments: {
        outputModule: true
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.mts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        clean: true,
        library: {
            type: 'module'
        },
        module: true,
        filename: 'index.mjs',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.mts']
    }
};