import { FeatureFileNotFoundError } from '../errors/errors'
import type { Feature } from '../parser/models'
import { GherkinParser, type RequiredParserOptions } from '../parser/parser'

type FeatureFileReaderParams = {
    featureFilePath: string
    options: RequiredParserOptions
}

export class BrowserFeatureFileReader {
    private readonly path: string

    private readonly parser: GherkinParser

    public static fromPath(params: FeatureFileReaderParams) {
        return new BrowserFeatureFileReader(params)
    }

    private constructor(params: FeatureFileReaderParams) {
        this.path = `${params.featureFilePath}`
        this.parser = new GherkinParser(params.options)
    }

    public async parseFile(): Promise<Feature[]> {
        try {
            const response = await fetch(this.path)
            const content = await response.text()

            for (const line of content.split('\n')) {
                this.parser.addLine(line)
            }

            return this.parser.finish()
        } catch (_e) {
            throw new FeatureFileNotFoundError(this.path)
        }
    }
}
