import { onTestFailed, test } from 'vitest'
import type { Background } from '../../parser/models/Background'
import { getVitestCucumberConfiguration } from '../configuration'
import type {
    BackgroundStepTest,
    CallbackWithParamsAndContext,
    CallbackWithSingleContext,
    MaybePromise,
    StepCallbackDefinition,
} from '../types'
import { defineStepToTest } from './define-step-test'
import type { ScenarioSteps, StepMap } from './types'

type DescribeScenarioArgs = {
    background: Background
    predefinedSteps: ScenarioSteps[]
    backgroundCallback: (op: BackgroundStepTest) => MaybePromise
}

export function createBackgroundDescribeHandler({
    background,
    predefinedSteps,
    backgroundCallback,
}: DescribeScenarioArgs): () => void {
    const backgroundStepsToRun: ScenarioSteps[] = []
    const config = getVitestCucumberConfiguration()

    for (const predefineStep of predefinedSteps) {
        try {
            backgroundStepsToRun.push(
                defineStepToTest({
                    parent: background,
                    stepDetails: predefineStep.step.details,
                    stepType: predefineStep.step.type,
                    scenarioStepCallback: predefineStep.fn,
                }),
            )
        } catch {
            // handle predefined step not in this background
        }
    }

    const createScenarioStepCallback = (
        stepType: string,
    ): StepCallbackDefinition => {
        return (
            stepDetails: string,
            scenarioStepCallback:
                | CallbackWithSingleContext
                | CallbackWithParamsAndContext,
        ) => {
            backgroundStepsToRun.push(
                defineStepToTest({
                    parent: background,
                    stepDetails,
                    stepType,
                    scenarioStepCallback,
                }),
            )
        }
    }

    const scenarioStepsCallback: BackgroundStepTest = {
        Given: createScenarioStepCallback(`Given`),
        And: createScenarioStepCallback(`And`),
        context: {},
    }

    backgroundCallback(scenarioStepsCallback)

    background.checkIfStepWasCalled()

    return function backgroundDescribe() {
        test.for(
            backgroundStepsToRun.map((s): StepMap => {
                return [s.key, s]
            }),
        )(`%s`, async ([, scenarioStep], ctx) => {
            onTestFailed((e) => {
                const message = e.errors?.at(0)?.message

                config.onStepError({
                    error: new Error(
                        message || `${scenarioStep.step.details} failed`,
                    ),
                    ctx,
                    step: scenarioStep.step,
                })
            })
            await scenarioStep.fn(ctx, ...scenarioStep.params)
        })
    }
}
