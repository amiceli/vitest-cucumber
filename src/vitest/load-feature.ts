import { Feature } from "../parser/feature"
import { FeatureFileReader } from "../parser/readfile"
import callsites from 'callsites'
import { dirname } from 'path'

/**
 * @deprecated You can use it but multiple features in Gherkin file is not a good practice.
 */
export async function loadFeatures (featureFilePath: string): Promise<Readonly<Feature[]>> {
    const features = await FeatureFileReader
        .fromPath(featureFilePath)
        .parseFile()

    return features
}

export async function loadFeature (featureFilePath: string): Promise<Readonly<Feature>> {
    const [, callerFilePath] = callsites()
    const callerFileName = callerFilePath?.getFileName() || ``
    const callerFileDir = dirname(callerFileName)

    const [feature] = await FeatureFileReader
        .fromPath(featureFilePath, callerFileDir)
        .parseFile()

    return feature
}