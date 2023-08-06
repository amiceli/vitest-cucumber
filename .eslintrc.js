module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    parserOptions: {
        project: './tsconfig.eslint.json'
    },
    extends: [
        '@amiceli/eslint-config-typescript'
    ],
    ignorePatterns : [
        "**/*.feature"
    ],
    rules: {
        '@typescript-eslint/no-throw-literal': 'off',
        "object-curly-newline": ["error", {
            "ObjectExpression": { "multiline": true, "minProperties": 3 },
            "ObjectPattern": { "multiline": true },
            "ImportDeclaration": { "multiline": true, "minProperties": 3 },
            "ExportDeclaration": { "multiline": true, "minProperties": 3 }
        }]
    }
}