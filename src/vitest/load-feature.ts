import { dirname } from 'node:path'
import callsites from 'callsites'
import type { Feature } from '../parser/models/feature'
import type { ParserOptions } from '../parser/parser'
import { FeatureFileReader } from '../parser/readfile'

function getCallerPath(): string | null {
    const { 2: callerFilePath } = callsites()
    const callerFileName = callerFilePath?.getFileName() || ``
    const callerFileDir = dirname(callerFileName)

    return callerFileDir
}

export async function loadFeature(
    featureFilePath: string,
    options?: ParserOptions,
): Promise<Feature> {
    const callerFileDir = getCallerPath()

    const [feature] = await FeatureFileReader.fromPath({
        featureFilePath,
        callerFileDir,
        options,
    }).parseFile()

    return feature
}
