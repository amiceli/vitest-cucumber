import {
    describe, expect, vi, test,
} from 'vitest'
import { Scenario, ScenarioOutline } from '../../../parser/scenario'
import { Step, StepTypes } from '../../../parser/step'
import { createScenarioDescribeHandler } from '../describeScenario'
import { createScenarioOutlineDescribeHandler } from '../describeScenarioOutline'

describe(`describeScenario`, () => {

    const each = vi.spyOn(test, `each`)
    const scenario = new Scenario(`test`)
    scenario.addStep(new Step(StepTypes.GIVEN, `given`))

    const scenarioTest = createScenarioDescribeHandler({
        scenario,
        scenarioTestCallback : ({ Given }) => {
            Given(`given`, () => {})
        },
        beforeEachScenarioHook : () => {},
        afterEachScenarioHook : () => {
            expect(each).toHaveBeenCalledWith(
                [
                    expect.arrayContaining([
                        `Given given`,
                        expect.objectContaining({
                            fn : expect.any(Function),
                            key : `Given given`,
                            step : expect.any(Step),
                        }),
                    ]),
                ],
            )
        },
    })

    scenarioTest()
})

describe(`describeScenarioOutline`, () => {
    const each = vi.spyOn(test, `each`)

    const scenario = new ScenarioOutline(`test`)
    scenario.examples.push(
        { test : `test` },
        { test : `test 2` },
    )
    scenario.addStep(new Step(StepTypes.GIVEN, `given <test>`))

    const scenarioTest = createScenarioOutlineDescribeHandler({
        scenario,
        scenarioTestCallback : ({ Given }) => {
            Given(`given <test>`, () => {})
        },
        beforeEachScenarioHook : () => {},
        afterEachScenarioHook : () => {
            expect(each).toHaveBeenCalledWith(
                [
                    expect.arrayContaining([
                        `Given given <test>`,
                        expect.objectContaining({
                            fn : expect.any(Function),
                            key : `Given given <test>`,
                            step : expect.any(Step),
                        }),
                    ]),
                ],
            )
        },
    })

    scenarioTest.forEach((cb) => {
        cb()
    })
})