import { Feature } from "../parser/feature"
import { GherkinParser } from "../parser/parser"

export class FeatureContentReader {

    private readonly content: string[]

    private readonly parser: GherkinParser

    public static fromString (content: string[]) {
        return new FeatureContentReader(content)
    }

    private constructor (content: string[]) {
        this.content = content
        this.parser = new GherkinParser()
    }

    public parseContent (): Feature {
        this.content.forEach((line) => {
            this.parser.addLine(line)
        })
        const feature = this.parser.finish().at(0)

        if (feature) {
            return feature
        }

        throw `No Feature`
    }

}