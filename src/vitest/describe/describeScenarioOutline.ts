import {
    beforeAll, afterAll, test,
    TaskContext,
} from "vitest"
import { Example, ScenarioOutline } from "../../parser/scenario"
import {
    StepTest, MaybePromise, StepCallbackDefinition,
} from "../types"
import { ScenarioSteps, StepMap } from "./common"

type DescribeScenarioArgs = {
    scenario: ScenarioOutline,
    scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise,
    beforeEachScenarioHook: () => MaybePromise
    afterEachScenarioHook: () => MaybePromise
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
            scenarioStepCallback: (ctx : TaskContext) => void,
        ) => {
            const foundStep = scenario.checkIfStepExists(stepType, stepDetails)

            foundStep.isCalled = true
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

            scenario.checkIfStepWasCalled()

            return (
                (steps) => function scenarioOutlineDescribe () {
                    beforeAll(async () => {
                        await beforeEachScenarioHook()
                    })

                    afterAll(async () => {
                        await afterEachScenarioHook()
                    })

                    test.for(
                        steps.map((s) : StepMap => {
                            return [
                                scenario.getStepTitle(s.step, exampleVariables),
                                s,
                            ]
                        }),
                    )(`%s`, async ([,scenarioStep], ctx) => {
                        await scenarioStep.fn(ctx)
                    })
                }
            )([...scenarioStepsToRun])
        })
    } else {
        return []
    }
}