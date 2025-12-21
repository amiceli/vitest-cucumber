import { onTestFailed, test } from 'vitest'
import { ExpressionStep } from '../../parser/expression/ExpressionStep'
import type { Background } from '../../parser/models/Background'
import { getVitestCucumberConfiguration } from '../configuration'
import type {
    BackgroundStepTest,
    CallbackWithParamsAndContext,
    CallbackWithSingleContext,
    MaybePromise,
    StepCallbackDefinition,
} from '../types'
import { defineStepToTest, orderStepsToRun } from './define-step-test'
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
    let backgroundStepsToRun: ScenarioSteps[] = []
    const config = getVitestCucumberConfiguration()

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

    const missingSteps = background.steps.filter((step) => {
        return (
            backgroundStepsToRun.find((s) => {
                return step.matchStep(s.step)
            }) === undefined
        )
    })

    for (const predefineStep of predefinedSteps) {
        const matchingSteps = missingSteps.filter((featureStep) => {
            if (featureStep.type !== predefineStep.step.type) {
                return false
            }

            if (featureStep.details === predefineStep.step.details) {
                return true
            }

            if (predefineStep.compiledPattern) {
                predefineStep.compiledPattern.regex.lastIndex = 0
                return predefineStep.compiledPattern.regex.test(
                    featureStep.details,
                )
            }

            return false
        })

        for (const missingStep of matchingSteps) {
            const params = ExpressionStep.matchStep(
                missingStep,
                predefineStep.step.details,
            )

            backgroundStepsToRun.push({
                key: missingStep.getTitle(),
                fn: predefineStep.fn,
                step: missingStep,
                params: [
                    ...params,
                    missingStep.dataTables.length > 0
                        ? missingStep.dataTables
                        : null,
                    missingStep.docStrings,
                ].filter((p) => p !== null),
            })

            missingStep.isCalled = true
        }
    }

    backgroundStepsToRun = orderStepsToRun(background, backgroundStepsToRun)

    background.checkIfStepWasCalled()

    return function backgroundDescribe() {
        test.for(
            backgroundStepsToRun.map((s): StepMap => {
                return [
                    s.key,
                    s,
                ]
            }),
        )(`%s`, async ([, scenarioStep], ctx) => {
            onTestFailed(({ task }) => {
                const message = task.result?.errors?.at(0)?.message

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
