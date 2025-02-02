import { type Mock, beforeAll, describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import { Scenario, Step, StepTypes } from '../../../parser/models'
import { defineSteps, resetDefinedSteps } from '../../configuration'
import { describeFeature } from '../../describe-feature'
import {
    defineSharedStep,
    defineStepToTest,
    orderStepsToRun,
    updatePredefinedStepsAccordingLevel,
} from '../../describe/define-step-test'
import type { ScenarioSteps } from '../../describe/types'

describe('defineSteps order', () => {
    beforeAll(() => {
        resetDefinedSteps()
    })

    const feature = FeatureContentReader.fromString([
        `Feature: defineSteps order`,
        `   Rule: defineSteps`,
        `       Scenario: first scenario`,
        `           Given I have predefined step globally`,
        `           And   I have predefined step in feature`,
        `           And   I have predefined step in rule`,
        `           When  I run unit tests`,
        `           Then  My step are called`,
        `           And   Rule steps override feature steps`,
        `           And   Feature steps override globally steps`,
        ``,
    ]).parseContent()

    const handleStepCallOrder = vi.fn()

    defineSteps(({ Given, And }) => {
        Given('I have predefined step globally', () => {
            expect(handleStepCallOrder).not.toHaveBeenCalled()
        })
        And('Feature steps override globally steps', () => {
            expect.fail('step is defined in feature, should be ignored')
        })
    })

    describeFeature(feature, (f) => {
        f.defineSteps(({ And, Then }) => {
            And('I have predefined step in feature', () => {
                handleStepCallOrder()
            })
            And('Feature steps override globally steps', () => {
                expect(handleStepCallOrder).toHaveBeenCalledTimes(5)
                handleStepCallOrder()
            })
            And('Rule steps override feature steps', () => {
                expect.fail('step is defined in rule, should be ignored')
            })
            Then('My step are called', () => {
                expect.fail('step is defined in scenario, should be ignored')
            })
        })

        f.Rule('defineSteps', (r) => {
            r.defineSteps(({ And }) => {
                And('I have predefined step in rule', () => {
                    expect(handleStepCallOrder).toHaveBeenCalledTimes(1)
                    handleStepCallOrder()
                })
                And('Rule steps override feature steps', () => {
                    expect(handleStepCallOrder).toHaveBeenCalledTimes(4)
                    handleStepCallOrder()
                })
            })
            r.RuleScenario('first scenario', (s) => {
                s.When('I run unit tests', () => {
                    expect(handleStepCallOrder).toHaveBeenCalledTimes(2)
                    handleStepCallOrder()
                })
                s.Then('My step are called', () => {
                    expect(handleStepCallOrder).toHaveBeenCalledTimes(3)
                    handleStepCallOrder()
                })
            })
        })
    })
})

describe('defineSteps order with background', () => {
    beforeAll(() => {
        resetDefinedSteps()
    })

    const feature = FeatureContentReader.fromString([
        `Feature: defineSteps order`,
        `   Background:`,
        `       Given I use background`,
        `       And   I use ScenarioOutline`,
        `       And   I use Rule`,
        `   Scenario Outline: outline`,
        `       Given I use outline`,
        `       Then  I use variable <name>`,
        `       Examples:`,
        `           | name |`,
        `           | test |`,
        `           | boom |`,
        ``,
    ]).parseContent()

    let backgroundCalled = 0

    defineSteps(({ Given, And }) => {
        Given('I use background', () => {
            backgroundCalled = 1
        })
    })

    defineSteps(({ Given }) => {
        Given('I use outline', () => {
            expect.fail('should not be called')
        })
    })

    describeFeature(feature, (f) => {
        f.defineSteps(({ Given }) => {
            Given('I use outline', () => {})
        })
        f.Background((b) => {
            b.And('I use Rule', () => {
                expect(backgroundCalled).toEqual(2)
            })
            b.And('I use ScenarioOutline', () => {
                expect(backgroundCalled).toEqual(1)
                backgroundCalled += 1
            })
        })
        f.ScenarioOutline('outline', (s, variables) => {
            s.Then('I use variable <name>', () => {
                expect(['test', 'boom']).toContain(variables.name)
            })
        })
    })
})

describe('Handle duplicated predefined steps', () => {
    const result = updatePredefinedStepsAccordingLevel({
        globallyPredefinedSteps: [
            defineSharedStep(
                StepTypes.GIVEN,
                'given',
                vi.fn().mockName('global given'),
            ),
            defineSharedStep(
                StepTypes.WHEN,
                'when',
                vi.fn().mockName('global when'),
            ),
        ],
        featurePredefinedSteps: [
            defineSharedStep(
                StepTypes.GIVEN,
                'given',
                vi.fn().mockName('given feature'),
            ),
            defineSharedStep(
                StepTypes.AND,
                'and',
                vi.fn().mockName('and feature'),
            ),
        ],
        rulePredefinedSteps: [
            defineSharedStep(
                StepTypes.AND,
                'and',
                vi.fn().mockName('and rule'),
            ),
        ],
    })
    expect(result.map((r) => (r.fn as Mock).getMockName())).toEqual([
        'and rule',
        'given feature',
        'global when',
    ])
})

describe('order steps', () => {
    const scenario = new Scenario('test')
    scenario.addStep(new Step(StepTypes.GIVEN, 'given'))
    scenario.addStep(new Step(StepTypes.WHEN, 'when'))
    scenario.addStep(new Step(StepTypes.THEN, 'then'))

    const stepsToRun: ScenarioSteps[] = []

    stepsToRun.push(
        defineStepToTest({
            parent: scenario,
            stepDetails: 'then',
            stepType: StepTypes.THEN,
            scenarioStepCallback: vi.fn(),
        }),
        defineStepToTest({
            parent: scenario,
            stepDetails: 'given',
            stepType: StepTypes.GIVEN,
            scenarioStepCallback: vi.fn(),
        }),
        defineStepToTest({
            parent: scenario,
            stepDetails: 'when',
            stepType: StepTypes.WHEN,
            scenarioStepCallback: vi.fn(),
        }),
    )

    expect(
        orderStepsToRun(scenario, stepsToRun).map((s) => s.step.getTitle()),
    ).toEqual(scenario.steps.map((s) => s.getTitle()))
})
