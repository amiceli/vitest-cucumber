import { customExpressionRegEx } from '../../parser/expression/custom'
import {
    builtInExpressionRegEx,
    ExpressionStep,
} from '../../parser/expression/ExpressionStep'
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
import type { CompiledPattern, ScenarioSteps } from './types'

function compilePattern(pattern: string): CompiledPattern | undefined {
    const allExpressionRegEx = builtInExpressionRegEx.concat(
        customExpressionRegEx,
    )

    const hasExpressions = allExpressionRegEx.some((r) =>
        pattern.includes(r.keyword),
    )

    if (!hasExpressions) {
        return undefined
    }

    let regexString = pattern
    const groupCount: {
        [key: string]: number
    } = {}

    regexString = regexString.replace(/[?]/g, '\\$&')

    for (const r of allExpressionRegEx) {
        r.resetExpressionStates()
        groupCount[r.groupName] = 0
    }

    for (const r of allExpressionRegEx) {
        regexString = regexString.replace(r.keywordRegex, (originalRegex) => {
            groupCount[r.groupName] += 1
            return r.getRegex(groupCount[r.groupName], originalRegex)
        })
    }

    regexString = `^${regexString}$`

    return {
        regex: new RegExp(regexString, 'g'),
        originalPattern: pattern,
    }
}

export function defineSharedStep(
    type: StepTypes,
    name: string,
    scenarioStepCallback: ScenarioSteps['fn'],
): ScenarioSteps {
    const foundStep = new Step(type, name)
    const compiledPattern = compilePattern(name)

    return {
        key: foundStep.getTitle(),
        fn: scenarioStepCallback,
        step: foundStep,
        params: [
            foundStep.dataTables.length > 0 ? foundStep.dataTables : null,
            foundStep.docStrings,
        ].filter((p) => p !== null),
        compiledPattern,
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

    for (const step of parent.steps) {
        const defineStep = steps.find((s) => s.step.matchStep(step))

        if (defineStep) {
            orderedSteps.push(defineStep)
        }
    }

    return orderedSteps
}
