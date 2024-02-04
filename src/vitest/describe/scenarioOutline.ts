import {
    beforeAll, afterAll, describe, test,
} from "vitest"
import { Example, ScenarioOutline } from "../../parser/scenario"
import { Step } from "../../parser/step"
import {
    StepTest, MaybePromise, StepCallbackDefinition,
} from "../types"
import { ScenarioStateDetector } from "../state-detectors/ScenarioStateDetector"

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

export function describeScenarioOutline (
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
                    describe(scenario.description, () => {
                        beforeAll(() => {
                            beforeEachScenarioHook()
                        })

                        afterAll(() => {
                            ScenarioStateDetector
                                .forScenario(scenario)
                                .checkIfStepWasCalled()

                            scenario.isCalled = true

                            afterEachScenarioHook()
                        })

                        test.each(steps)(`$key`, async (scenarioStep) => {
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