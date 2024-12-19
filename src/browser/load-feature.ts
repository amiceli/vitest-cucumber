import type { Feature } from '../parser/models'
import type { RequiredParserOptions } from '../parser/parser'
import { getVitestCucumberConfiguration } from '../vitest/configuration'
import { BrowserFeatureFileReader } from './readfile'

export async function loadFeature(
    featureFilePath: string,
    options?: RequiredParserOptions,
): Promise<Feature> {
    const [feature] = await BrowserFeatureFileReader.fromPath({
        featureFilePath,
        options: getVitestCucumberConfiguration(options),
    }).parseFile()

    return feature
}
