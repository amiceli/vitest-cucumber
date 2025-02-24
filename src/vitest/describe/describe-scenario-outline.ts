import { afterAll, beforeAll, onTestFailed, test } from 'vitest'
import type { Example, ScenarioOutline } from '../../parser/models/scenario'
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
    scenario: ScenarioOutline
    predefinedSteps: ScenarioSteps[]
    scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise
    beforeEachScenarioHook: () => MaybePromise
    afterEachScenarioHook: () => MaybePromise
    mappedExamples: { [key: string]: unknown }
}

export function createScenarioOutlineDescribeHandler({
    scenario,
    predefinedSteps,
    mappedExamples,
    scenarioTestCallback,
    afterEachScenarioHook,
    beforeEachScenarioHook,
}: DescribeScenarioArgs): Array<() => void> {
    let scenarioStepsToRun: ScenarioSteps[] = []
    const config = getVitestCucumberConfiguration()

    function addPredefinedSteps(list: ScenarioSteps[]) {
        const missingSteps = scenario.steps.filter((step) => {
            return (
                scenarioStepsToRun.find((s) => {
                    return step.matchStep(s.step)
                }) === undefined
            )
        })

        for (const predefineStep of list) {
            const missingStep = missingSteps.find((s) => {
                return s.matchStep(predefineStep.step)
            })

            if (missingStep) {
                scenarioStepsToRun.push(
                    defineStepToTest({
                        parent: scenario,
                        stepDetails: predefineStep.step.details,
                        stepType: predefineStep.step.type,
                        scenarioStepCallback: predefineStep.fn,
                    }),
                )
            }
        }

        scenarioStepsToRun = orderStepsToRun(scenario, scenarioStepsToRun)
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

    const example = scenario.examples

    if (example) {
        return example?.map((exampleVariables) => {
            const mappedExampleVariables = Object.fromEntries(
                Object.entries(exampleVariables).map(([index, value]) => {
                    return [index, mappedExamples[value] ?? value]
                }),
            )

            scenarioStepsToRun = []
            scenarioTestCallback(scenarioStepsCallback, mappedExampleVariables)

            addPredefinedSteps(predefinedSteps)

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
                                scenario.getStepTitle(
                                    s.step,
                                    mappedExampleVariables,
                                ),
                                s,
                            ]
                        }),
                    )(`%s`, async ([, scenarioStep], ctx) => {
                        if (scenarioStep.step.docStrings) {
                            scenarioStep.params[
                                scenarioStep.params.length - 1
                            ] = scenario.getStepDocStrings(
                                scenarioStep.step,
                                mappedExampleVariables,
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
