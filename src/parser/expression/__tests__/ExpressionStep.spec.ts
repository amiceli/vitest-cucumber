import { beforeEach, describe, expect, it } from 'vitest'
import {
    BuiltinParameterExpressionAlreadyExistsError,
    CustomParameterExpressionAlreadyExistsError,
    StepExpressionMatchError,
} from '../../../errors/errors'
import { Step, StepTypes } from '../../models/step'
import { ExpressionStep, builtInExpressionRegEx } from '../ExpressionStep'
import { customExpressionRegEx, defineParameterExpression } from '../custom'

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

    describe('Custom expression', () => {
        type Color = 'red' | 'blue' | 'yellow'

        beforeEach(() => {
            customExpressionRegEx.length = 0
        })

        const defineColorExpression = () => {
            defineParameterExpression({
                name: 'color',
                regexp: /red|blue|yellow/,
                transformer: (s) => s as Color,
            })
        }

        it('should define a custom parameter expression', () => {
            defineColorExpression()
        })

        describe('should fail to define a parameter expression if not unique', () => {
            it('should not have the same name as another custom expression', () => {
                defineColorExpression()

                expect(defineColorExpression).toThrowError(
                    new CustomParameterExpressionAlreadyExistsError('color'),
                )
            })

            for (const r of builtInExpressionRegEx) {
                it(`should not have the same name as built-in expression ${r.groupName}`, () => {
                    expect(() => {
                        defineParameterExpression({
                            name: r.groupName,
                            regexp: /red|blue|yellow/,
                            transformer: (s) => s as Color,
                        })
                    }).toThrowError(
                        new BuiltinParameterExpressionAlreadyExistsError(
                            r.groupName,
                        ),
                    )
                })
            }
        })

        it(`should match {color}`, () => {
            defineColorExpression()

            const step = new Step(StepTypes.GIVEN, `My favorite color is red`)
            const params = ExpressionStep.matchStep(
                step,
                `My favorite color is {color}`,
            )
            expect(params).toEqual([`red`])
        })

        it(`should match multiple {string}`, () => {
            defineColorExpression()

            const step = new Step(
                StepTypes.GIVEN,
                `The english flag has both red and blue colors`,
            )
            const params = ExpressionStep.matchStep(
                step,
                `The english flag has both {color} and {color} colors`,
            )
            expect(params).toEqual([`red`, `blue`])
        })

        it(`should fail to match {color} expression`, () => {
            defineColorExpression()

            const step = new Step(StepTypes.GIVEN, `My favorite color is green`)

            expect(() => {
                ExpressionStep.matchStep(step, `My favorite color is {color}`)
            }).toThrowError(
                new StepExpressionMatchError(
                    step,
                    `My favorite color is {color}`,
                ),
            )
        })
    })
})
