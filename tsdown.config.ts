import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: {
        module: 'src/module.ts',
        browser: 'src/browser/index.ts',
        plugin: 'src/plugin/index.ts',
    },
    format: 'esm',
    dts: true,
    clean: true,
    deps: {
        neverBundle: [
            'vite',
        ],
    },
})
