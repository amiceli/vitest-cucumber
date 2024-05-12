import { afterAll, test } from "vitest"
import {
    MaybePromise, StepCallbackDefinition, BackgroundStepTest,
} from "../types"
import { Step, StepTypes } from "../../parser/step"
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
    const backgroundStepsToRun: ScenarioSteps[] = []

    const createScenarioStepCallback = (stepType: StepTypes): StepCallbackDefinition => {
        return (
            stepDetails: string, 
            scenarioStepCallback: () => void,
        ) => {
            const foundStep = background.findStep(stepType, stepDetails)

            backgroundStepsToRun.push({
                fn : scenarioStepCallback,
                step : foundStep,
            })
        }
    }

    const scenarioStepsCallback: BackgroundStepTest = {
        Given : createScenarioStepCallback(StepTypes.GIVEN),
        And : createScenarioStepCallback(StepTypes.AND),
    }
            
    backgroundCallback(scenarioStepsCallback)

    background.checkMissingSteps(
        backgroundStepsToRun.map((s) => s.step),
    )

    return function backgroundDescribe () {
        afterAll(() => {
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
        })
    }
}