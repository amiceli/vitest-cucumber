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

export function VitestCucumberPlugin() {
    return {
        name: 'vitest-plugin-feature-watch',
        configureServer(server: ViteDevServer) {
            const featureDir = path.resolve(process.cwd(), 'src') // Remplacez 'src' par votre dossier de fichiers .feature

            fs.watch(featureDir, { recursive: true }, (eventType, filename) => {
                if (filename?.endsWith('.feature')) {
                    const realPath = `src/${filename}`
                    featureFileIsOk(realPath).then((res) => {
                        if (res) {
                            writeSpecFile(res, 'awesome.spec.ts', realPath)
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
