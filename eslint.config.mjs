import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends(
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/eslint-config-typescript",
    ),

    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "script",
    },

    rules: {
        "vue/no-deprecated-slot-attribute": "off",
        "vue/comment-directive": "off",
        "no-return-assign": "off",
        eqeqeq: "off",
        semi: ["error", "always"],
        "eol-last": ["error", "always"],
        "max-params": 0,

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],
    },
}]);