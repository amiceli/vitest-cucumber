import {
    beforeAll, afterAll, describe, test,
} from "vitest"
import { Example, ScenarioOutline } from "../../parser/scenario"
import { Step } from "../../parser/step"
import {
    StepTest, MaybePromise, StepCallbackDefinition,
} from "../types"
import { ScenarioStateDetector } from "../state-detectors/ScenarioStateDetector"
import { detectUncalledScenarioStep } from "./teardowns"

type DescribeScenarioArgs = {
    scenario: ScenarioOutline,
    scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise,
    beforeEachScenarioHook: () => MaybePromise
    afterEachScenarioHook: () => MaybePromise
}

type ScenarioSteps = {
    key: string
    fn: () => MaybePromise
    step: Step
}

export function createScenarioOutlineDescribeHandler (
    {
        scenario,
        scenarioTestCallback,
        afterEachScenarioHook,
        beforeEachScenarioHook,
    }: DescribeScenarioArgs,
): Array<() => void> {
    let scenarioStepsToRun: ScenarioSteps[] = []

    const createScenarioStepCallback = (stepType: string): StepCallbackDefinition => {
        return (
            stepDetails: string,
            scenarioStepCallback: () => void,
        ) => {
            const foundStep = ScenarioStateDetector
                .forScenario(scenario)
                .checkIfStepExists(stepType, stepDetails)

            scenarioStepsToRun.push({
                key : `${stepType} ${stepDetails}`,
                fn : scenarioStepCallback,
                step : foundStep,
            })

        }
    }

    const scenarioStepsCallback: StepTest = {
        Given : createScenarioStepCallback(`Given`),
        When : createScenarioStepCallback(`When`),
        And : createScenarioStepCallback(`And`),
        Then : createScenarioStepCallback(`Then`),
        But : createScenarioStepCallback(`But`),
    }

    const example = scenario.examples

    if (example) {
        return example?.map((exampleVariables) => {
            scenarioStepsToRun = []
            scenarioTestCallback(scenarioStepsCallback, exampleVariables)

            return (
                (steps) => () => {
                    describe(`Scenario Outline: ${scenario.description}`, () => {
                        beforeAll(async () => {
                            await beforeEachScenarioHook()
                        })

                        afterAll(async () => {
                            detectUncalledScenarioStep(scenario)

                            scenario.isCalled = true

                            await afterEachScenarioHook()
                        })

                        test.each(
                            steps.map((s) => {
                                return [
                                    s.key,
                                    s,
                                ]
                            }),
                        )(`%s`, async (_, scenarioStep) => {
                            await scenarioStep.fn()
                            scenarioStep.step.isCalled = true
                        })
                    })
                }
            )([...scenarioStepsToRun])
        })
    } else {
        return []
    }
}