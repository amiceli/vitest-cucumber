import { Feature } from "./feature"
import fs from 'fs'
import readline from 'readline'
import { GherkinParser } from "./parser"

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
        const fileStream = fs.createReadStream(this.path)
        const rl = readline.createInterface({
            input : fileStream,
            crlfDelay : Infinity,
        })

        rl.on(`line`, (line : string) => {
            this.parser.addLine(line)
        })

        return new Promise((resolve) => {
            rl.on(`close`, () => {
                resolve(this.parser.finish())
            })
        })

    }

}
