import type { TaskContext } from 'vitest'
import { type Step, StepTypes } from '../parser/models/step'
import { defineSharedStep } from './describe/define-step-test'
import type { ScenarioSteps } from './describe/types'
import type { DefineStepsHandler } from './types'

export type TagFilterItem = string | string[]

export type TagFilters = {
    includeTags: TagFilterItem[]
    excludeTags: TagFilterItem[]
}

export type VitestCucumberOptions = {
    language?: string
    includeTags?: TagFilterItem[]
    excludeTags?: TagFilterItem[]
    predefinedSteps: ScenarioSteps[]
    onStepError?: (args: {
        error: Error
        ctx: TaskContext
        step: Step
    }) => void
}

export type RequiredVitestCucumberOptions = Required<VitestCucumberOptions>

function getDefaultConfiguration(): VitestCucumberOptions {
    return {
        language: 'en',
        includeTags: [],
        excludeTags: ['ignore'],
        onStepError: ({ error }) => {},
        predefinedSteps: [],
    }
}

let globalConfiguration: VitestCucumberOptions = {} as VitestCucumberOptions

export const getVitestCucumberConfiguration = (
    options?: VitestCucumberOptions,
) => {
    const defaultConfiguration = getDefaultConfiguration()

    // @ts-ignore
    if (typeof window !== 'undefined') {
        defaultConfiguration.includeTags?.push(
            // @ts-ignore
            ...(import.meta.env.VITEST_INCLUDE_TAGS?.split(' ') || []),
        )
        defaultConfiguration.excludeTags?.push(
            // @ts-ignore
            ...(import.meta.env.VITEST_EXCLUDE_TAGS?.split(' ') || []),
        )
    } else {
        defaultConfiguration.includeTags?.push(
            ...(process.env.VITEST_INCLUDE_TAGS?.split(' ') || []),
        )
        defaultConfiguration.excludeTags?.push(
            ...(process.env.VITEST_EXCLUDE_TAGS?.split(' ') || []),
        )
    }

    const mergedOptions = {
        ...defaultConfiguration,
        ...globalConfiguration,
        ...(options || {}),
    }

    return mergedOptions as RequiredVitestCucumberOptions
}

export const setVitestCucumberConfiguration = (
    options: VitestCucumberOptions,
) => {
    globalConfiguration = options
}

export const defineSteps: DefineStepsHandler = (defineStepsCallback) => {
    defineStepsCallback({
        Given: (name, callback) => {
            globalConfiguration.predefinedSteps.push(
                defineSharedStep(StepTypes.GIVEN, name, callback),
            )
        },
        And: (name, callback) => {
            globalConfiguration.predefinedSteps.push(
                defineSharedStep(StepTypes.AND, name, callback),
            )
        },
        Then: (name, callback) => {
            globalConfiguration.predefinedSteps.push(
                defineSharedStep(StepTypes.THEN, name, callback),
            )
        },
        When: (name, callback) => {
            globalConfiguration.predefinedSteps.push(
                defineSharedStep(StepTypes.WHEN, name, callback),
            )
        },
        But: (name, callback) => {
            globalConfiguration.predefinedSteps.push(
                defineSharedStep(StepTypes.BUT, name, callback),
            )
        },
    })
}
