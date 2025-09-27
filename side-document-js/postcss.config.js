import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssExtendRule from 'postcss-extend-rule';


export default {
    plugins: [
        autoprefixer,
        cssnano({
            preset: 'default',
        }),
        postcssExtendRule()
    ]
};