import { describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import { setVitestCucumberConfiguration } from '../configuration'
import { describeFeature } from '../describe-feature'

let onTestFailedCallback: (args: unknown) => void = () => {}

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
        setVitestCucumberConfiguration({ onStepError })

        describeFeature(feature, (f) => {
            f.Scenario('Simple scenario', (s) => {
                s.Given('I throw an error', () => {
                    onTestFailedCallback({})
                    onTestFailedCallback({
                        errors: [{ message: 'epic fail !' }],
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
})
