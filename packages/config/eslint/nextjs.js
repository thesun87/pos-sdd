/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    './base.js',
    'next/core-web-vitals',
  ],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
