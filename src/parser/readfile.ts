import fs from 'node:fs'
import readline from 'node:readline'
import { FeatureFileNotFoundError } from '../errors/errors'
import type { Feature } from './feature'
import { GherkinParser, type ParserOptions } from './parser'

type FeatureFileReaderParams = {
    featureFilePath: string
    callerFileDir?: string | null
    options?: ParserOptions
}

export class FeatureFileReader {
    private readonly path: string

    private readonly parser: GherkinParser

    private readonly callerFileDir: string | null

    public static fromPath(params: FeatureFileReaderParams) {
        return new FeatureFileReader(params)
    }

    private constructor(params: FeatureFileReaderParams) {
        this.callerFileDir = params.callerFileDir || null
        this.path = this.handleFeatureFilePath(params.featureFilePath)
        this.parser = new GherkinParser(params.options)
    }

    private handleFeatureFilePath(featureFilePath: string): string {
        if (featureFilePath.match(/\.\/[\w-]+(\.[\w-]+)*$/)) {
            return `${this.callerFileDir}/${featureFilePath}`
        }

        return featureFilePath
    }

    public async parseFile(): Promise<Feature[]> {
        if (!fs.existsSync(this.path)) {
            throw new FeatureFileNotFoundError(this.path).message
        }

        const fileStream = fs.createReadStream(this.path)

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Number.POSITIVE_INFINITY,
        })

        rl.on(`line`, (line: string) => {
            try {
                this.parser.addLine(line)
            } catch (e) {
                console.error(`Failed to parse line : `, e)
            }
        })

        return new Promise((resolve) => {
            rl.on(`close`, () => {
                resolve(this.parser.finish())
            })
        })
    }
}
