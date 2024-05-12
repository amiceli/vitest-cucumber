import {
    beforeAll, afterAll, test,
} from "vitest"
import { Example, ScenarioOutline } from "../../parser/scenario"
import { Step, StepTypes } from "../../parser/step"
import {
    StepTest, MaybePromise, StepCallbackDefinition,
} from "../types"

type DescribeScenarioArgs = {
    scenario: ScenarioOutline,
    scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise,
    beforeEachScenarioHook: () => MaybePromise
    afterEachScenarioHook: () => MaybePromise
}

type ScenarioSteps = {
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

    const createScenarioStepCallback = (stepType: StepTypes): StepCallbackDefinition => {
        return (
            stepDetails: string,
            scenarioStepCallback: () => void,
        ) => {
            const foundStep = scenario.findStep(stepType, stepDetails)

            scenarioStepsToRun.push({
                fn : scenarioStepCallback,
                step : foundStep,
            })

        }
    }

    const scenarioStepsCallback: StepTest = {
        Given : createScenarioStepCallback(StepTypes.GIVEN),
        When : createScenarioStepCallback(StepTypes.WHEN),
        And : createScenarioStepCallback(StepTypes.AND),
        Then : createScenarioStepCallback(StepTypes.THEN),
        But : createScenarioStepCallback(StepTypes.BUT),
    }

    const example = scenario.examples

    if (example) {
        return example?.map((exampleVariables) => {
            scenarioStepsToRun = []
            scenarioTestCallback(scenarioStepsCallback, exampleVariables)

            scenario.checkMissingSteps(
                scenarioStepsToRun.map((s) => s.step),
            )

            return (
                (steps) => function scenarioOutlineDescribe () {
                    beforeAll(async () => {
                        await beforeEachScenarioHook()
                    })

                    afterAll(async () => {
                        scenario.isCalled = true

                        await afterEachScenarioHook()
                    })

                    test.each(
                        steps.map((s) => {
                            return [
                                s.step.toString(),
                                s,
                            ]
                        }),
                    )(`%s`, async (_, scenarioStep) => {
                        await scenarioStep.fn()
                    })
                }
            )([...scenarioStepsToRun])
        })
    } else {
        return []
    }
}