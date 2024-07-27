import { StepExpressionMatchError } from "../../errors/errors"
import { Step } from "../step"
import {
    ExpressionRegex, FloatRegex, NumberRegex, StringRegex,
} from "./regexes"

export class ExpressionStep {

    public static readonly expressionRegEx : ExpressionRegex[] = [
        new StringRegex(),
        new NumberRegex(),
        new FloatRegex(),
    ]

    // todo matcg {number} with $ and/or .
    public static matchStep (step: Step, stepExpression: string): any[] {
        let regexString = stepExpression
        const groupCount: {
            [key: string]: number
        } = {}

        this.expressionRegEx.forEach((r) => {
            groupCount[r.groupName] = 0
        })

        this.expressionRegEx.forEach((r) => {
            regexString = regexString.replace(r.keywordRegex, () => {
                groupCount[r.groupName] += 1

                return r.getRegex(groupCount[r.groupName])
            })
        })

        const regex = new RegExp(regexString, `g`)
        const matches = [...step.details.matchAll(regex)]

        const result = matches.map(match => {
            const res: Array<{
                index: number, value: unknown
            }> = []

            if (!match.groups) {
                return
            }

            Object.keys(match.groups).forEach((key, index) => {
                const matchRegex = this.expressionRegEx.find(
                    (r) => r.matchGroupName(key),
                )
                if (matchRegex) {
                    res.push({
                        index,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        value : matchRegex.getValue(match.groups![key]),
                    })
                } else {
                    res.push({
                        index,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        value : (new StringRegex()).getValue(match.groups![key]),
                    })
                }
            })

            return res
        })

        const allValues = result
            .flat()
            .filter((t) => t !== undefined)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map((r) => r!.value)

        const hasRegex = this.expressionRegEx.some((r) => {
            return stepExpression.includes(r.keyword)
        })

        if (hasRegex && allValues.length === 0) {
            throw new StepExpressionMatchError(step, stepExpression)
        }

        return allValues
    }

    public static stepContainsRegex (expression : string) : boolean {
        return ExpressionStep.expressionRegEx.some((r) => {
            return expression.includes(r.keyword)
        })
    }

}
