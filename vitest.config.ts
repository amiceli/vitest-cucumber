import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: ['vitest.setup.ts'],
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
                'dist/¨¨.',
            ],
        },
        exclude: [
            'examples/vue-example.spec.ts',
            'node_modules',
            'samples/*.spec.ts',
            'src/__tests__/**',
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
