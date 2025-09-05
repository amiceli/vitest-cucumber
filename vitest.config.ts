import path from 'node:path'
import { defineConfig } from 'vitest/config'
// import { VitestCucumberPlugin } from './src/plugin'

// Uncomment to test VitestCucumberPlugin locally

export default defineConfig({
    plugins: [
        // VitestCucumberPlugin({
        //     featureFilesDir: 'src/__examples__/',
        //     specFilesDir: 'src/__examples__/',
        //     onDeleteAction: 'comment',
        //     formatCommand: 'npm run lint:fix',
        // }),
    ],
    test: {
        fileParallelism: false,
        setupFiles: [
            'vitest.setup.ts',
        ],
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
                'prebuild.js',
                'dist/',
            ],
        },
        exclude: [
            'examples/vue-example.spec.ts',
            'node_modules',
            'samples/*.spec.ts',
            'src/__tests__/**',
            'src/__examples__/*',
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
