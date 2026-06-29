module.exports = {
  plugins: [
    // 解决 @base-org/account 用 import attributes (import ... with { type: 'json' })
    // CRA 5 会读取根 babel.config.js
    require.resolve('@babel/plugin-syntax-import-attributes'),
  ],
};
