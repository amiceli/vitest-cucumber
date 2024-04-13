import {
    afterAll, describe, test, 
} from "vitest"
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
    key : string
    fn : () => MaybePromise
    step : Step
}

export function describeBackground (
    { 
        background,
        backgroundCallback, 
    } : DescribeScenarioArgs,
) : () => void {
    const scenarioStepsToRun : ScenarioSteps[]  = []

    const createScenarioStepCallback = (stepType: string): StepCallbackDefinition => {
        return (
            stepDetails: string, 
            scenarioStepCallback: () => void,
        ) => {
            const foundStep = ScenarioStateDetector
                .forScenario(background)
                .checkIfStepExists(stepType, stepDetails)
 
            scenarioStepsToRun.push({
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

    return function backgroundDescribe () {
        describe(`Background`, () => {
            afterAll(async () => {
                detectUncalledScenarioStep(background)
    
                background.isCalled = true
            })

            test.each(scenarioStepsToRun)(`$key`, async (scenarioStep) => {
                await scenarioStep.fn()
                scenarioStep.step.isCalled = true
            })
        })
    }
}