type ExpressionRegexConstructor = {
    keyword : string
    keywordRegex : RegExp
    groupName : string
}

export abstract class ExpressionRegex<T = unknown> {

    public readonly keyword : string

    public readonly keywordRegex : RegExp

    public readonly groupName : string

    public constructor (options : ExpressionRegexConstructor) {
        this.keyword = options.keyword
        this.keywordRegex = options.keywordRegex
        this.groupName = options.groupName
    }

    public abstract getRegex (index : number) : string

    public abstract getValue (str : string) : T
    
    public matchGroupName (str: string): boolean {
        return str.startsWith(this.groupName)
    }

}

export class StringRegex extends ExpressionRegex<string> {

    public constructor () {
        super({
            keyword : `{string}`,
            groupName : `string`,
            keywordRegex : /{string}/g,
        })
    }

    public getRegex (index : number) {
        return `(?<string${index}>"[^"]*"|'[^']*')`
    }

    public getValue (str: string): string {
        return str.replace(/^["']|["']$/g, ``)
    }

}

export class NumberRegex extends ExpressionRegex<number> {

    public constructor () {
        super({
            keyword : `{number}`,
            groupName : `number`,
            keywordRegex : /{number}/g,
        })
    }

    public getRegex (index : number) {
        return `(?<number${index}>\\$?\\d+(\\.\\d+)?)`
    }

    public getValue (str: string): number {
        if (str.startsWith(`$`)) {
            return parseInt(str.replace(`$`, ``), 10)
        }

        return parseInt(str, 10)
    }

}

export class FloatRegex extends ExpressionRegex<number> {

    public constructor () {
        super({
            keyword : `{float}`,
            groupName : `float`,
            keywordRegex : /{float}/g,
        })
    }

    public getRegex (index : number) {
        return `\\b(?<float${index}>\\d+\\.\\d+)\\b`
    }

    public getValue (str: string): number {
        return parseFloat(str)
    }

}

export class ListRegex extends ExpressionRegex<string[]> {

    public constructor () {
        super({
            keyword : `{list}`,
            groupName : `list`,
            keywordRegex : /{list}/g,
        })
    }

    public getRegex (index : number) {
        return `(?<list${index}>[a-zA-Z]+(?:, ?[a-zA-Z]+)*)`
    }

    public getValue (str: string): string[] {
        return str.split(`,`).map((t) => t.trim())
    }

}