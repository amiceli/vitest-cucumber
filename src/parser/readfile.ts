import { Feature } from "./feature"
import fs from 'fs'
import readline from 'readline'
import { GherkinParser } from "./parser"
import { FeatureFileNotFoundError } from "../errors/errors"

export class FeatureFileReader {

    private readonly path: string

    private readonly parser: GherkinParser

    private readonly callerFilePath : string | null

    public static fromPath (path: string, callerFilePath : string | null = null) {
        return new FeatureFileReader(path, callerFilePath)
    }

    private constructor (path: string, callerFilePath : string | null) {
        this.callerFilePath = callerFilePath
        this.path = this.handleFeatureFilePath(path)
        this.parser = new GherkinParser()
    }

    private handleFeatureFilePath (featureFilePath : string) : string {
        if (featureFilePath.match(/\.\/[\w-]+(\.[\w-]+)*$/)) {
            return `${this.callerFilePath}/${featureFilePath}`
        }

        return featureFilePath
    }

    public async parseFile (): Promise<Feature[]> {
        if (!fs.existsSync(this.path)) {
            throw (new FeatureFileNotFoundError(this.path)).message
        }

        const fileStream = fs.createReadStream(this.path)

        const rl = readline.createInterface({
            input : fileStream,
            crlfDelay : Infinity,
        })

        return new Promise((resolve, reject) => {
            rl.on(`line`, (line : string) => {
                try {
                    this.parser.addLine(line)
                } catch (e) {
                    reject(e)
                }
            })

            rl.on(`close`, () => {
                resolve(this.parser.finish())
            })
        })

    }

}
