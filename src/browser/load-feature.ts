import callsites from 'callsites'
import { BrowserModeFeatureError } from '../errors/errors'
import type { Feature } from '../parser/models'
import type { RequiredParserOptions } from '../parser/parser'
import { getVitestCucumberConfiguration } from '../vitest/configuration'
import { BrowserFeatureFileReader } from './readfile'

function getCallerPath(): string | null {
    const { 2: callerFilePath } = callsites()
    const callerFileName = callerFilePath?.getFileName() || ``

    return callerFileName
}

function resolveFeatureUrl(specUrl: string, featureRelPath: string) {
    const url = new URL(specUrl)
    const path = decodeURIComponent(url.pathname) // /Users/.../src/...

    const markers = [
        // Most used folders I think
        '/src/',
        '/tests/',
    ]
    const marker = markers.find((m) => path.includes(m))

    if (marker) {
        const base = url.origin + path.slice(path.indexOf(marker))
        return new URL(featureRelPath, base).href
    }

    const dir = path.substring(0, path.lastIndexOf('/'))
    return `${url.origin}/@fs${dir}/${featureRelPath}`
}

export async function loadFeature(
    featureFilePath: string,
    options?: RequiredParserOptions,
): Promise<Feature> {
    const [feature] = await BrowserFeatureFileReader.fromPath({
        featureFilePath: featureFilePath.startsWith('/')
            ? featureFilePath
            : resolveFeatureUrl(getCallerPath() || '', featureFilePath),
        options: getVitestCucumberConfiguration(options),
    }).parseFile()

    if (!feature) {
        throw new BrowserModeFeatureError(featureFilePath)
    }

    return feature
}
