module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    parserOptions: {
        project: './tsconfig.json'
    },
    extends: [
        '@amiceli/eslint-config-typescript'
    ],
    ignorePatterns: [
        "*.spec.ts",
    ],
    rules : {
        '@typescript-eslint/no-throw-literal' : 'off',
    }
}