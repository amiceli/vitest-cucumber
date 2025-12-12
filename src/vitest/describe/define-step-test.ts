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
    // Don't extract params here - pattern expressions like {string} can't be
    // matched against themselves. Params will be extracted in orderStepsToRun
    // when matching against actual feature file steps.

    return {
        key: foundStep.getTitle(),
        fn: scenarioStepCallback,
        step: foundStep,
        params: [
            foundStep.dataTables.length > 0 ? foundStep.dataTables : null,
            foundStep.docStrings,
        ].filter((p) => p !== null),
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

export function updatePredefinedStepsAccordingLevel(steps: {
    globallyPredefinedSteps: ScenarioSteps[]
    featurePredefinedSteps: ScenarioSteps[]
    rulePredefinedSteps: ScenarioSteps[]
}): ScenarioSteps[] {
    const finallySteps = steps.rulePredefinedSteps

    finallySteps.push(
        ...steps.featurePredefinedSteps.filter((featureStep) => {
            return (
                finallySteps.find((s) => {
                    return (
                        s.step.type === featureStep.step.type &&
                        s.step.details === featureStep.step.details
                    )
                }) === undefined
            )
        }),
    )
    finallySteps.push(
        ...steps.globallyPredefinedSteps.filter((globalStep) => {
            return (
                finallySteps.find((s) => {
                    return (
                        s.step.type === globalStep.step.type &&
                        s.step.details === globalStep.step.details
                    )
                }) === undefined
            )
        }),
    )

    return finallySteps
}

export function orderStepsToRun(
    parent: Scenario | Background,
    steps: ScenarioSteps[],
): ScenarioSteps[] {
    const orderedSteps: ScenarioSteps[] = []

    for (const featureStep of parent.steps) {
        const defineStep = steps.find((s) => {
            // Check type match first
            if (s.step.type !== featureStep.type) {
                return false
            }

            // Exact match
            if (s.step.details === featureStep.details) {
                return true
            }

            // Expression match: pattern in defined step, actual value in feature step
            if (ExpressionStep.stepContainsRegex(s.step.details)) {
                try {
                    ExpressionStep.matchStep(featureStep, s.step.details)
                    return true
                } catch {
                    return false
                }
            }

            return false
        })

        if (defineStep) {
            // Mark the feature step as called
            featureStep.isCalled = true

            // For shared steps with expression patterns, extract params now
            // (they couldn't be extracted at registration time)
            // For inline steps, params were already extracted in defineStepToTest
            const isSharedStepWithPattern =
                ExpressionStep.stepContainsRegex(defineStep.step.details) &&
                defineStep.step.details !== featureStep.details

            if (isSharedStepWithPattern) {
                const params = ExpressionStep.matchStep(
                    featureStep,
                    defineStep.step.details,
                )
                orderedSteps.push({
                    ...defineStep,
                    params: [
                        ...params,
                        featureStep.dataTables.length > 0
                            ? featureStep.dataTables
                            : null,
                        featureStep.docStrings,
                    ].filter((p) => p !== null),
                })
            } else {
                // Inline step - keep existing params
                orderedSteps.push(defineStep)
            }
        }
    }

    return orderedSteps
}
