import { StepExpressionMatchError } from '../../errors/errors'
import type { Step } from '../models/step'
import { customExpressionRegEx } from './custom'
import {
    AnyRegex,
    BooleanRegex,
    CharRegex,
    CurrencyRegex,
    DateRegex,
    EmailRegex,
    type ExpressionRegex,
    IntRegex,
    ListRegex,
    NumberRegex,
    StringRegex,
    UrlRegex,
    WordRegex,
} from './regexes'

export const builtInExpressionRegEx: ExpressionRegex[] = [
    new BooleanRegex(),
    new WordRegex(),
    new CharRegex(),
    new StringRegex(),
    new EmailRegex(),
    new UrlRegex(),
    new IntRegex(),
    new NumberRegex(),
    new DateRegex(),
    new CurrencyRegex(),
    new ListRegex(),
    new AnyRegex(),
]

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ExpressionStep {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    public static matchStep(step: Step, stepExpression: string): any[] {
        // TODO use a feactory to have one ExpressionRegex by regex
        // TODO to remove used of index and resetExpressionStates for regex options like {list} with separator

        const allExpressionRegEx = builtInExpressionRegEx.concat(
            customExpressionRegEx,
        )

        let regexString = stepExpression
        const groupCount: {
            [key: string]: number
        } = {}

        // 💡 escape special characters
        // TODO : among [-\/\\^$*+?.()|[\]{}] which characters need to be escaped?
        regexString = regexString.replace(/[?]/g, `\\$&`)

        for (const r of allExpressionRegEx) {
            r.resetExpressionStates()
            groupCount[r.groupName] = 0
        }

        for (const r of allExpressionRegEx) {
            regexString = regexString.replace(
                r.keywordRegex,
                (originalRegex) => {
                    groupCount[r.groupName] += 1

                    return r.getRegex(groupCount[r.groupName], originalRegex)
                },
            )
        }

        // 💡 should match the full string
        regexString = `^${regexString}$`

        const regex = new RegExp(regexString, `g`)
        const matches = [
            ...step.details.matchAll(regex),
        ]

        const result = matches
            .filter((match) => match.groups !== undefined)
            .map((match) => {
                const res: Array<{
                    index: number
                    value: unknown
                }> = []

                // @ts-expect-error
                Object.keys(match.groups).forEach((key, index) => {
                    const matchRegex = allExpressionRegEx.find((r) =>
                        r.matchGroupName(key),
                    )
                    if (matchRegex) {
                        res.push({
                            index,
                            // biome-ignore lint/style/noNonNullAssertion: <explanation>
                            value: matchRegex.getValue(
                                match.groups?.[key],
                                index,
                            ),
                        })
                    } else {
                        res.push({
                            index,
                            // biome-ignore lint/style/noNonNullAssertion: <explanation>
                            value: new StringRegex().getValue(
                                match.groups?.[key],
                            ),
                        })
                    }
                })

                return res
            })

        const allValues = result
            .flat()
            .filter((t) => t !== undefined)
            .map((r) => r.value)

        const hasRegex = allExpressionRegEx.some((r) => {
            return stepExpression.includes(r.keyword)
        })

        if (hasRegex && allValues.length === 0) {
            throw new StepExpressionMatchError(step, stepExpression)
        }

        return allValues
    }

    public static stepContainsRegex(expression: string): boolean {
        const allExpressionRegEx = builtInExpressionRegEx.concat(
            customExpressionRegEx,
        )

        return allExpressionRegEx.some((r) => {
            return expression.includes(r.keyword)
        })
    }
}
