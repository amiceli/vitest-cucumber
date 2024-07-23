import {
    beforeAll, afterAll, test,
    TaskContext,
} from "vitest"
import {
    StepTest, MaybePromise, StepCallbackDefinition,
} from "../types"
import { Scenario } from "../../parser/scenario"
import { ScenarioSteps, StepMap } from "./common"

type DescribeScenarioArgs = {
    scenario : Scenario,
    scenarioTestCallback: (op: StepTest) => MaybePromise,
    beforeEachScenarioHook : () => MaybePromise
    afterEachScenarioHook : () => MaybePromise
}

export function createScenarioDescribeHandler (
    { 
        scenario,
        scenarioTestCallback, 
        afterEachScenarioHook,
        beforeEachScenarioHook,
    } : DescribeScenarioArgs,
) : () => void {
    const scenarioStepsToRun : ScenarioSteps[]  = []

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
            
    scenarioTestCallback(scenarioStepsCallback)

    scenario.checkIfStepWasCalled()

    return function scenarioDescribe () {
        beforeAll(async () => {
            await beforeEachScenarioHook()
        })

        afterAll(async () => {
            await afterEachScenarioHook()
        })

        test.for(
            scenarioStepsToRun.map((s) : StepMap => {
                return [
                    s.key,
                    s,
                ]
            }),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        )(`%s`, async ([_, scenarioStep], ctx) => {
            await scenarioStep.fn(ctx)
        })
    }
}