import { afterAll, beforeAll, onTestFailed, test } from 'vitest'
import { ExpressionStep } from '../../parser/expression/ExpressionStep'
import type { Example, ScenarioOutline } from '../../parser/models/scenario'
import { getVitestCucumberConfiguration } from '../configuration'
import type {
    CallbackWithParamsAndContext,
    CallbackWithSingleContext,
    MaybePromise,
    StepCallbackDefinition,
    StepTest,
} from '../types'
import type { ScenarioSteps, StepMap } from './types'

type DescribeScenarioArgs = {
    scenario: ScenarioOutline
    scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise
    beforeEachScenarioHook: () => MaybePromise
    afterEachScenarioHook: () => MaybePromise
}

export function createScenarioOutlineDescribeHandler({
    scenario,
    scenarioTestCallback,
    afterEachScenarioHook,
    beforeEachScenarioHook,
}: DescribeScenarioArgs): Array<() => void> {
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

    const example = scenario.examples

    if (example) {
        return example?.map((exampleVariables) => {
            scenarioStepsToRun = []
            scenarioTestCallback(scenarioStepsCallback, exampleVariables)

            scenario.checkIfStepWasCalled()

            return ((steps) =>
                function scenarioOutlineDescribe() {
                    beforeAll(async () => {
                        await beforeEachScenarioHook()
                    })

                    afterAll(async () => {
                        await afterEachScenarioHook()
                    })

                    test.for(
                        steps.map((s): StepMap => {
                            return [
                                scenario.getStepTitle(s.step, exampleVariables),
                                s,
                            ]
                        }),
                    )(`%s`, async ([, scenarioStep], ctx) => {
                        if (scenarioStep.step.docStrings) {
                            scenarioStep.params[
                                scenarioStep.params.length - 1
                            ] = scenario.getStepDocStrings(
                                scenarioStep.step,
                                exampleVariables,
                            )
                        }
                        onTestFailed((e) => {
                            const message = e.errors?.at(0)?.message

                            config.onStepError({
                                error: new Error(
                                    message ||
                                        `${scenarioStep.step.details} failed`,
                                ),
                                ctx,
                                step: scenarioStep.step,
                            })
                        })

                        await scenarioStep.fn(ctx, ...scenarioStep.params)
                    })
                })([...scenarioStepsToRun])
        })
    }

    return []
}
