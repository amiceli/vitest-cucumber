import { afterAll, test } from "vitest"
import {
    MaybePromise, StepCallbackDefinition, BackgroundStepTest,
} from "../types"
import { Step } from "../../parser/step"
import { ScenarioStateDetector } from "../state-detectors/ScenarioStateDetector"
import { detectUncalledScenarioStep } from "./teardowns"
import { Background } from "../../parser/Background"

type DescribeScenarioArgs = {
    background : Background,
    backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
}

type ScenarioSteps = {
    fn : () => MaybePromise
    step : Step
}

export function createBackgroundDescribeHandler (
    { 
        background,
        backgroundCallback, 
    } : DescribeScenarioArgs,
) : () => void {
    const backgroundStepsToRun : ScenarioSteps[]  = []

    const createScenarioStepCallback = (stepType: string): StepCallbackDefinition => {
        return (
            stepDetails: string, 
            scenarioStepCallback: () => void,
        ) => {
            const foundStep = ScenarioStateDetector
                .forScenario(background)
                .checkIfStepExists(stepType, stepDetails)
 
            backgroundStepsToRun.push({
                fn : scenarioStepCallback,
                step : foundStep,
            })
        }
    }

    const scenarioStepsCallback: BackgroundStepTest = {
        Given : createScenarioStepCallback(`Given`),
        And : createScenarioStepCallback(`And`),
    }
            
    backgroundCallback(scenarioStepsCallback)

    return function backgroundDescribe () {
        afterAll(async () => {
            detectUncalledScenarioStep(background)

            background.isCalled = true
        })

        test.each(
            backgroundStepsToRun.map((s) => {
                return [
                    s.step.toString(),
                    s,
                ]
            }),
        )(`%s`, async (_, scenarioStep) => {
            await scenarioStep.fn()
            scenarioStep.step.isCalled = true
        })
    }
}