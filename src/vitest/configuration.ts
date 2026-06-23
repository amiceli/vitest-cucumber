import type { TestContext } from 'vitest'
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
    mappedExamples: {
        [key: string]: unknown
    }
    onStepError?: (args: { error: Error; ctx: TestContext; step: Step }) => void
}

export type RequiredVitestCucumberOptions = Required<VitestCucumberOptions>

function getDefaultConfiguration(): VitestCucumberOptions {
    return {
        language: 'en',
        includeTags: [],
        excludeTags: [
            'ignore',
        ],
        onStepError: ({ error }) => {},
        predefinedSteps: [],
        mappedExamples: {},
    }
}

let globalConfiguration: VitestCucumberOptions = {
    predefinedSteps: [],
    mappedExamples: {},
} as VitestCucumberOptions

export const getVitestCucumberConfiguration = (
    options?: Omit<VitestCucumberOptions, 'predefinedSteps' | 'mappedExamples'>,
) => {
    const defaultConfiguration = getDefaultConfiguration()

    // @ts-expect-error import.meta.env only exists when bundled by Vite
    const importMetaEnv =
        typeof import.meta !== 'undefined' ? import.meta.env : undefined
    const processEnv = typeof process !== 'undefined' ? process.env : undefined

    defaultConfiguration.includeTags?.push(
        ...(importMetaEnv?.VITEST_INCLUDE_TAGS?.split(' ') ?? []),
        ...(processEnv?.VITEST_INCLUDE_TAGS?.split(' ') ?? []),
    )
    defaultConfiguration.excludeTags?.push(
        ...(importMetaEnv?.VITEST_EXCLUDE_TAGS?.split(' ') ?? []),
        ...(processEnv?.VITEST_EXCLUDE_TAGS?.split(' ') ?? []),
    )

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

export function resetDefinedSteps() {
    globalConfiguration.predefinedSteps = []
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
        Step: (name, callback) => {
            globalConfiguration.predefinedSteps.push(
                defineSharedStep(StepTypes.GENERIC, name, callback),
            )
        },
    })
}
