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
import { defineStepToTest, orderStepsToRun } from './define-step-test'
import type { ScenarioSteps, StepMap } from './types'

type DescribeScenarioArgs = {
    scenario: ScenarioOutline
    predefinedSteps: ScenarioSteps[]
    scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise
    beforeEachScenarioHook: () => MaybePromise
    afterEachScenarioHook: () => MaybePromise
    mappedExamples: {
        [key: string]: unknown
    }
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

    function addPredefinedSteps(
        list: ScenarioSteps[],
        exampleVars: {
            [key: string]: unknown
        },
    ) {
        const missingSteps = scenario.steps.filter((step) => {
            return (
                scenarioStepsToRun.find((s) => {
                    return step.matchStep(s.step)
                }) === undefined
            )
        })

        for (const predefineStep of list) {
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

                const substitutedParams = params.map((param) => {
                    if (typeof param === 'string') {
                        let result = param
                        for (const [key, value] of Object.entries(
                            exampleVars,
                        )) {
                            result = result.replace(`<${key}>`, String(value))
                        }
                        return result
                    }
                    return param
                })

                scenarioStepsToRun.push({
                    key: missingStep.getTitle(),
                    fn: predefineStep.fn,
                    step: missingStep,
                    params: [
                        ...substitutedParams,
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
                    return [
                        index,
                        mappedExamples[value] ?? value,
                    ]
                }),
            )

            scenarioStepsToRun = []
            scenarioTestCallback(scenarioStepsCallback, mappedExampleVariables)

            addPredefinedSteps(predefinedSteps, mappedExampleVariables)

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
                                mappedExampleVariables,
                            )
                        }
                        onTestFailed(({ task }) => {
                            const message = task.result?.errors?.at(0)?.message

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
                })([
                ...scenarioStepsToRun,
            ])
        })
    }

    return []
}
