import path from 'path'
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            exclude : [
                'src/module.ts',
                '.eslintrc.js',
                'commitlint.config.js',
            ]
        },
        exclude : [
            'examples/vue-example.spec.ts',
            'node_modules',
        ]
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        },
    },
})