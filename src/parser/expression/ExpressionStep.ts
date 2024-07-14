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
                index: number, value: string | number
            }> = []

            if (!match.groups) {
                return
            }

            Object.keys(match.groups).forEach((key, index) => {
                if (key.startsWith(`string`)) {
                    res.push({
                        index,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        value : match.groups![key].replace(/^["']|["']$/g, ``),
                    })
                } else if (key.startsWith(`number`)) {
                    res.push({
                        index,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        value : parseInt(match.groups![key], 10),
                    })
                } else if (key.startsWith(`float`)) {
                    res.push({
                        index,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        value : parseFloat(match.groups![key]),
                    })
                } else {
                    res.push({
                        index,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        value : match.groups![key].replace(/^["']|["']$/g, ``),
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
