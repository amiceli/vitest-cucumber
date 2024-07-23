import { TaskContext, test } from "vitest"
import {
    MaybePromise, StepCallbackDefinition, BackgroundStepTest,
} from "../types"
import { Background } from "../../parser/Background"
import { ScenarioSteps, StepMap } from "./common"

type DescribeScenarioArgs = {
    background : Background,
    backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
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
            scenarioStepCallback: (ctx : TaskContext) => void,
        ) => {
            const foundStep = background.checkIfStepExists(stepType, stepDetails)
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
        test.for(
            backgroundStepsToRun.map((s) : StepMap => {
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