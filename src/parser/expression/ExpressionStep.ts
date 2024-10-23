import { StepExpressionMatchError } from '../../errors/errors'
import type { Step } from '../models/step'
import { customExpressionRegEx } from './custom'
import {
    type ExpressionRegex,
    FloatRegex,
    ListRegex,
    NumberRegex,
    StringRegex,
} from './regexes'

export const builtInExpressionRegEx: ExpressionRegex<unknown>[] = [
    new StringRegex(),
    new NumberRegex(),
    new FloatRegex(),
    new ListRegex(),
]

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ExpressionStep {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    public static matchStep(step: Step, stepExpression: string): any[] {
        const allExpressionRegEx = builtInExpressionRegEx.concat(
            customExpressionRegEx,
        )

        let regexString = stepExpression
        const groupCount: {
            [key: string]: number
        } = {}

        for (const r of allExpressionRegEx) {
            groupCount[r.groupName] = 0
        }

        for (const r of allExpressionRegEx) {
            regexString = regexString.replace(r.keywordRegex, () => {
                groupCount[r.groupName] += 1

                return r.getRegex(groupCount[r.groupName])
            })
        }

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
                const matchRegex = allExpressionRegEx.find((r) =>
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
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            .map((r) => r!.value)

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
