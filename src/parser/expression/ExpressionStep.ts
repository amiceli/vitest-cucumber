import { StepExpressionMatchError } from '../../errors/errors'
import type { Step } from '../models/step'
import {
    BooleanRegex,
    CharRegex,
    DateRegex,
    EmailRegex,
    type ExpressionRegex,
    IntRegex,
    ListRegex,
    NumberRegex,
    StringRegex,
    WordRegex,
} from './regexes'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ExpressionStep {
    public static readonly expressionRegEx: ExpressionRegex[] = [
        new BooleanRegex(),
        new WordRegex(),
        new CharRegex(),
        new StringRegex(),
        new EmailRegex(),
        new IntRegex(),
        new NumberRegex(),
        new DateRegex(),
        new ListRegex(),
    ]

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    public static matchStep(step: Step, stepExpression: string): any[] {
        let regexString = stepExpression
        const groupCount: {
            [key: string]: number
        } = {}

        // 💡 escape special characters
        // TODO : among [-\/\\^$*+?.()|[\]{}] which characters need to be escaped?
        regexString = regexString.replace(/[?]/g, `\\$&`)

        for (const r of ExpressionStep.expressionRegEx) {
            groupCount[r.groupName] = 0
        }

        for (const r of ExpressionStep.expressionRegEx) {
            regexString = regexString.replace(r.keywordRegex, () => {
                groupCount[r.groupName] += 1

                return r.getRegex(groupCount[r.groupName])
            })
        }

        // 💡 should match the full string
        regexString = `^${regexString}$`

        const regex = new RegExp(regexString, `g`)
        const matches = [...step.details.matchAll(regex)]

        const result = matches.map((match) => {
            const res: Array<{
                index: number
                value: unknown
            }> = []

            if (!match.groups) {
                return
            }

            Object.keys(match.groups).forEach((key, index) => {
                const matchRegex = ExpressionStep.expressionRegEx.find((r) =>
                    r.matchGroupName(key),
                )
                if (matchRegex) {
                    res.push({
                        index,
                        // biome-ignore lint/style/noNonNullAssertion: <explanation>
                        value: matchRegex.getValue(match.groups![key]),
                    })
                } else {
                    res.push({
                        index,
                        // biome-ignore lint/style/noNonNullAssertion: <explanation>
                        value: new StringRegex().getValue(match.groups![key]),
                    })
                }
            })

            return res
        })

        const allValues = result
            .flat()
            .filter((t) => t !== undefined)
            .map((r) => r.value)

        const hasRegex = ExpressionStep.expressionRegEx.some((r) => {
            return stepExpression.includes(r.keyword)
        })

        if (hasRegex && allValues.length === 0) {
            throw new StepExpressionMatchError(step, stepExpression)
        }

        return allValues
    }

    public static stepContainsRegex(expression: string): boolean {
        return ExpressionStep.expressionRegEx.some((r) => {
            return expression.includes(r.keyword)
        })
    }
}
