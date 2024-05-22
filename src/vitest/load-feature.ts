import { Feature } from "../parser/feature"
import { FeatureFileReader } from "../parser/readfile"
import callsites from 'callsites'
import { dirname } from 'path'
import fs from 'fs'

function getCallerPath (filePath : string): string | null {
    const list = callsites()

    return list.map((s) => {
        const callerFileName = s?.getFileName() || ``
        const callerFileDir = dirname(callerFileName)

        return callerFileDir
    }).find((s) => {
        return fs.existsSync(`${s}/${filePath}`)
    }) || null
}

/**
 * @deprecated You can use it but multiple features in Gherkin file is not a good practice.
 */
export async function loadFeatures (featureFilePath: string): Promise<Readonly<Feature[]>> {
    const callerFileDir = getCallerPath(featureFilePath)

    const features = await FeatureFileReader
        .fromPath(featureFilePath, callerFileDir)
        .parseFile()

    return features
}

export async function loadFeature (featureFilePath: string): Promise<Readonly<Feature>> {
    const callerFileDir = getCallerPath(featureFilePath)

    const [feature] = await FeatureFileReader
        .fromPath(featureFilePath, callerFileDir)
        .parseFile()

    return feature
}