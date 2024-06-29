import path from 'path'
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
    test: {
        passWithNoTests : true,
        globals : true,
        coverage: {
            provider: 'v8',
            exclude : [
                'src/module.ts',
                '.eslintrc.js',
                'commitlint.config.js',
                'src/vitest/types.ts',
                'scripts/cli-generate.ts',
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