import { describe, expect, it } from 'vitest'
import { NotAllowedBackgroundStepTypeError } from '../../errors/errors'
import { Background } from '../Background'
import { Step, StepTypes } from '../step'

describe(`Background`, () => {
    it(`should be initialized`, () => {
        const background = new Background()

        expect(background.isCalled).toBe(false)
        expect(background.steps.length).toBe(0)
    })

    it(`should be able to add And / Given steps`, () => {
        const background = new Background()

        background.addStep(new Step(StepTypes.GIVEN, `example`))
        background.addStep(new Step(StepTypes.AND, `example`))

        expect(background.steps.length).toBe(2)
    })

    it(`should prevent unallowed step type`, () => {
        const background = new Background()

        expect(() => {
            background.addStep(new Step(StepTypes.WHEN, `example`))
        }).toThrowError(new NotAllowedBackgroundStepTypeError(StepTypes.WHEN))
        expect(() => {
            background.addStep(new Step(StepTypes.THEN, `example`))
        }).toThrowError(new NotAllowedBackgroundStepTypeError(StepTypes.THEN))
        expect(() => {
            background.addStep(new Step(StepTypes.BUT, `example`))
        }).toThrowError(new NotAllowedBackgroundStepTypeError(StepTypes.BUT))
    })
})
