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
    const thenStep = new Step(StepTypes.THEN, `then`)

    scenario.addStep(thenStep)

    const scenarioTest = createScenarioDescribeHandler({
        scenario,
        scenarioTestCallback : ({ Then }) => {
            Then(`then`, () => {})
        },
        beforeEachScenarioHook : () => {},
        afterEachScenarioHook : () => {
            expect(each).toHaveBeenCalledWith(
                [
                    expect.arrayContaining([
                        thenStep.toString(),
                        expect.objectContaining({
                            fn : expect.any(Function),
                            step : thenStep,
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
    const givenStep = new Step(StepTypes.GIVEN, `given <test>`)
    scenario.addStep(givenStep)

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
                        givenStep.toString(),
                        expect.objectContaining({
                            fn : expect.any(Function),
                            step : givenStep,
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