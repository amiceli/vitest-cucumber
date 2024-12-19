// import { FeatureFileNotFoundError } from '../errors/errors'
import type { Feature } from '../parser/models'
import { GherkinParser, type RequiredParserOptions } from '../parser/parser'

type FeatureFileReaderParams = {
    featureFilePath: string
    options: RequiredParserOptions
}

export class BrowserFeatureFileReader {
    private readonly path: string

    private readonly parser: GherkinParser

    // private readonly callerFileDir: string | null

    public static fromPath(params: FeatureFileReaderParams) {
        return new BrowserFeatureFileReader(params)
    }

    private constructor(params: FeatureFileReaderParams) {
        // this.callerFileDir = params.callerFileDir || null
        this.path = `/${params.featureFilePath}`
        // this.path = this.handleFeatureFilePath(params.featureFilePath)
        this.parser = new GherkinParser(params.options)
    }

    // private handleFeatureFilePath(featureFilePath: string): string {
    //     if (featureFilePath.match(/\.\/[\w-]+(\.[\w-]+)*$/)) {
    //         return `${this.callerFileDir}/${featureFilePath}`
    //     }

    //     return featureFilePath
    // }

    public async parseFile(): Promise<Feature[]> {
        try {
            const response = await fetch(this.path)
            const content = await response.text()

            for (const line of content.split('\n')) {
                this.parser.addLine(line)
            }

            return this.parser.finish()
        } catch (e) {
            console.error({
                e,
            })
            throw e
        }
    }
}
