import path from 'path'
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
    test: {
        globals : true,
        coverage: {
            provider: 'v8',
            exclude : [
                'src/module.ts',
                '.eslintrc.js',
                'commitlint.config.js',
                'src/vitest/types.ts',
            ]
        },
        exclude : [
            'examples/vue-example.spec.ts',
            'node_modules',
        ],
        typecheck : {
            tsconfig : 'tsconfig.vitest.json',
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        },
    },
})