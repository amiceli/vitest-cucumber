export type VitestCucumberOptions = {
    language?: string
    excludeTags?: string[]
}

export type RequiredVitestCucumberOptions = Required<VitestCucumberOptions>

const defaultConfiguration: VitestCucumberOptions = {
    language: 'en',
    excludeTags: ['ignore'],
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
