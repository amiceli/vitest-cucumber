import { beforeEach } from 'node:test'
import { describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import { setVitestCucumberConfiguration } from '../../configuration'
import { describeFeature } from '../../describe-feature'

let onTestFailedCallback: (args: unknown) => void = () => {}

beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
})

vi.mock('vitest', async () => {
    const actual = await vi.importActual<typeof import('vitest')>('vitest')
    return {
        ...actual,
        onTestFailed: vi.fn().mockImplementation((callback: () => void) => {
            onTestFailedCallback = callback
        }),
    }
})

describe('Use onStepError', () => {
    describe('Scenario', () => {
        const feature = FeatureContentReader.fromString([
            `Feature: onStepError options`,
            `   Scenario: Simple scenario`,
            `       Given I throw an error`,
            `       Then  my onStepError is called`,
        ]).parseContent()

        const onStepError = vi.fn()
        setVitestCucumberConfiguration({
            onStepError,
        })

        describeFeature(feature, (f) => {
            f.Scenario('Simple scenario', (s) => {
                s.Given('I throw an error', () => {
                    onTestFailedCallback({
                        task: {},
                    })
                    onTestFailedCallback({
                        task: {
                            result: {
                                errors: [
                                    {
                                        message: 'epic fail !',
                                    },
                                ],
                            },
                        },
                    })
                })
                s.Then('my onStepError is called', () => {
                    expect(onStepError).toHaveBeenCalledWith({
                        error: new Error('I throw an error failed'),
                        step: feature.scenarii[0]?.steps[0],
                        ctx: expect.any(Function),
                    })
                    expect(onStepError).toHaveBeenLastCalledWith({
                        error: new Error('epic fail !'),
                        step: feature.scenarii[0]?.steps[0],
                        ctx: expect.any(Function),
                    })
                })
            })
        })
    })

    describe('Background', () => {
        const feature = FeatureContentReader.fromString([
            `Feature: onStepError options on Background`,
            `   Background:`,
            `       Given I am a step`,
            `       And   onTestFailedCallback is called`,
            `   Scenario: finish`,
            `       Then I test called`,
        ]).parseContent()

        const onStepError = vi.fn()
        setVitestCucumberConfiguration({
            onStepError,
        })

        describeFeature(feature, (f) => {
            f.Background((s) => {
                s.Given('I am a step', () => {
                    onTestFailedCallback({
                        task: {},
                    })
                })
                s.And('onTestFailedCallback is called', () => {
                    onTestFailedCallback({
                        task: {
                            result: {
                                errors: [
                                    {
                                        message: 'test',
                                    },
                                ],
                            },
                        },
                    })
                })
            })
            f.Scenario('finish', (s) => {
                s.Then('I test called', () => {
                    expect(onStepError).toHaveBeenCalledWith({
                        error: new Error('I am a step failed'),
                        step: feature.background?.steps[0],
                        ctx: expect.any(Function),
                    })
                    expect(onStepError).toHaveBeenLastCalledWith({
                        error: new Error('test'),
                        step: feature.background?.steps[1],
                        ctx: expect.any(Function),
                    })
                })
            })
        })
    })

    describe('Scenario Outline', () => {
        const feature = FeatureContentReader.fromString([
            `Feature: onStepError options`,
            `   Scenario Outline: Simple scenario outline`,
            `       Given I throw an error`,
            `       Then  my onStepError <test> is called`,
            `       Examples:`,
            `           | test |`,
            `           | test |`,
        ]).parseContent()

        const onStepError = vi.fn()
        setVitestCucumberConfiguration({
            onStepError,
        })

        describeFeature(feature, (f) => {
            f.ScenarioOutline('Simple scenario outline', (s) => {
                s.Given('I throw an error', () => {
                    onTestFailedCallback({
                        task: {},
                    })
                    onTestFailedCallback({
                        task: {
                            result: {
                                errors: [
                                    {
                                        message: 'miss !',
                                    },
                                ],
                            },
                        },
                    })
                })
                s.Then('my onStepError <test> is called', () => {
                    expect(onStepError).toHaveBeenCalledWith({
                        error: new Error('I throw an error failed'),
                        step: feature.scenarii[0]?.steps[0],
                        ctx: expect.any(Function),
                    })
                    expect(onStepError).toHaveBeenLastCalledWith({
                        error: new Error('miss !'),
                        step: feature.scenarii[0]?.steps[0],
                        ctx: expect.any(Function),
                    })
                })
            })
        })
    })
})
