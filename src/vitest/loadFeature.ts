import { FeatureFileReader } from "../parser/readfile"

export async function loadFeatures(path: string): Promise<Readonly<Feature[]>> {
    const features = await FeatureFileReader
        .fromPath(path)
        .parseFile()

    return features
}

export async function loadFeature(path: string): Promise<Readonly<Feature>> {
    const features = await loadFeatures(path)

    return features[0]
}