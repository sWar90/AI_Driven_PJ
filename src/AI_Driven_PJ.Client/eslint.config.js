const angular = require('@angular-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');
const preferArrow = require('eslint-plugin-prefer-arrow');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    {
        ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.angular/**']
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: ['./tsconfig.app.json', './tsconfig.spec.json'],
                tsconfigRootDir: __dirname,
                sourceType: 'module'
            }
        },
        plugins: {
            '@angular-eslint': angular,
            '@typescript-eslint': tsPlugin,
            import: importPlugin,
            'prefer-arrow': preferArrow,
            prettier
        },
        rules: {
            ...prettierConfig.rules,
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'app',
                    style: 'kebab-case'
                }
            ],
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'app',
                    style: 'camelCase'
                }
            ],
            'padding-line-between-statements': [
                'error',
                {
                    blankLine: 'always',
                    prev: '*',
                    next: 'return'
                },
                {
                    blankLine: 'always',
                    prev: ['const', 'let', 'var'],
                    next: '*'
                },
                {
                    blankLine: 'any',
                    prev: ['const', 'let', 'var'],
                    next: ['const', 'let', 'var']
                }
            ],
            'prettier/prettier': 'error'
        }
    }
];
