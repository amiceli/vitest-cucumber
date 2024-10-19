type ExpressionRegexConstructor = {
    keyword: string
    keywordRegex: RegExp
    groupName: string
}

export abstract class ExpressionRegex<T = unknown> {
    public readonly keyword: string

    public readonly keywordRegex: RegExp

    public readonly groupName: string

    public constructor(options: ExpressionRegexConstructor) {
        this.keyword = options.keyword
        this.keywordRegex = options.keywordRegex
        this.groupName = options.groupName
    }

    public abstract getRegex(index: number): string

    public abstract getValue(str: string): T

    public matchGroupName(str: string): boolean {
        return str.startsWith(this.groupName)
    }
}

export class BooleanRegex extends ExpressionRegex<boolean> {
    public constructor() {
        super({
            keyword: `{boolean}`,
            groupName: `boolean`,
            keywordRegex: /{boolean}/g,
        })
    }

    public getRegex(index: number) {
        return `\\b(?<boolean${index}>(true|false))\\b`
    }

    public getValue(str: string): boolean {
        return str === 'true'
    }
}

export class WordRegex extends ExpressionRegex<string> {
    public constructor() {
        super({
            keyword: `{word}`,
            groupName: `word`,
            keywordRegex: /{word}/g,
        })
    }

    public getRegex(index: number) {
        return `\\b(?<word${index}>\\w+)\\b`
    }

    public getValue(str: string): string {
        return str
    }
}

export class CharRegex extends ExpressionRegex<string> {
    public constructor() {
        super({
            keyword: `{char}`,
            groupName: `char`,
            keywordRegex: /{char}/g,
        })
    }

    public getRegex(index: number) {
        return `(?<char${index}>\\w)`
    }

    public getValue(str: string): string {
        return str
    }
}

export class StringRegex extends ExpressionRegex<string> {
    public constructor() {
        super({
            keyword: `{string}`,
            groupName: `string`,
            keywordRegex: /{string}/g,
        })
    }

    public getRegex(index: number) {
        return `(?<string${index}>"[^"]*"|'[^']*')`
    }

    public getValue(str: string): string {
        return str.replace(/^["']|["']$/g, ``)
    }
}

export class EmailRegex extends ExpressionRegex<string> {
    public constructor() {
        super({
            keyword: `{email}`,
            groupName: `email`,
            keywordRegex: /{email}/g,
        })
    }

    public getRegex(index: number) {
        const emailRegex = `[^\\s@]+@[^\\s@]+\\.[^\\s@]+`
        return `\\b(?<email${index}>${emailRegex})\\b`
    }

    public getValue(str: string): string {
        return str.replace(/^["']|["']$/g, ``)
    }
}

export class IntRegex extends ExpressionRegex<number> {
    public constructor() {
        super({
            keyword: `{int}`,
            groupName: `int`,
            keywordRegex: /{int}/g,
        })
    }

    public getRegex(index: number) {
        return `\\b(?<int${index}>\\d+)\\b`
    }

    public getValue(str: string): number {
        return Number(str)
    }
}

export class NumberRegex extends ExpressionRegex<number> {
    public constructor() {
        super({
            keyword: `{number}`,
            groupName: `number`,
            keywordRegex: /{number}/g,
        })
    }

    public getRegex(index: number) {
        return `\\b(?<number${index}>\\d+(\\.\\d+)?)\\b`
    }

    public getValue(str: string): number {
        return Number(str)
    }
}

export class DateRegex extends ExpressionRegex<Date> {
    public constructor() {
        super({
            keyword: `{date}`,
            groupName: `date`,
            keywordRegex: /{date}/g,
        })
    }

    public getRegex(index: number) {
        const dateRegex = `[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}(?: [0-9]{2}:[0-9]{2}:[0-9]{2})?`
        const isoDateRegex = `(?:\\d{4})-(?:\\d{2})-(?:\\d{2})`
        const isoDatetimeRegex = `(?:\\d{4})-(?:\\d{2})-(?:\\d{2})T(?:\\d{2}):(?:\\d{2}):(?:\\d{2}(?:\\.\\d*)?)(?:(?:-(?:\\d{2}):(?:\\d{2})|Z)?)`

        // TODO : handle more date formats

        return `\\b(?<date${index}>(${dateRegex})|(${isoDateRegex})|(${isoDatetimeRegex}))\\b`
    }

    public getValue(str: string): Date {
        return new Date(str)
    }
}

export class ListRegex extends ExpressionRegex<string[]> {
    public constructor() {
        super({
            keyword: `{list}`,
            groupName: `list`,
            keywordRegex: /{list}/g,
        })
    }

    public getRegex(index: number) {
        return `(?<list${index}>[a-zA-Z]+(?:, ?[a-zA-Z]+)*)`
    }

    public getValue(str: string): string[] {
        return str.split(`,`).map((t) => t.trim())
    }
}
