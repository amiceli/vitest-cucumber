import parsecurrency from 'parsecurrency'
import {
    InvalidCurrencyParameterError,
    InvalidDateParameterError,
    InvalidUrlParameterError,
} from '../../errors/errors'
import symbolToCode from './symbolToCode.json'

type CurrencySymbol = keyof typeof symbolToCode

type ExpressionRegexConstructor = {
    keyword: string
    keywordRegex: RegExp
    groupName: string
}

export abstract class ExpressionRegex<T = unknown, U = unknown> {
    public readonly keyword: string

    public readonly keywordRegex: RegExp

    public readonly groupName: string

    public constructor(options: ExpressionRegexConstructor) {
        this.keyword = options.keyword
        this.keywordRegex = options.keywordRegex
        this.groupName = options.groupName
    }

    public abstract getRegex(index: number, originalRegex: string): string

    public abstract getValue(str: string, index: number): T

    public matchGroupName(str: string): boolean {
        return str.startsWith(this.groupName)
    }

    public get cloneKeywordRegex() {
        return new RegExp(this.keywordRegex.source, this.keywordRegex.flags)
    }

    public resetExpressionStates() {}
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

export class UrlRegex extends ExpressionRegex<URL> {
    public constructor() {
        super({
            keyword: `{url}`,
            groupName: `url`,
            keywordRegex: /{url}/g,
        })
    }

    public getRegex(index: number) {
        const urlRegex = `(https?:\/\/)?([^\\s$.?#].[^\\s]*)`
        return `\\b(?<url${index}>${urlRegex})\\b`
    }

    public getValue(str: string): URL {
        try {
            return new URL(str)
        } catch {
            throw new InvalidUrlParameterError(str)
        }
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
        return `(?<int${index}>-?\\d+)`
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
        return `(?<number${index}>-?\\d+(\\.\\d+)?)`
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
        const isoDatetimeRegex = `(?:\\d{4})-(?:\\d{2})-(?:\\d{2})T(?:\\d{2}):(?:\\d{2}):(?:\\d{2}(?:\\.\\d*)?)(?:(?:[-|+](?:\\d{2}):(?:\\d{2})|Z)?)`

        const shortMonths = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ]
        const longMonths = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ]

        const shortOrLongMonthsRegex = shortMonths.concat(longMonths).join('|')

        const shortOrLongDateRegex = `\\d{1,2},? (:?${shortOrLongMonthsRegex}),? \\d{4}`
        const altShortOrLongDateRegex = `(:?${shortOrLongMonthsRegex}),? \\d{1,2},? \\d{4}`

        return `\\b(?<date${index}>(${dateRegex})|(${isoDateRegex})|(${isoDatetimeRegex})|(${shortOrLongDateRegex})|(${altShortOrLongDateRegex}))\\b`
    }

    public getValue(str: string): Date {
        const value = new Date(str)
        if (Number.isNaN(value.getTime())) {
            throw new InvalidDateParameterError(str)
        }

        return value
    }
}

export type Currency = {
    raw: string
    value: number
    currency: string
}

export class CurrencyRegex extends ExpressionRegex<Currency> {
    public constructor() {
        super({
            keyword: `{currency}`,
            groupName: `currency`,
            keywordRegex: /{currency}/g,
        })
    }

    public getRegex(index: number) {
        const currencyRegex = `(?:([-+]{1}) ?)?(?:([A-Z]{3}) ?)?(?:([^\\d ]+?) ?)?(((?:\\d{1,3}([,. ’'\\u00A0\\u202F]))*?\\d{1,})(([,.])\\d{1,2})?)(?: ?([^\\d]+?))??(?: ?([A-Z]{3}))?`
        return `(?<!\\S)(?<currency${index}>(${currencyRegex}))(?!\\S)`
    }

    public getValue(str: string): Currency {
        const value = parsecurrency(str)
        if (!value) {
            throw new InvalidCurrencyParameterError(str)
        }

        return {
            raw: value.raw,
            value: value.value,
            currency:
                value.currency || symbolToCode[value.symbol as CurrencySymbol],
        }
    }
}

type ListRegexOptions = { separator: string }

export class ListRegex extends ExpressionRegex<string[], ListRegexOptions> {
    public constructor() {
        super({
            keyword: `{list}`,
            groupName: `list`,
            keywordRegex: /{list(?::(["'])([^"']?)\1)?\}/g,
        })
    }

    private regexMatchSeparators: string[] = []

    public resetExpressionStates() {
        this.regexMatchSeparators = []
    }

    public getRegex(index: number, originalRegex: string) {
        const separator = this.cloneKeywordRegex.exec(originalRegex)
        const s = separator?.at(2) || ','

        this.regexMatchSeparators.push(s)

        return `(?<list${index}>[a-zA-Z]+(?:${s} ?[a-zA-Z]+)*)`
    }

    public getValue(str: string, index: number): string[] {
        return str.split(this.regexMatchSeparators[index]).map((t) => t.trim())
    }
}

export class AnyRegex extends ExpressionRegex<string> {
    public constructor() {
        super({
            keyword: `{any}`,
            groupName: `any`,
            keywordRegex: /{any}/g,
        })
    }

    public getRegex(index: number) {
        return `(?<any${index}>.+)`
    }

    public getValue(str: string): string {
        return str
    }
}
