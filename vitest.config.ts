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
        // a scenario is several tests : mocks must survive between steps
        clearMocks: false,
        fileParallelism: false,
        setupFiles: [
            'vitest.setup.ts',
        ],
        passWithNoTests: true,
        globals: true,
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
