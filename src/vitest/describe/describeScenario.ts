import {
    beforeAll, afterAll, test,
} from "vitest"
import {
    StepTest, MaybePromise, StepCallbackDefinition,
} from "../types"
import { Step } from "../../parser/step"
import { Scenario } from "../../parser/scenario"
import { ScenarioStateDetector } from "../state-detectors/ScenarioStateDetector"
import { detectUncalledScenarioStep } from "./teardowns"

type DescribeScenarioArgs = {
    scenario : Scenario,
    scenarioTestCallback: (op: StepTest) => MaybePromise,
    beforeEachScenarioHook : () => MaybePromise
    afterEachScenarioHook : () => MaybePromise
}

type ScenarioSteps = {
    key : string
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
    const scenarioStepsToRun : ScenarioSteps[]  = []

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
            
    scenarioTestCallback(scenarioStepsCallback)

    return function scenarioDescribe () {
        beforeAll(async () => {
            await beforeEachScenarioHook()
        })

        afterAll(async () => {
            detectUncalledScenarioStep(scenario)

            scenario.isCalled = true

            await afterEachScenarioHook()
        })

        test.each(
            scenarioStepsToRun.map((s) => {
                return [
                    s.key,
                    s,
                ]
            }),
        )(`%s`, async (_, scenarioStep) => {
            await scenarioStep.fn()
            scenarioStep.step.isCalled = true
        })
    }
}