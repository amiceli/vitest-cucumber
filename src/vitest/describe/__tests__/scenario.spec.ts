import { describe, expect, test, vi } from 'vitest'
import { Scenario, ScenarioOutline } from '../../../parser/models/scenario'
import { Step, StepTypes } from '../../../parser/models/step'
import { createScenarioDescribeHandler } from '../describe-scenario'
import { createScenarioOutlineDescribeHandler } from '../describe-scenario-outline'

describe(`describeScenario`, () => {
    const each = vi.spyOn(test, `for`)
    const scenario = new Scenario(`test`)
    scenario.addStep(new Step(StepTypes.GIVEN, `given`))

    const scenarioTest = createScenarioDescribeHandler({
        scenario,
        predefinedSteps: [],
        scenarioTestCallback: ({ Given }) => {
            Given(`given`, () => {})
        },
        beforeEachScenarioHook: () => {},
        afterEachScenarioHook: () => {
            expect(each).toHaveBeenCalledWith([
                expect.arrayContaining([
                    `Given given`,
                    expect.objectContaining({
                        fn: expect.any(Function),
                        key: `Given given`,
                        step: expect.any(Step),
                    }),
                ]),
            ])
        },
    })

    scenarioTest()
})

describe(`describeScenarioOutline`, () => {
    const each = vi.spyOn(test, `for`)

    const scenario = new ScenarioOutline(`test`)
    scenario.examples.push({ test: `test` }, { test: `test 2` })
    scenario.addStep(new Step(StepTypes.GIVEN, `given <test>`))

    const scenarioTest = createScenarioOutlineDescribeHandler({
        scenario,
        scenarioTestCallback: ({ Given }) => {
            Given(`given <test>`, () => {})
        },
        beforeEachScenarioHook: () => {},
        afterEachScenarioHook: () => {
            expect(each).toHaveBeenCalledWith([
                expect.arrayContaining([
                    `Given given test`,
                    expect.objectContaining({
                        fn: expect.any(Function),
                        key: `Given given <test>`,
                        step: expect.any(Step),
                    }),
                ]),
            ])
            expect(each).toHaveBeenCalledWith([
                expect.arrayContaining([
                    `Given given test 2`,
                    expect.objectContaining({
                        fn: expect.any(Function),
                        key: `Given given <test>`,
                        step: expect.any(Step),
                    }),
                ]),
            ])
        },
    })

    for (const cb of scenarioTest) {
        cb()
    }
})
