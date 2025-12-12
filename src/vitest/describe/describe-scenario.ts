import { afterAll, beforeAll, onTestFailed, test } from 'vitest'
import { ExpressionStep } from '../../parser/expression/ExpressionStep'
import type { Scenario } from '../../parser/models/scenario'
import { getVitestCucumberConfiguration } from '../configuration'
import type {
    CallbackWithParamsAndContext,
    CallbackWithSingleContext,
    MaybePromise,
    StepCallbackDefinition,
    StepTest,
} from '../types'
import { defineStepToTest, orderStepsToRun } from './define-step-test'
import type { ScenarioSteps, StepMap } from './types'

type DescribeScenarioArgs = {
    scenario: Scenario
    predefinedSteps: ScenarioSteps[]
    scenarioTestCallback: (op: StepTest) => MaybePromise
    beforeEachScenarioHook: () => MaybePromise
    afterEachScenarioHook: () => MaybePromise
}

export function createScenarioDescribeHandler({
    scenario,
    predefinedSteps,
    scenarioTestCallback,
    afterEachScenarioHook,
    beforeEachScenarioHook,
}: DescribeScenarioArgs): () => void {
    let scenarioStepsToRun: ScenarioSteps[] = []
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
            scenarioStepsToRun.push(
                defineStepToTest({
                    parent: scenario,
                    stepDetails,
                    stepType,
                    scenarioStepCallback,
                }),
            )
        }
    }

    const scenarioStepsCallback: StepTest = {
        Given: createScenarioStepCallback(`Given`),
        When: createScenarioStepCallback(`When`),
        And: createScenarioStepCallback(`And`),
        Then: createScenarioStepCallback(`Then`),
        But: createScenarioStepCallback(`But`),
        context: {},
    }

    scenarioTestCallback(scenarioStepsCallback)

    const missingSteps = scenario.steps.filter((step) => {
        return (
            scenarioStepsToRun.find((s) => {
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

            scenarioStepsToRun.push({
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

    scenarioStepsToRun = orderStepsToRun(scenario, scenarioStepsToRun)

    scenario.checkIfStepWasCalled()

    return function scenarioDescribe() {
        beforeAll(async () => {
            await beforeEachScenarioHook()
        })

        afterAll(async () => {
            await afterEachScenarioHook()
        })

        test.for(
            scenarioStepsToRun.map((s): StepMap => {
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
