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
import type { ScenarioSteps, StepMap } from './common'

type DescribeScenarioArgs = {
    scenario: Scenario
    scenarioTestCallback: (op: StepTest) => MaybePromise
    beforeEachScenarioHook: () => MaybePromise
    afterEachScenarioHook: () => MaybePromise
}

export function createScenarioDescribeHandler({
    scenario,
    scenarioTestCallback,
    afterEachScenarioHook,
    beforeEachScenarioHook,
}: DescribeScenarioArgs): () => void {
    const scenarioStepsToRun: ScenarioSteps[] = []
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
            const foundStep = scenario.checkIfStepExists(stepType, stepDetails)
            const params: unknown[] = ExpressionStep.matchStep(
                foundStep,
                stepDetails,
            )

            foundStep.isCalled = true

            scenarioStepsToRun.push({
                key: foundStep.getTitle(),
                fn: scenarioStepCallback,
                step: foundStep,
                params: [
                    ...params,
                    foundStep.dataTables.length > 0
                        ? foundStep.dataTables
                        : null,
                    foundStep.docStrings,
                ].filter((p) => p !== null),
            })
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
