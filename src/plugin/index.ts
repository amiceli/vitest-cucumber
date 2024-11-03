import fs from 'node:fs'
import path from 'node:path'
import type { ViteDevServer } from 'vite'
import { FeatureAst } from './feature-ast'

type VitestCucumberPluginOptions = {
    featureFilesDir: string
    specFilesDir: string
}

export function VitestCucumberPlugin(options: VitestCucumberPluginOptions) {
    return {
        name: 'vitest-cucumber-plugin',
        configureServer(server: ViteDevServer) {
            const featureDir = path.resolve(
                process.cwd(),
                options.featureFilesDir,
            )

            fs.watch(featureDir, { recursive: true }, (eventType, filename) => {
                if (filename?.endsWith('.feature')) {
                    const featureFilePath = `${options.featureFilesDir}${filename}`
                    const specFilePath = featureFilePath.replace(
                        '.feature',
                        '.spec.ts',
                    )

                    try {
                        FeatureAst.fromOptions({
                            featureFilePath,
                            specFilePath,
                        }).updateSpecFile()
                    } catch (e) {
                        console.error(e)
                    }

                    server.ws.send({
                        type: 'full-reload',
                        path: '*',
                    })
                }
            })
        },
    }
}