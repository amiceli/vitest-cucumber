import path from 'node:path'
import { defineConfig } from 'vitest/config'
import { VitestCucumberPlugin } from './src/plugin/index'

export default defineConfig({
    plugins: [
        VitestCucumberPlugin({
            specFilesDir: 'src/plugin/ast/',
            featureFilesDir: 'src/plugin/ast/',
        }),
    ],
    test: {
        passWithNoTests: true,
        globals: true,
        coverage: {
            provider: 'v8',
            exclude: [
                'src/module.ts',
                'vitest.config.ts',
                'commitlint.config.js',
                'src/vitest/types.ts',
                'scripts/cli-generate.ts',
                '**/__mocks__/*',
                '**/__tests__/*',
                'dist/',
            ],
        },
        exclude: [
            'examples/vue-example.spec.ts',
            'node_modules',
            'samples/*.spec.ts',
        ],
        typecheck: {
            tsconfig: 'tsconfig.vitest.json',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
