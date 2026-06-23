import { defineConfig } from 'tsdown'

export default defineConfig([
    {
        name: 'lib',
        entry: {
            module: 'src/module.ts',
            browser: 'src/browser/index.ts',
            plugin: 'src/plugin/index.ts',
            'load-feature': 'src/load-feature.ts',
        },
        format: 'esm',
        dts: true,
        clean: true,
        deps: {
            neverBundle: [
                'vite',
            ],
        },
    },
    {
        name: 'cli-generate',
        entry: {
            'cli-generate': 'scripts/cli.ts',
        },
        format: 'esm',
        dts: false,
    },
])
