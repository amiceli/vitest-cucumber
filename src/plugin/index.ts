import fs from 'node:fs'
import path from 'node:path'
import type { ViteDevServer } from 'vite'
import { writeSpecFile } from '../../scripts/generateFile'
import { FeatureFileReader } from '../parser/readfile'

async function featureFileIsOk(featureFilePath: string) {
    try {
        const [feature] = await FeatureFileReader.fromPath({
            featureFilePath,
            callerFileDir: null,
            options: { language: 'en' },
            // options: getVitestCucumberConfiguration(options),
        }).parseFile()

        return feature
    } catch (e) {
        return false
    }
}

type VitestCucumberPluginOptions = {
    featureFilesDir: string
    specFilesDir: string
}

export function VitestCucumberPlugin(options: VitestCucumberPluginOptions) {
    return {
        name: 'vitest-plugin-feature-watch',
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

                    featureFileIsOk(featureFilePath).then((feature) => {
                        if (feature) {
                            writeSpecFile({
                                feature,
                                featureFilePath,
                                specFilePath,
                            })
                        }
                    })

                    server.ws.send({
                        type: 'full-reload',
                        path: '*',
                    })
                }
            })
        },
    }
}
