
export interface ExpressionRegex {
    keyword : string
    keywordRegex : RegExp
    groupName : string

    getRegex (index : number) : string
}

export class StringRegex implements ExpressionRegex {

    public readonly keyword: string = `{string}`

    public readonly groupName: string  = `string`

    public readonly keywordRegex: RegExp = /{string}/g

    public getRegex (index : number) {
        return `(?<string${index}>"[^"]*"|'[^']*')`
    }

}

export class NumberRegex implements ExpressionRegex {

    public readonly keyword: string = `{number}`

    public readonly groupName: string  = `number`

    public readonly keywordRegex: RegExp = /{number}/g

    public getRegex (index : number) {
        return `(?<number${index}>\\$?\\d+(\\.\\d+)?)`
    }

}