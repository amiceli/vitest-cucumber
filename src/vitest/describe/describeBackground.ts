import { test } from "vitest"
import {
    MaybePromise, StepCallbackDefinition, BackgroundStepTest,
} from "../types"
import { Step } from "../../parser/step"
import { ScenarioStateDetector } from "../state-detectors/ScenarioStateDetector"
import { Background } from "../../parser/Background"

type DescribeScenarioArgs = {
    background : Background,
    backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
}

type ScenarioSteps = {
    key : string
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
            
            foundStep.isCalled = true
 
            backgroundStepsToRun.push({
                key : `${stepType} ${stepDetails}`,
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

    background.checkIfStepWasCalled()

    return function backgroundDescribe () {
        test.each(
            backgroundStepsToRun.map((s) => {
                return [
                    s.key,
                    s,
                ]
            }),
        )(`%s`, async (_, scenarioStep) => {
            await scenarioStep.fn()
        })
    }
}