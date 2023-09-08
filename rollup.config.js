import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'umd'
  },
  watch: true,
  plugins: [
          resolve(),
          commonjs(),
          livereload(),
          serve() 
  ],
  
};
