import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'graph-reselect',
    globals: ['reselect', 'immutable']
  },
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        "flow",
        [
          "env",
          {
            modules: false
          }
        ]
      ]
    })
  ],
  external: [
    'reselect',
    'immutable'
  ]
};
