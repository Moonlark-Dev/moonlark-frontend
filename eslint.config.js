import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

export default withVueTs(
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    js.configs.recommended,
    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,
    {
        name: 'moonlark/custom-rules',
        rules: {
            'vue/no-deprecated-slot-attribute': 'off',
            'vue/comment-directive': 'off',
            'no-return-assign': 'off',
            'eqeqeq': 'off',
            'semi': ['error', 'always'],
            'eol-last': ['error', 'always'],
            'max-params': 'off',
            'comma-spacing': ['error', { before: false, after: true }],
            '@typescript-eslint/no-unused-vars': 'warn'
        }
    }
);
