import { describe, expect, it } from 'vitest'
import { StepExpressionMatchError } from '../../../errors/errors'
import { Step, StepTypes } from '../../step'
import { ExpressionStep } from '../ExpressionStep'

describe(`ExpressionStep`, () => {
    it(`should match {string}`, () => {
        const step = new Step(StepTypes.GIVEN, `I love 'Vue'`)
        const params = ExpressionStep.matchStep(step, `I love {string}`)
        expect(params).toEqual([`Vue`])
    })

    it(`should match multiple {string}`, () => {
        const step = new Step(StepTypes.GIVEN, `I love 'Vue' for "web"`)
        const params = ExpressionStep.matchStep(
            step,
            `I love {string} for {string}`,
        )
        expect(params).toEqual([`Vue`, `web`])
    })

    it(`should match {number}`, () => {
        const step = new Step(StepTypes.GIVEN, `I love Vue 3`)
        const params = ExpressionStep.matchStep(step, `I love Vue {number}`)
        expect(params).toEqual([3])
    })

    it(`should match {float}`, () => {
        const step = new Step(StepTypes.GIVEN, `I love Vue 3.1`)
        const params = ExpressionStep.matchStep(step, `I love Vue {float}`)
        expect(params).toEqual([3.1])
    })

    it(`should match many {float}`, () => {
        const step = new Step(StepTypes.GIVEN, `I love Vue 3.1 or 3.2`)
        const params = ExpressionStep.matchStep(
            step,
            `I love Vue {float} or {float}`,
        )
        expect(params).toEqual([3.1, 3.2])
    })

    it(`should match {string} and {number}`, () => {
        const step = new Step(StepTypes.GIVEN, `I love "Vue" 3 and 12`)
        const params = ExpressionStep.matchStep(
            step,
            `I love {string} {number} and {number}`,
        )
        expect(params).toEqual([`Vue`, 3, 12])
    })

    it(`should detect wrong expression`, () => {
        const step = new Step(StepTypes.GIVEN, `I love "Vue" 3`)

        expect(() => {
            ExpressionStep.matchStep(step, `I love {number} 3`)
        }).toThrowError(new StepExpressionMatchError(step, `I love {number} 3`))
    })

    it(`should detect step without expression`, () => {
        const step = new Step(StepTypes.GIVEN, `I love "Vue" 3`)
        const params = ExpressionStep.matchStep(step, `I love "Vue" 3`)

        expect(params).toEqual([])
    })
})
