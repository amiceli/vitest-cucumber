import type { TaskContext } from 'vitest'
import type { Step } from '../parser/models/step'

export type TagFilterItem = string | string[]

export type TagFilters = {
    includeTags: TagFilterItem[]
    excludeTags: TagFilterItem[]
}

export type VitestCucumberOptions = {
    language?: string
    includeTags?: TagFilterItem[]
    excludeTags?: TagFilterItem[]
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
    }
}

let globalConfiguration: VitestCucumberOptions = {} as VitestCucumberOptions

export const getVitestCucumberConfiguration = (
    options?: VitestCucumberOptions,
) => {
    const defaultConfiguration = getDefaultConfiguration()

    defaultConfiguration.includeTags?.push(
        ...(process.env.VITEST_INCLUDE_TAGS?.split(' ') || []),
    )
    defaultConfiguration.excludeTags?.push(
        ...(process.env.VITEST_EXCLUDE_TAGS?.split(' ') || []),
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
