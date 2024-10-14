import type { Feature } from '../parser/models/feature'
import { GherkinParser } from '../parser/parser'

export class FeatureContentReader {
    private readonly content: string[]

    private readonly parser: GherkinParser

    public static fromString(content: string[], lang: string = 'en') {
        return new FeatureContentReader(content, lang)
    }

    private constructor(content: string[], lang: string) {
        this.content = content
        this.parser = new GherkinParser({
            language: lang,
        })
    }

    public parseContent(): Feature {
        for (const line of this.content) {
            this.parser.addLine(line)
        }

        const feature = this.parser.finish().at(0)

        if (feature) {
            return feature
        }

        throw `No Feature`
    }
}
