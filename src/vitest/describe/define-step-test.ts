import { ExpressionStep } from '../../parser/expression/ExpressionStep'
import {
    type Background,
    type Scenario,
    Step,
    type StepTypes,
} from '../../parser/models'
import type {
    CallbackWithParamsAndContext,
    CallbackWithSingleContext,
} from '../types'
import type { ScenarioSteps } from './types'

export function defineSharedStep(
    type: StepTypes,
    name: string,
    scenarioStepCallback: ScenarioSteps['fn'],
): ScenarioSteps {
    const foundStep = new Step(type, name)
    return {
        key: foundStep.getTitle(),
        fn: scenarioStepCallback,
        step: foundStep,
        params: [],
    }
}

export function defineStepToTest(options: {
    stepType: string
    parent: Scenario | Background
    stepDetails: string
    scenarioStepCallback:
        | CallbackWithSingleContext
        | CallbackWithParamsAndContext
}): ScenarioSteps {
    const { parent, stepDetails, stepType, scenarioStepCallback } = options
    const foundStep = parent.checkIfStepExists(stepType, stepDetails)
    const params: unknown[] = ExpressionStep.matchStep(foundStep, stepDetails)

    foundStep.isCalled = true

    return {
        key: foundStep.getTitle(),
        fn: scenarioStepCallback,
        step: foundStep,
        params: [
            ...params,
            foundStep.dataTables.length > 0 ? foundStep.dataTables : null,
            foundStep.docStrings,
        ].filter((p) => p !== null),
    }
}
