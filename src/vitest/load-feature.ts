import { dirname } from 'node:path'
import callsites from 'callsites'
import type { Feature } from '../parser/models/feature'
import { GherkinParser, type ParserOptions } from '../parser/parser'
import { FeatureFileReader } from '../parser/readfile'
import { getVitestCucumberConfiguration } from './configuration'

function getCallerPath(): string | null {
    const { 2: callerFilePath } = callsites()
    const callerFileName = callerFilePath?.getFileName() || ``
    const callerFileDir = dirname(callerFileName)

    return callerFileDir
}

export function loadFeatureFromText(
    featureContent: string,
    options?: ParserOptions,
): Feature {
    const parser = new GherkinParser(getVitestCucumberConfiguration(options))

    featureContent.split(/\r?\n|\r|\n/g).forEach((line) => {
        parser.addLine(line)
    })

    return parser.finish()[0]
}

export async function loadFeature(
    featureFilePath: string,
    options?: ParserOptions,
): Promise<Feature> {
    const callerFileDir = getCallerPath()

    const [feature] = await FeatureFileReader.fromPath({
        featureFilePath,
        callerFileDir,
        options: getVitestCucumberConfiguration(options),
    }).parseFile()

    return feature
}
