import { afterAll, beforeAll, onTestFailed, test } from 'vitest'
import type { Scenario } from '../../parser/models/scenario'
import { getVitestCucumberConfiguration } from '../configuration'
import type {
    CallbackWithParamsAndContext,
    CallbackWithSingleContext,
    MaybePromise,
    StepCallbackDefinition,
    StepTest,
} from '../types'
import { defineStepToTest } from './define-step-test'
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
    const scenarioStepsToRun: ScenarioSteps[] = []
    const config = getVitestCucumberConfiguration()

    for (const predefineStep of predefinedSteps) {
        try {
            scenarioStepsToRun.push(
                defineStepToTest({
                    parent: scenario,
                    stepDetails: predefineStep.step.details,
                    stepType: predefineStep.step.type,
                    scenarioStepCallback: predefineStep.fn,
                }),
            )
        } catch {
            // handle predefined step not in this scenario
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
