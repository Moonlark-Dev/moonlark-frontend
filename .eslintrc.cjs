// Companion config for Codacy (https://codacy.com): its cloud engine runs ESLint 8
// and only reads legacy `.eslintrc*` configs — `eslint.config.js` (flat config) is
// the source of truth for local dev / CI (npm run lint) and is what ESLint 9 uses.
// Rules here mirror eslint.config.js; keep them in sync when it changes.
module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2022: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-essential',
    ],
    overrides: [
        {
            files: ['*.vue'],
            parser: 'vue-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser',
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
    ],
    rules: {
        'vue/no-deprecated-slot-attribute': 'off',
        'vue/comment-directive': 'off',
        'no-return-assign': 'off',
        'eqeqeq': 'off',
        'semi': ['error', 'always'],
        'eol-last': ['error', 'always'],
        'max-params': 'off',
        'comma-spacing': ['error', { before: false, after: true }],
        '@typescript-eslint/no-unused-vars': 'warn',
    },
};
