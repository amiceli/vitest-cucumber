import { test } from 'vitest'
import { ExpressionStep } from '../../parser/expression/ExpressionStep'
import type { Background } from '../../parser/models/Background'
import type {
    BackgroundStepTest,
    CallbackWithParamsAndContext,
    CallbackWithSingleContext,
    MaybePromise,
    StepCallbackDefinition,
} from '../types'
import type { ScenarioSteps, StepMap } from './common'

type DescribeScenarioArgs = {
    background: Background
    backgroundCallback: (op: BackgroundStepTest) => MaybePromise
}

export function createBackgroundDescribeHandler({
    background,
    backgroundCallback,
}: DescribeScenarioArgs): () => void {
    const backgroundStepsToRun: ScenarioSteps[] = []

    const createScenarioStepCallback = (
        stepType: string,
    ): StepCallbackDefinition => {
        return (
            stepDetails: string,
            scenarioStepCallback:
                | CallbackWithSingleContext
                | CallbackWithParamsAndContext,
        ) => {
            const foundStep = background.checkIfStepExists(
                stepType,
                stepDetails,
            )
            const params: unknown[] = ExpressionStep.matchStep(
                foundStep,
                stepDetails,
            )

            foundStep.isCalled = true

            backgroundStepsToRun.push({
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

    const scenarioStepsCallback: BackgroundStepTest = {
        Given: createScenarioStepCallback(`Given`),
        And: createScenarioStepCallback(`And`),
    }

    backgroundCallback(scenarioStepsCallback)

    background.checkIfStepWasCalled()

    return function backgroundDescribe() {
        test.for(
            backgroundStepsToRun.map((s): StepMap => {
                return [s.key, s]
            }),
        )(`%s`, async ([, scenarioStep], ctx) => {
            await scenarioStep.fn(ctx, ...scenarioStep.params)
        })
    }
}
