import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


export default {
  input: 'src/main.js',
  output: {
    dir: 'bundle',
    format: 'umd'
  },
  plugins: [
          resolve(),
          commonjs() 
  ],
  
};
