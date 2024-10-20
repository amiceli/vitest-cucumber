import type { TaskContext } from 'vitest'
import type { Step } from '../parser/models/step'

export type TagFilterItem = string | string[]

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

const defaultConfiguration: VitestCucumberOptions = {
    language: 'en',
    includeTags: [],
    excludeTags: ['ignore'],
    onStepError: ({ error }) => {
        throw error
    },
}

let globalConfiguration: VitestCucumberOptions = {} as VitestCucumberOptions

export const getVitestCucumberConfiguration = (
    options?: VitestCucumberOptions,
) => {
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
