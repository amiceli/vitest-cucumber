import { Feature } from "../parser/feature"
import { FeatureFileReader } from "../parser/readfile"

export async function loadFeatures (path: string): Promise<Readonly<Feature[]>> {
    const features = await FeatureFileReader
        .fromPath(path)
        .parseFile()

    return features
}

/**
 * @deprecated You can use it but multiple features in Gherkin file is not a good practice.
 */
export async function loadFeature (path: string): Promise<Readonly<Feature>> {
    const features = await loadFeatures(path)

    return features[0]
}