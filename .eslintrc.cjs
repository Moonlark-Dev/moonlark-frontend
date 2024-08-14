/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        'vue/no-deprecated-slot-attribute': 'off',
        'no-return-assign': 'off',
        'eqeqeq': 'off',
        'semi': ["error", "always"],
        'eol-last': ["error", "always"],
        'max-params': 0,
        'comma-spacing': ["error", {"before": false, "after": true}]
    }
};
