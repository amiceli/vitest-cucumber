import { Feature } from "./feature"
import fs from 'fs'
import readline from 'readline'
import { GherkinParser } from "./parser"
import { FeatureFileNotFoundError } from "../errors/errors"

export class FeatureFileReader {

    private readonly path: string

    private readonly parser: GherkinParser

    public static fromPath (path: string) {
        return new FeatureFileReader(path)
    }

    private constructor (path: string) {
        this.path = path
        this.parser = new GherkinParser()
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

        rl.on(`line`, (line : string) => {
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
