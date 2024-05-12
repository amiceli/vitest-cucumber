import {
    beforeAll, afterAll, test,
} from "vitest"
import {
    StepTest, MaybePromise, StepCallbackDefinition,
} from "../types"
import { Step, StepTypes } from "../../parser/step"
import { Scenario } from "../../parser/scenario"

type DescribeScenarioArgs = {
    scenario : Scenario,
    scenarioTestCallback: (op: StepTest) => MaybePromise,
    beforeEachScenarioHook : () => MaybePromise
    afterEachScenarioHook : () => MaybePromise
}

type ScenarioSteps = {
    fn : () => MaybePromise
    step : Step
}

export function createScenarioDescribeHandler (
    { 
        scenario,
        scenarioTestCallback, 
        afterEachScenarioHook,
        beforeEachScenarioHook,
    } : DescribeScenarioArgs,
) : () => void {
    const scenarioStepsToRun: ScenarioSteps[] = []

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
            
    scenarioTestCallback(scenarioStepsCallback)

    scenario.checkMissingSteps(
        scenarioStepsToRun.map((s) => s.step),
    )

    return function scenarioDescribe () {
        beforeAll(async () => {
            await beforeEachScenarioHook()
        })

        afterAll(async () => {
            scenario.isCalled = true

            await afterEachScenarioHook()
        })

        test.each(
            scenarioStepsToRun.map((s) => {
                return [
                    s.step.toString(),
                    s,
                ]
            }),
        )(`%s`, async (_, scenarioStep) => {
            await scenarioStep.fn()
        })
    }
}