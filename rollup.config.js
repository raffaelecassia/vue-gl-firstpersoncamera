const deps = Object.keys(require('./package.json').dependencies)

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'build/index.js',
    format: 'es'
  },
  external: deps
}
